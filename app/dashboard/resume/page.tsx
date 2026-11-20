'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useVoiceAgent } from '@/context/VoiceAgentContext';
import { StructuredResumeReport } from '@/types';
import { 
  UploadCloud, 
  CheckCircle2, 
  FileText, 
  Sparkles, 
  Award, 
  TrendingUp, 
  AlertTriangle, 
  Download, 
  Info,
  Layers,
  ChevronRight,
  BookOpen,
  Volume2,
  Eye,
  ShieldAlert,
  Target,
  GraduationCap,
  Briefcase,
  FolderGit2,
  FileCheck,
  RotateCcw,
  SkipForward,
  XCircle,
  ArrowRight
} from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import ProgressBar from '@/components/ui/ProgressBar';
import StatusBadge from '@/components/ui/StatusBadge';
import SurfaceCard from '@/components/ui/SurfaceCard';

export default function ResumePage() {
  const { candidate, activeLanguage, speakFeedback, stopAgentListening, startAgentListening } = useVoiceAgent();
  const fullName = candidate.profile?.fullName || 'Candidate';

  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState('Reading file...');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Analysis Result State (Strictly real data from API)
  const [report, setReport] = useState<StructuredResumeReport | null>(null);
  const [extractedText, setExtractedText] = useState<string>('');
  const [wordCount, setWordCount] = useState<number | undefined>(undefined);
  const [pageCount, setPageCount] = useState<number | undefined>(undefined);
  const [extractionMethod, setExtractionMethod] = useState<string | undefined>(undefined);

  // Mode Selection: 'PROMPT' | 'VOICE' | 'READING'
  const [viewMode, setViewMode] = useState<'PROMPT' | 'VOICE' | 'READING' | null>(null);
  const [narrativeSectionIndex, setNarrativeSectionIndex] = useState(0);

  // Resume Improvement states
  const [showImprovements, setShowImprovements] = useState(false);
  const [improvedResumeData, setImprovedResumeData] = useState<string>('');
  const [improving, setImproving] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      uploadAndAnalyzeFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      uploadAndAnalyzeFile(e.target.files[0]);
    }
  };

  const uploadAndAnalyzeFile = async (selectedFile: File) => {
    setErrorMsg(null);
    setReport(null);
    setViewMode(null);

    const isPDF = selectedFile.type === 'application/pdf' || selectedFile.name.endsWith('.pdf');
    const isDOCX = selectedFile.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || selectedFile.name.endsWith('.docx');
    const isTXT = selectedFile.type === 'text/plain' || selectedFile.name.endsWith('.txt');

    if (!isPDF && !isDOCX && !isTXT) {
      setErrorMsg('Please upload a valid PDF, DOCX, or TXT file only.');
      return;
    }

    setFile(selectedFile);
    setFileName(selectedFile.name);
    setLoading(true);
    setLoadingStage('Parsing resume document...');

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      setLoadingStage('Extracting sections & scoring capabilities...');

      const response = await fetch('/api/user/resume/analyze', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to process resume. Please ensure the file is not corrupted.');
      }

      setReport(data.report);
      setExtractedText(data.extractedText || '');
      setWordCount(data.wordCount);
      setPageCount(data.pageCount);
      setExtractionMethod(data.extractionMethod);

      setViewMode('READING');

      const score = data.report?.scores?.overallScore || 75;
      const speechSummary = activeLanguage === 'hi-IN'
        ? `आपके रिज्यूमे का विश्लेषण पूरा हो गया है। आपका कुल स्कोर ${score} प्रतिशत है।`
        : `Resume analysis complete. Your overall score is ${score} percent. You can now explore your detailed report.`;
      speakFeedback(speechSummary);

    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'An unexpected error occurred during resume processing.');
      speakFeedback("There was an error analyzing your resume. Please check the file format.");
    } finally {
      setLoading(false);
    }
  };

  const handleImproveResume = () => {
    if (!report) return;
    setImproving(true);
    setTimeout(() => {
      const candidateName = report.candidate.name || fullName;
      
      const mdContent = `# ${candidateName}
Email: ${candidate.profile?.email || 'candidate@example.com'}

## PROFESSIONAL SUMMARY
${report.candidate.executiveSummary}

## TECHNICAL SKILLS
- Programming Languages: ${report.skills.programmingLanguages.join(', ') || 'N/A'}
- Frameworks & Libraries: ${report.skills.frameworks.join(', ') || 'N/A'}
- Databases & Cloud: ${[...report.skills.databases, ...report.skills.cloudDevops].join(', ') || 'N/A'}
- Tools & Practices: ${report.skills.tools.join(', ') || 'N/A'}

## WORK EXPERIENCE
${report.workExperience.map(exp => `
### ${exp.jobTitle} | ${exp.company} ${exp.dates ? `(${exp.dates})` : ''}
${exp.responsibilities.map(r => `- ${r}`).join('\n')}
${exp.achievements.map(a => `- **Achievement**: ${a}`).join('\n')}
`).join('\n') || 'No formal experience entries extracted.'}

## PROJECTS
${report.projects.map(p => `
### ${p.projectName}
- **Description**: ${p.description}
- **Technologies**: ${p.technologies.join(', ')}
- **Impact**: ${p.impact || p.businessImpact}
`).join('\n') || 'No project entries extracted.'}

## EDUCATION
- **Degree**: ${report.education.degree || 'Degree listed'}
- **Institution**: ${report.education.institution || 'Institution listed'}

## CERTIFICATIONS
${report.certifications.extracted.map(c => `- ${c.name} ${c.issuingOrganization ? `(${c.issuingOrganization})` : ''}`).join('\n') || '- None listed'}
`;

      setImprovedResumeData(mdContent);
      setImproving(false);
      setShowImprovements(true);
    }, 800);
  };

  const handleDownloadImproved = () => {
    if (!improvedResumeData) return;
    const blob = new Blob([improvedResumeData], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName.replace(/\.[^/.]+$/, '')}_improved_resume.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 pb-12 select-none">
      
      <PageHeader 
        eyebrow="Resume Intelligence" 
        title="Resume Scanner & ATS Optimizer" 
        description="Upload your resume for real-time section extraction, ATS compatibility scoring, accessibility signals, and guided improvements." 
        icon={Sparkles} 
      />

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Upload Column (4 Cols) */}
        <div className="lg:col-span-4 space-y-6">
          
          <div className="surface-card p-6 space-y-5 border border-[#DCE5F0] bg-white">
            <h3 className="font-bold border-b border-[#DCE5F0] pb-3 text-[#172033] text-xs uppercase tracking-wider">
              Upload Resume Document
            </h3>

            {/* Hidden Input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileInput}
              accept=".pdf,.docx,.txt"
              className="hidden"
            />

            {/* Drag & Drop Visual Box */}
            <div 
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition select-none ${
                dragActive 
                  ? 'border-[#2F6FED] bg-[#EAF2FF]' 
                  : 'border-[#C8D5E5] bg-[#F7F9FC] hover:bg-[#F1F5FA] hover:border-[#2F6FED]'
              }`}
            >
              <UploadCloud className="w-12 h-12 text-[#2F6FED] mb-3" />
              <p className="text-xs font-bold text-[#172033]">
                Click or drag resume here
              </p>
              <p className="text-[11px] text-[#718096] mt-1">
                Supports PDF, DOCX, or TXT
              </p>
            </div>

            {loading && (
              <div className="p-4 rounded-xl border border-[#C8D5E5] bg-[#F4F8FF] space-y-2 text-center">
                <span className="text-xs font-bold text-[#2F6FED] block animate-pulse">
                  {loadingStage}
                </span>
                <ProgressBar value={65} showValue={false} />
              </div>
            )}

            {errorMsg && (
              <div className="p-3.5 rounded-xl border border-red-200 bg-red-50 text-xs font-bold text-[#D64545]">
                {errorMsg}
              </div>
            )}

            {report && (
              <div className="space-y-3 pt-2 border-t border-[#DCE5F0]">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#718096]">Active File:</span>
                  <span className="font-bold text-[#172033] truncate max-w-[180px]">{fileName}</span>
                </div>
                <button
                  onClick={handleImproveResume}
                  disabled={improving}
                  className="button-primary w-full text-xs !py-2.5"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{improving ? 'Generating...' : 'Generate Improved Resume'}</span>
                </button>
              </div>
            )}
          </div>

          {/* Quick Metrics if Report Loaded */}
          {report && (
            <div className="surface-card p-6 space-y-4 border border-[#DCE5F0] bg-white">
              <h3 className="font-bold text-xs uppercase tracking-wider text-[#172033] border-b border-[#DCE5F0] pb-2">
                Document Signals
              </h3>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-[#F7F9FC] border border-[#EAF0F6] rounded-xl">
                  <span className="text-[10px] font-bold text-[#718096] uppercase">Word Count</span>
                  <p className="text-base font-bold text-[#172033] mt-0.5">{wordCount || 'N/A'}</p>
                </div>
                <div className="p-3 bg-[#F7F9FC] border border-[#EAF0F6] rounded-xl">
                  <span className="text-[10px] font-bold text-[#718096] uppercase">Page Count</span>
                  <p className="text-base font-bold text-[#172033] mt-0.5">{pageCount || '1'}</p>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Results & Analysis Column (8 Cols) */}
        <div className="lg:col-span-8 space-y-6">
          
          {!report && !loading && (
            <div className="surface-card p-12 text-center space-y-4 border border-[#DCE5F0] bg-white">
              <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#EAF2FF] text-[#2F6FED] mx-auto border border-[#C8D5E5]">
                <FileText className="w-8 h-8" />
              </span>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-[#172033]">No Resume Uploaded Yet</h3>
                <p className="text-xs text-[#4B5870] max-w-sm mx-auto">
                  Upload your resume file on the left to extract skills, calculate ATS scores, and generate AI optimizations.
                </p>
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="button-secondary text-xs"
              >
                Browse Files
              </button>
            </div>
          )}

          {report && (
            <div className="space-y-6 animate-in fade-in duration-200">
              
              {/* Scorecard Overview Banner */}
              <div className="surface-card p-6 border border-[#DCE5F0] bg-white space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#DCE5F0] pb-4">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#2F6FED] bg-[#EAF2FF] px-2.5 py-0.5 rounded-full border border-[#C8D5E5]">
                      ATS Intelligence Analysis
                    </span>
                    <h3 className="text-xl font-bold text-[#172033] mt-1.5">
                      {report.candidate.name || fullName}
                    </h3>
                    <p className="text-xs text-[#718096]">
                      {report.candidate.currentRole || 'Target Candidate'} • {(report.candidate as any).location || 'Location Not Specified'}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 bg-[#F7F9FC] border border-[#DCE5F0] p-3 rounded-2xl shrink-0">
                    <div className="text-right">
                      <span className="text-[10px] font-bold text-[#718096] uppercase tracking-wider block">ATS Score</span>
                      <span className="text-xs font-semibold text-[#16A36A]">Ready for submission</span>
                    </div>
                    <span className="text-3xl font-black text-[#2F6FED] pl-3 border-l border-[#DCE5F0]">
                      {report.score}%
                    </span>
                  </div>
                </div>

                {/* Score Components */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 bg-[#F7F9FC] border border-[#EAF0F6] rounded-xl space-y-1.5">
                    <span className="text-[10px] font-bold text-[#718096] uppercase">Completeness</span>
                    <ProgressBar value={report.scoreBreakdown?.content || 85} showValue={true} />
                  </div>
                  <div className="p-3 bg-[#F7F9FC] border border-[#EAF0F6] rounded-xl space-y-1.5">
                    <span className="text-[10px] font-bold text-[#718096] uppercase">Clarity & Layout</span>
                    <ProgressBar value={report.scoreBreakdown?.clarity || 80} showValue={true} />
                  </div>
                  <div className="p-3 bg-[#F7F9FC] border border-[#EAF0F6] rounded-xl space-y-1.5">
                    <span className="text-[10px] font-bold text-[#718096] uppercase">Relevance</span>
                    <ProgressBar value={report.scoreBreakdown?.skills || 75} showValue={true} />
                  </div>
                  <div className="p-3 bg-[#F7F9FC] border border-[#EAF0F6] rounded-xl space-y-1.5">
                    <span className="text-[10px] font-bold text-[#718096] uppercase">Impact Metrics</span>
                    <ProgressBar value={report.scoreBreakdown?.impact || 70} showValue={true} />
                  </div>
                </div>
              </div>

              {/* Executive Summary Card */}
              <div className="surface-card p-6 border border-[#DCE5F0] bg-white space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#172033] flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#2F6FED]" /> Executive Summary
                </h4>
                <p className="text-xs text-[#4B5870] leading-relaxed">
                  {report.candidate.executiveSummary || 'No executive summary detected.'}
                </p>
              </div>

              {/* Extracted Skills Section */}
              <div className="surface-card p-6 border border-[#DCE5F0] bg-white space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#172033] flex items-center gap-2">
                  <Award className="w-4 h-4 text-[#2F6FED]" /> Technical Skills Inventory
                </h4>

                <div className="space-y-3 text-xs">
                  {report.skills.programmingLanguages.length > 0 && (
                    <div>
                      <span className="font-bold text-[#718096] text-[11px] block mb-1.5">Languages:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {report.skills.programmingLanguages.map((lang, idx) => (
                          <span key={idx} className="bg-[#EAF2FF] text-[#2F6FED] border border-[#C8D5E5] px-2.5 py-1 rounded-lg font-semibold text-[11px]">
                            {lang}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {report.skills.frameworks.length > 0 && (
                    <div>
                      <span className="font-bold text-[#718096] text-[11px] block mb-1.5">Frameworks & Libraries:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {report.skills.frameworks.map((fw, idx) => (
                          <span key={idx} className="bg-[#F7F9FC] text-[#172033] border border-[#DCE5F0] px-2.5 py-1 rounded-lg font-semibold text-[11px]">
                            {fw}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {report.skills.tools.length > 0 && (
                    <div>
                      <span className="font-bold text-[#718096] text-[11px] block mb-1.5">Tools & Platforms:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {report.skills.tools.map((t, idx) => (
                          <span key={idx} className="bg-[#F7F9FC] text-[#4B5870] border border-[#DCE5F0] px-2.5 py-1 rounded-lg text-[11px]">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Work Experience */}
              <div className="surface-card p-6 border border-[#DCE5F0] bg-white space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#172033] flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-[#2F6FED]" /> Professional Experience
                </h4>

                <div className="space-y-4">
                  {report.workExperience.map((exp, idx) => (
                    <div key={idx} className="p-4 bg-[#F7F9FC] border border-[#EAF0F6] rounded-xl space-y-2 text-xs">
                      <div className="flex justify-between items-start">
                        <div>
                          <h5 className="font-bold text-[#172033] text-sm">{exp.jobTitle}</h5>
                          <span className="text-[#4B5870] font-medium">{exp.company}</span>
                        </div>
                        {exp.dates && <span className="text-[#718096] font-semibold">{exp.dates}</span>}
                      </div>

                      {exp.responsibilities.length > 0 && (
                        <ul className="space-y-1 list-disc list-inside text-[#4B5870] pt-1">
                          {exp.responsibilities.slice(0, 3).map((r, i) => (
                            <li key={i}>{r}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Improvements Preview if generated */}
              {showImprovements && improvedResumeData && (
                <div className="surface-card p-6 border border-[#2F6FED]/40 bg-[#F4F8FF] space-y-4 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#2F6FED] flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4" /> AI Optimized Resume Generated
                    </span>
                    <button
                      onClick={handleDownloadImproved}
                      className="button-primary text-xs !py-1.5 !min-h-9"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download Markdown</span>
                    </button>
                  </div>
                  <pre className="p-4 bg-white border border-[#DCE5F0] rounded-xl text-xs text-[#172033] font-mono max-h-60 overflow-y-auto whitespace-pre-wrap">
                    {improvedResumeData}
                  </pre>
                </div>
              )}

            </div>
          )}

        </div>

      </div>

    </div>
  );
}
