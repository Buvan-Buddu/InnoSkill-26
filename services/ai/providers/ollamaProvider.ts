import { AIProvider } from './index';
import { StructuredResumeFacts, StructuredResumeReport } from '@/services/ai/agents/resumeAgent';

export class OllamaProvider implements AIProvider {
  name = 'Ollama Local AI';
  private baseUrl: string;
  private configuredModel?: string;

  constructor() {
    this.baseUrl = process.env.OLLAMA_BASE_URL || 'http://127.0.0.1:11434';
    this.configuredModel = process.env.OLLAMA_MODEL;
  }

  async isAvailable(): Promise<{ available: boolean; model?: string; reason?: string }> {
    try {
      console.log(`[OLLAMA] Checking health on ${this.baseUrl}/api/tags...`);
      const response = await fetch(`${this.baseUrl}/api/tags`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        signal: AbortSignal.timeout(5000)
      });

      if (!response.ok) {
        return { available: false, reason: `Ollama endpoint returned HTTP ${response.status}` };
      }

      const data = await response.json();
      const models: string[] = (data.models || []).map((m: any) => m.name || m.model);

      if (models.length === 0) {
        return { available: false, reason: 'No local Ollama models installed. Please run "ollama pull llama2".' };
      }

      // Select model
      let selectedModel = this.configuredModel;
      if (selectedModel && models.includes(selectedModel)) {
        console.log(`[OLLAMA] Selected configured model: ${selectedModel}`);
        return { available: true, model: selectedModel };
      }

      // Filter out embedding models if possible
      const chatModel = models.find(m => !m.includes('embed') && !m.includes('nomic')) || models[0];
      console.log(`[OLLAMA] Autodetected local model: ${chatModel}`);
      return { available: true, model: chatModel };
    } catch (err: any) {
      console.warn(`[OLLAMA] Health check failed: ${err.message}`);
      return { available: false, reason: `Ollama Desktop is not running or unreachable on ${this.baseUrl}` };
    }
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
      // Attempt trailing quote/bracket repair
      try {
        let repaired = clean;
        let openBraces = (repaired.match(/\{/g) || []).length - (repaired.match(/\}/g) || []).length;
        let openBrackets = (repaired.match(/\[/g) || []).length - (repaired.match(/\]/g) || []).length;

        if (repaired.lastIndexOf('"') > repaired.lastIndexOf(':') && repaired.split('"').length % 2 === 0) {
          repaired += '"';
        }
        while (openBrackets > 0) { repaired += ']'; openBrackets--; }
        while (openBraces > 0) { repaired += '}'; openBraces--; }

        return JSON.parse(repaired) as T;
      } catch (repairErr) {
        console.error('[OllamaProvider] JSON parse failure. Raw preview:', clean.substring(0, 200));
        return null;
      }
    }
  }

  async extractFacts(resumeText: string): Promise<StructuredResumeFacts | null> {
    const status = await this.isAvailable();
    if (!status.available || !status.model) {
      throw new Error(status.reason || 'Ollama local model unavailable');
    }

    const model = status.model;
    console.log(`[OLLAMA] Extracting facts using model: ${model}...`);

    const prompt = `You are a strict Resume Fact Extractor.
Extract ONLY facts explicitly present in the provided resume text.
NEVER invent skills, companies, degrees, dates, metrics, or titles. Return null or [] for missing items.

Return ONLY a raw JSON object with this exact structure:
{
  "contact": { "name": null, "email": null, "phone": null, "location": null, "linkedin": null, "github": null, "portfolio": null },
  "summary": null,
  "education": [{ "degree": null, "institution": null, "fieldOfStudy": null, "graduationYear": null, "gpa": null, "achievements": [] }],
  "experience": [{ "company": "", "jobTitle": "", "location": null, "dates": null, "duration": null, "responsibilities": [], "achievements": [], "technologies": [] }],
  "projects": [{ "projectName": "", "description": "", "technologies": [], "role": null, "features": [], "impact": null, "link": null }],
  "skills": { "programmingLanguages": [], "frameworks": [], "libraries": [], "databases": [], "aiMl": [], "cloudDevOps": [], "toolsPlatforms": [], "softSkills": [], "other": [] },
  "certifications": [{ "name": "", "issuingOrganization": null, "date": null }],
  "achievements": [{ "title": "", "issuer": null, "year": null, "description": null }],
  "researchInterests": [],
  "languages": []
}

RESUME TEXT CONTENT:
${resumeText.substring(0, 12000)}`;

    try {
      const res = await fetch(`${this.baseUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model,
          messages: [{ role: 'user', content: prompt }],
          stream: false,
          format: 'json'
        }),
        signal: AbortSignal.timeout(180000)
      });

      if (!res.ok) {
        console.warn(`[OLLAMA] Chat API returned HTTP ${res.status}`);
        return null;
      }

      const data = await res.json();
      const rawContent = data.message?.content || '';
      console.log(`[OLLAMA] Facts extraction response length: ${rawContent.length} chars`);
      return this.safeJsonParse<StructuredResumeFacts>(rawContent);
    } catch (err: any) {
      console.error('[OLLAMA] Fact extraction request failed:', err.message);
      return null;
    }
  }

  async evaluateResume(
    resumeText: string,
    facts: StructuredResumeFacts,
    targetRole?: string
  ): Promise<StructuredResumeReport | null> {
    const status = await this.isAvailable();
    if (!status.available || !status.model) {
      throw new Error(status.reason || 'Ollama local model unavailable');
    }

    const model = status.model;
    console.log(`[OLLAMA] Evaluating resume using model: ${model}...`);

    const prompt = `You are an expert Resume Evaluator & ATS Audit Specialist.
Evaluate the candidate using ONLY the provided facts and clean text. Ground every strength and vulnerability in actual resume evidence.

Return ONLY a raw JSON object matching this structure:
{
  "candidate": { "name": null, "email": null, "phone": null, "targetRole": "${targetRole || 'Software Engineer'}", "executiveSummary": "", "totalExperienceYears": 0 },
  "score": 80,
  "scoringBreakdown": { "contactCompleteness": 10, "sectionStructure": 10, "skillsVisibility": 10, "experienceClarity": 10, "keywordQuality": 10, "projectClarity": 10, "achievementQuality": 10, "readability": 10, "relevanceToRole": 10, "formattingQuality": 10 },
  "strengths": [{ "category": "Technical", "title": "...", "detail": "...", "impact": "..." }],
  "vulnerabilities": [{ "id": "vuln-1", "section": "Experience", "issue": "...", "evidence": "...", "whyItMatters": "...", "priority": "Medium", "recommendation": "..." }],
  "sectionOptimization": { "summary": { "currentText": "...", "score": 8, "feedback": [], "improvedVersion": "..." }, "skills": { "score": 8, "feedback": [], "missingKeySkills": [] }, "experience": [], "projects": [] },
  "actionableImprovements": { "immediate": [{ "priority": "High", "change": "...", "rationale": "..." }], "mediumTerm": [] },
  "atsAudit": { "parserReadability": "Good", "formattingIssues": [], "missingKeySections": [], "keywordMatchScore": 85 }
}

TARGET ROLE: ${targetRole || 'Not specified'}
EXTRACTED FACTS:
${JSON.stringify(facts, null, 2)}

RESUME RAW TEXT:
${resumeText.substring(0, 12000)}`;

    try {
      const res = await fetch(`${this.baseUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model,
          messages: [{ role: 'user', content: prompt }],
          stream: false,
          format: 'json'
        }),
        signal: AbortSignal.timeout(90000)
      });

      if (!res.ok) {
        console.warn(`[OLLAMA] Resume evaluation returned HTTP ${res.status}`);
        return null;
      }

      const data = await res.json();
      const rawContent = data.message?.content || '';
      console.log(`[OLLAMA] Resume evaluation response length: ${rawContent.length} chars`);
      return this.safeJsonParse<StructuredResumeReport>(rawContent);
    } catch (err: any) {
      console.error('[OLLAMA] Resume evaluation request failed:', err.message);
      return null;
    }
  }
}
