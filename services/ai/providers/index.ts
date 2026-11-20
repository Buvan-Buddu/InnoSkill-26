import { StructuredResumeFacts, StructuredResumeReport } from '@/services/ai/agents/resumeAgent';

export interface AIProvider {
  name: string;
  isAvailable(): Promise<{ available: boolean; model?: string; reason?: string }>;
  extractFacts(resumeText: string): Promise<StructuredResumeFacts | null>;
  evaluateResume(resumeText: string, facts: StructuredResumeFacts, targetRole?: string): Promise<StructuredResumeReport | null>;
}

export { OllamaProvider } from './ollamaProvider';
export { CloudAIProvider } from './cloudProvider';
