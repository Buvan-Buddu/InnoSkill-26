import { AIProvider } from './index';
import { StructuredResumeFacts, StructuredResumeReport } from '@/services/ai/agents/resumeAgent';

export class CloudAIProvider implements AIProvider {
  name = 'Cloud AI Provider';
  private apiKey?: string;
  private providerType: 'openai' | 'gemini' | 'none' = 'none';

  constructor() {
    if (process.env.OPENAI_API_KEY) {
      this.apiKey = process.env.OPENAI_API_KEY;
      this.providerType = 'openai';
      this.name = 'OpenAI Cloud (gpt-4o-mini)';
    } else if (process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY) {
      this.apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY;
      this.providerType = 'gemini';
      this.name = 'Gemini Cloud (gemini-2.0-flash)';
    }
  }

  async isAvailable(): Promise<{ available: boolean; model?: string; reason?: string }> {
    if (this.providerType !== 'none' && this.apiKey) {
      return { available: true, model: this.providerType === 'openai' ? 'gpt-4o-mini' : 'gemini-2.0-flash' };
    }
    return { available: false, reason: 'No secondary cloud API key (OPENAI_API_KEY / GEMINI_API_KEY) configured.' };
  }

  private safeJsonParse<T>(rawText: string): T | null {
    if (!rawText) return null;
    let clean = rawText.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();

    const firstBrace = clean.indexOf('{');
    const lastBrace = clean.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace > firstBrace) {
      clean = clean.substring(firstBrace, lastBrace + 1);
    }

    try {
      return JSON.parse(clean) as T;
    } catch (err) {
      return null;
    }
  }

  async extractFacts(resumeText: string): Promise<StructuredResumeFacts | null> {
    if (!this.apiKey || this.providerType === 'none') return null;

    const prompt = `You are a strict Resume Fact Extractor. Extract ONLY facts explicitly present in the provided resume text.
NEVER invent skills, companies, degrees, dates, metrics, or titles. Return null or [] for missing items.
Return ONLY a valid JSON object matching the StructuredResumeFacts schema.`;

    if (this.providerType === 'openai') {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          response_format: { type: 'json_object' },
          messages: [
            { role: 'system', content: prompt },
            { role: 'user', content: `RESUME TEXT CONTENT:\n${resumeText.substring(0, 15000)}` }
          ],
          temperature: 0.1
        })
      });
      if (!response.ok) return null;
      const data = await response.json();
      return this.safeJsonParse<StructuredResumeFacts>(data.choices?.[0]?.message?.content || '');
    } else {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${this.apiKey}`;
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }, { text: `RESUME TEXT CONTENT:\n${resumeText.substring(0, 15000)}` }] }],
          generationConfig: { responseMimeType: 'application/json', temperature: 0.1, maxOutputTokens: 8192 }
        })
      });
      if (!response.ok) return null;
      const data = await response.json();
      return this.safeJsonParse<StructuredResumeFacts>(data.candidates?.[0]?.content?.parts?.[0]?.text || '');
    }
  }

  async evaluateResume(
    resumeText: string,
    facts: StructuredResumeFacts,
    targetRole?: string
  ): Promise<StructuredResumeReport | null> {
    if (!this.apiKey || this.providerType === 'none') return null;

    const prompt = `You are an expert Resume Evaluator & ATS Audit Specialist.
Evaluate candidate using extracted facts and raw text. Ground every strength and vulnerability in actual resume evidence.
Return ONLY a valid JSON object matching the StructuredResumeReport schema.`;

    if (this.providerType === 'openai') {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          response_format: { type: 'json_object' },
          messages: [
            { role: 'system', content: prompt },
            { role: 'user', content: `TARGET ROLE: ${targetRole || 'Not specified'}\nFACTS:\n${JSON.stringify(facts, null, 2)}\n\nRAW TEXT:\n${resumeText.substring(0, 15000)}` }
          ],
          temperature: 0.2
        })
      });
      if (!response.ok) return null;
      const data = await response.json();
      return this.safeJsonParse<StructuredResumeReport>(data.choices?.[0]?.message?.content || '');
    } else {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${this.apiKey}`;
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }, { text: `TARGET ROLE: ${targetRole || 'Not specified'}\nFACTS:\n${JSON.stringify(facts, null, 2)}\n\nRAW TEXT:\n${resumeText.substring(0, 15000)}` }] }],
          generationConfig: { responseMimeType: 'application/json', temperature: 0.2, maxOutputTokens: 8192 }
        })
      });
      if (!response.ok) return null;
      const data = await response.json();
      return this.safeJsonParse<StructuredResumeReport>(data.candidates?.[0]?.content?.parts?.[0]?.text || '');
    }
  }
}
