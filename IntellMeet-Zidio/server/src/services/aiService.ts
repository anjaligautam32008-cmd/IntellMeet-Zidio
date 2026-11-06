import OpenAI from 'openai';
import { config } from '../config/env.js';

let openaiClient: OpenAI | null = null;
if (config.OPENAI_API_KEY) {
  openaiClient = new OpenAI({ apiKey: config.OPENAI_API_KEY });
}

export interface SummaryResult {
  summary: string;
  keyPoints: string[];
  decisions: string[];
  topicsCovered: string[];
  sentiment: 'positive' | 'neutral' | 'constructive' | 'mixed';
  isDemoMode: boolean;
  modelUsed: string;
}

export interface ExtractedActionItem {
  task: string;
  description: string;
  assigneeName: string | null;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate: string | null;
}

export interface ActionItemResult {
  actionItems: ExtractedActionItem[];
  isDemoMode: boolean;
}

export interface TranscriptionResult {
  fullText: string;
  entries: Array<{
    speakerName: string;
    timestamp: string;
    text: string;
    confidence: number;
  }>;
  isDemoMode: boolean;
}

export class AiService {
  /**
   * Transcribe meeting audio file or simulated audio stream
   */
  static async transcribeAudio(filePath?: string): Promise<TranscriptionResult> {
    if (openaiClient && filePath && !config.DEMO_MODE) {
      try {
        const fs = await import('fs');
        const fileStream = fs.createReadStream(filePath);
        const response = await openaiClient.audio.transcriptions.create({
          file: fileStream as any,
          model: 'whisper-1',
          response_format: 'verbose_json'
        });

        // Parse whisper verbose segments if available
        const entries = (response as any).segments?.map((seg: any) => ({
          speakerName: 'Speaker ' + (seg.id ? (seg.id % 3) + 1 : 1),
          timestamp: new Date(seg.start * 1000).toISOString().substr(14, 5),
          text: seg.text.trim(),
          confidence: Math.round((seg.avg_logprob ? Math.exp(seg.avg_logprob) : 0.95) * 100) / 100
        })) || [
          {
            speakerName: 'Host',
            timestamp: '00:00',
            text: response.text,
            confidence: 0.98
          }
        ];

        return {
          fullText: response.text,
          entries,
          isDemoMode: false
        };
      } catch (err: any) {
        console.warn('[AI Service] OpenAI Whisper failed, falling back to simulated transcript:', err.message);
      }
    }

    // Realistic Demo Mode Transcript
    return {
      fullText:
        'Good morning everyone, welcome to the IntellMeet sprint sync. First, Alex reported that the WebRTC peer connection latency in our testing cluster decreased by 35% after optimizing ICE candidate gathering. Next, Sarah confirmed the PostgreSQL to MongoDB migration is complete, with all meeting indexes verified. Priya noted that we need to finalize the OAuth 2.0 refresh token rotation policy by Friday. Marcus will update the Helm charts and deploy the canary build to staging tomorrow morning. Finally, we agreed that code freeze for v1.2 is scheduled for next Tuesday at 5 PM.',
      entries: [
        {
          speakerName: 'Alex Rivera (Host)',
          timestamp: '00:05',
          text: 'Good morning everyone, welcome to the IntellMeet sprint sync. Lets review infrastructure and sprint deliverables.',
          confidence: 0.98
        },
        {
          speakerName: 'Alex Rivera (Host)',
          timestamp: '00:30',
          text: 'Our WebRTC peer connection latency decreased by 35% after optimizing ICE candidate gathering.',
          confidence: 0.99
        },
        {
          speakerName: 'Sarah Chen',
          timestamp: '01:15',
          text: 'The PostgreSQL to MongoDB migration is complete, with all meeting indexes and query performance verified.',
          confidence: 0.97
        },
        {
          speakerName: 'Priya Patel',
          timestamp: '02:40',
          text: 'We must finalize the OAuth 2.0 refresh token rotation policy and security review by this Friday.',
          confidence: 0.96
        },
        {
          speakerName: 'Marcus Vance',
          timestamp: '04:10',
          text: 'I will update the Helm charts and deploy the canary build to staging tomorrow morning at 10 AM.',
          confidence: 0.98
        },
        {
          speakerName: 'Alex Rivera (Host)',
          timestamp: '05:30',
          text: 'Agreed. Code freeze for release v1.2 is officially scheduled for next Tuesday at 5 PM.',
          confidence: 0.99
        }
      ],
      isDemoMode: true
    };
  }

