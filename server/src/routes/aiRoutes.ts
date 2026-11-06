import { Router } from 'express';
import {
  generateMeetingTranscript,
  generateMeetingSummary,
  extractActionItems,
  getMeetingSummary,
  getMeetingTranscript
} from '../controllers/aiController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

// Transcription
router.post('/meetings/:meetingId/transcribe', generateMeetingTranscript);
router.get('/meetings/:meetingId/transcript', getMeetingTranscript);

// Summarization
router.post('/meetings/:meetingId/summary', generateMeetingSummary);
router.post('/meetings/:meetingId/summarize', generateMeetingSummary);
router.get('/meetings/:meetingId/summary', getMeetingSummary);

// Action item extraction
router.post('/meetings/:meetingId/action-items', extractActionItems);

export default router;
