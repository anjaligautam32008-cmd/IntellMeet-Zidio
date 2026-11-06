import test from 'node:test';
import assert from 'node:assert';
import http from 'node:http';
import { createApp } from '../app.js';
import { connectDB } from '../config/db.js';
import mongoose from 'mongoose';

let server: http.Server;
let baseUrl: string;
let authToken: string = '';
let testMeetingId: string = '';
let testWorkspaceId: string = '';

const request = async (path: string, options: RequestInit = {}) => {
  const headers = {
    'Content-Type': 'application/json',
    ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
    ...(options.headers || {})
  };
  const res = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers
  });
  const data: any = await res.json().catch(() => null);
  return { status: res.status, data };
};

test.before(async () => {
  await connectDB();
  const app = createApp();
  await new Promise<void>((resolve) => {
    server = app.listen(0, () => {
      const address = server.address() as any;
      baseUrl = `http://localhost:${address.port}`;
      resolve();
    });
  });
});

test.after(async () => {
  if (server) {
    server.close();
  }
  await mongoose.disconnect();
});

test('GET /health returns status UP and service statuses', async () => {
  const res = await request('/health');
  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.data.status, 'UP');
  assert.strictEqual(res.data.services.database.connected, true);
});

test('Authentication: Register new user', async () => {
  const testEmail = `testuser_${Date.now()}@intellmeet.io`;
  const res = await request('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      name: 'Integration Test User',
      email: testEmail,
      password: 'StrongTestPassword123!',
      department: 'QA Engineering'
    })
  });

  assert.strictEqual(res.status, 201);
  assert.ok(res.data.token, 'Should return JWT token');
  assert.strictEqual(res.data.user.email, testEmail);
  authToken = res.data.token;
});

test('Authentication: Login with valid credentials', async () => {
  const testEmail = `login_${Date.now()}@intellmeet.io`;
  // First register
  await request('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      name: 'Login Tester',
      email: testEmail,
      password: 'Password123!'
    })
  });

  // Then login
  const res = await request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email: testEmail,
      password: 'Password123!'
    })
  });

  assert.strictEqual(res.status, 200);
  assert.ok(res.data.token);
  assert.strictEqual(res.data.user.email, testEmail);
});

test('Protected Routes: Reject access without valid JWT', async () => {
  const unauthRes = await fetch(`${baseUrl}/api/meetings`);
  assert.strictEqual(unauthRes.status, 401);
});

test('Protected Routes: Verify /api/auth/me with bearer token', async () => {
  const res = await request('/api/auth/me');
  assert.strictEqual(res.status, 200);
  assert.ok(res.data.user);
  assert.strictEqual(res.data.user.name, 'Integration Test User');
});

test('Meeting Management: Create new meeting and verify code generation', async () => {
  const res = await request('/api/meetings', {
    method: 'POST',
    body: JSON.stringify({
      title: 'Automated CI/CD Sync Meeting',
      description: 'Reviewing pipeline performance and test coverage metrics'
    })
  });

  assert.strictEqual(res.status, 201);
  assert.ok(res.data.meeting._id);
  assert.ok(res.data.meeting.meetingCode.startsWith('INT-'));
  assert.strictEqual(res.data.meeting.status, 'scheduled');
  testMeetingId = res.data.meeting._id;
});

test('Meeting Management: Retrieve meeting by meeting code', async () => {
  // First get meeting details
  const getRes = await request(`/api/meetings/${testMeetingId}`);
  assert.strictEqual(getRes.status, 200);
  const code = getRes.data.meeting.meetingCode;

  // Retrieve by code
  const codeRes = await request(`/api/meetings/code/${code}`);
  assert.strictEqual(codeRes.status, 200);
  assert.strictEqual(codeRes.data.meeting._id, testMeetingId);
});

test('Action Items: Create and list action items linked to meeting', async () => {
  const createRes = await request('/api/action-items', {
    method: 'POST',
    body: JSON.stringify({
      task: 'Prepare v1.2 release documentation',
      meetingId: testMeetingId,
      priority: 'high'
    })
  });
  assert.strictEqual(createRes.status, 201);
  assert.strictEqual(createRes.data.actionItem.task, 'Prepare v1.2 release documentation');

  const res = await request('/api/action-items', {
    method: 'GET'
  });
  assert.strictEqual(res.status, 200);
  assert.ok(Array.isArray(res.data.actionItems));
  assert.ok(res.data.actionItems.length > 0);
});

test('Workspace & Task Management: Create workspace and kanban task', async () => {
  // 1. Create workspace
  const wsRes = await request('/api/workspaces', {
    method: 'POST',
    body: JSON.stringify({
      name: 'Automated Test Workspace',
      description: 'Used for automated test execution'
    })
  });
  assert.strictEqual(wsRes.status, 201);
  testWorkspaceId = wsRes.data.workspace._id;

  // 2. Create task
  const taskRes = await request('/api/tasks', {
    method: 'POST',
    body: JSON.stringify({
      title: 'Automated Test Task 1',
      description: 'Verify task creation endpoint',
      workspaceId: testWorkspaceId,
      priority: 'high',
      status: 'todo'
    })
  });
  assert.strictEqual(taskRes.status, 201);
  assert.strictEqual(taskRes.data.task.title, 'Automated Test Task 1');
  assert.strictEqual(taskRes.data.task.status, 'todo');

  // 3. Update task status (e.g. drag to in_progress)
  const taskId = taskRes.data.task._id;
  const updateRes = await request(`/api/tasks/${taskId}`, {
    method: 'PATCH',
    body: JSON.stringify({
      status: 'in_progress'
    })
  });
  assert.strictEqual(updateRes.status, 200);
  assert.strictEqual(updateRes.data.task.status, 'in_progress');
});