  /**
   * Generate structured meeting summary from transcript
   */
  static async generateSummary(transcriptText: string): Promise<SummaryResult> {
    if (openaiClient && transcriptText && !config.DEMO_MODE) {
      try {
        const prompt = `You are an executive enterprise assistant. Analyze the following meeting transcript and produce a strictly valid JSON response with keys:
"summary": a 2-3 paragraph concise executive overview,
"keyPoints": array of 4-6 bullet points of discussion topics,
"decisions": array of concrete decisions agreed upon during the meeting,
"topicsCovered": array of 3-5 high level topics (e.g. Infrastructure, Security, Deployment),
"sentiment": one of "positive", "neutral", "constructive", "mixed".

Transcript:
"""
${transcriptText}
"""
Respond with raw JSON only.`;

        const completion = await openaiClient.chat.completions.create({
          model: config.OPENAI_MODEL,
          messages: [{ role: 'user', content: prompt }],
          response_format: { type: 'json_object' }
        });

        const raw = completion.choices[0]?.message?.content || '{}';
        const parsed = JSON.parse(raw);

        return {
          summary: parsed.summary || 'Summary generated from transcript.',
          keyPoints: parsed.keyPoints || [],
          decisions: parsed.decisions || [],
          topicsCovered: parsed.topicsCovered || ['Engineering', 'Architecture'],
          sentiment: parsed.sentiment || 'constructive',
          isDemoMode: false,
          modelUsed: config.OPENAI_MODEL
        };
      } catch (err: any) {
        console.warn('[AI Service] OpenAI summary call failed, using deterministic fallback:', err.message);
      }
    }

    // Deterministic Demo Mode Summary based on realistic enterprise context
    return {
      summary:
        'The team held an engineering sprint sync reviewing WebRTC performance gains, database migration completion, and upcoming release milestones. WebRTC latency improved by 35% through ICE candidate streamlining. Security policies around token rotation are on track for Friday completion, and staging deployment via Helm will commence tomorrow.',
      keyPoints: [
        'WebRTC signaling and ICE candidate optimization resulted in a 35% latency drop across distributed peers.',
        'Database transition to MongoDB was confirmed stable with indexed collections and healthy read/write throughput.',
        'OAuth 2.0 refresh token rotation policy is undergoing security review ahead of Friday deadline.',
        'Canary staging deployment prepared using updated Helm charts and Kubernetes ingress.'
      ],
      decisions: [
        'Approved deployment of the staging canary build tomorrow morning at 10:00 AM.',
        'Finalized release v1.2 code freeze date for next Tuesday at 5:00 PM.',
        'Adopted mandatory token rotation standard for all enterprise API sessions.'
      ],
      topicsCovered: ['Real-time WebRTC Performance', 'Database Verification', 'Authentication Security', 'Release Timeline'],
      sentiment: 'constructive',
      isDemoMode: true,
      modelUsed: 'Demo AI Fallback Engine'
    };
  }

  /**
   * Extract concrete action items from transcript
   */
  static async extractActionItems(transcriptText: string): Promise<ActionItemResult> {
    if (openaiClient && transcriptText && !config.DEMO_MODE) {
      try {
        const prompt = `Extract all concrete action items, tasks, and follow-ups from this transcript.
Produce a JSON object with key "actionItems", an array of items with:
- "task": concise action description (string)
- "description": context or details (string)
- "assigneeName": explicit name of assignee if mentioned, otherwise null
- "priority": "low" | "medium" | "high" | "urgent"
- "dueDate": ISO date string or relative deadline if mentioned, otherwise null

Do not hallucinate assignees or deadlines if not stated.

Transcript:
"""
${transcriptText}
"""
Raw JSON output only:`;

        const completion = await openaiClient.chat.completions.create({
          model: config.OPENAI_MODEL,
          messages: [{ role: 'user', content: prompt }],
          response_format: { type: 'json_object' }
        });

        const raw = completion.choices[0]?.message?.content || '{"actionItems": []}';
        const parsed = JSON.parse(raw);

        return {
          actionItems: parsed.actionItems || [],
          isDemoMode: false
        };
      } catch (err: any) {
        console.warn('[AI Service] OpenAI Action Items extraction failed, using demo fallback:', err.message);
      }
    }

    // Realistic Demo Mode Action Items
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const friday = new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const nextTuesday = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    return {
      actionItems: [
        {
          task: 'Update Helm charts and trigger canary deployment to staging',
          description: 'Deploy the latest container images to staging cluster and monitor error rates.',
          assigneeName: 'Marcus Vance',
          priority: 'high',
          dueDate: `${tomorrow}T10:00:00.000Z`
        },
        {
          task: 'Finalize OAuth 2.0 refresh token rotation policy',
          description: 'Complete security review and merge token rotation middleware.',
          assigneeName: 'Priya Patel',
          priority: 'urgent',
          dueDate: `${friday}T17:00:00.000Z`
        },
        {
          task: 'Enforce v1.2 code freeze and tag release candidate',
          description: 'Block non-critical pull requests and prepare release notes.',
          assigneeName: 'Alex Rivera',
          priority: 'medium',
          dueDate: `${nextTuesday}T17:00:00.000Z`
        }
      ],
      isDemoMode: true
    };
  }
}
