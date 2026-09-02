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
  XCircle
} from 'lucide-react';

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

  // Drag & drop handlers
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

  // Upload file to real server analysis API
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

    const tenMB = 10 * 1024 * 1024;
    if (selectedFile.size > tenMB) {
      setErrorMsg('File size exceeds the 10MB limit.');
      return;
    }

    setFile(selectedFile);
    setFileName(selectedFile.name);
    setLoading(true);
    setLoadingStage('Reading file content...');

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      setLoadingStage('Extracting text & analyzing structure...');

      const response = await fetch('/api/user/resume/analyze', {
        method: 'POST',
        body: formData
      });

      const contentType = response.headers.get('content-type') || '';
      const rawText = await response.text();

      console.log('[RESUME-FRONTEND] Response received:', {
        status: response.status,
        contentType,
        rawTextLength: rawText.length,
        rawTextPreview: rawText.substring(0, 300)
      });

      if (!rawText || !rawText.trim()) {
        throw new Error(`Resume API returned empty response body (HTTP ${response.status}).`);
      }

      let data: any;
      try {
        data = JSON.parse(rawText);
      } catch (jsonParseErr) {
        console.error('[ResumeAnalysis] Invalid JSON response from server:', {
          status: response.status,
          contentType,
          preview: rawText.substring(0, 300)
        });
        throw new Error(`Resume analysis service returned an unreadable response format (HTTP ${response.status}).`);
      }

      if (!response.ok || !data.success) {
        throw new Error(data.error || `Resume analysis failed (HTTP ${response.status}).`);
      }

      setLoadingStage('Finalizing 13-section report...');
      setReport(data.structuredReport);
      setExtractedText(data.extractedText || '');
      setWordCount(data.wordCount);
      setPageCount(data.pageCount);
      setExtractionMethod(data.extractionMethod);
      setLoading(false);

      // Prompt Voice vs Reading Mode choice
      setViewMode('PROMPT');

      const promptMsg = activeLanguage === 'hi-IN'
        ? "आपका रीज़्यूमे विश्लेषण तैयार है। क्या आप इसे आवाज़ से सुनना चाहेंगे, या खुद पढ़ना चाहेंगे?"
        : "Your resume analysis is ready. Would you like me to explain it using voice, or would you prefer to read the analysis yourself?";
      
      speakFeedback(promptMsg, () => startAgentListening());

    } catch (err: any) {
      setLoading(false);
      setErrorMsg(err.message || 'We couldn\'t read this resume file. Please upload a valid PDF, DOCX, or TXT file.');
    }
  };

  // Helper to scan built-in real test resume samples
  const scanSampleResume = (sampleType: 'SOFTWARE' | 'DATA_AI') => {
    let sampleContent = '';
    let sampleFileName = '';

    if (sampleType === 'SOFTWARE') {
      sampleFileName = 'alex_rivera_frontend_resume.txt';
      sampleContent = `Alex Rivera
Email: alex.rivera@dev.io | Phone: (555) 234-5678 | GitHub: github.com/arivera

PROFESSIONAL SUMMARY
Accessible UI Engineer with 4 years of experience specializing in React, TypeScript, and WCAG 2.1 AA compliance. Built keyboard-navigable applications for over 500k active users.

TECHNICAL SKILLS
- Programming Languages: TypeScript, JavaScript, HTML5, CSS3, SQL
- Frameworks & Libraries: React, Next.js, Tailwind CSS, Redux Toolkit
- Tools & Cloud: Git, Docker, Jest, Vite, ARIA practices

WORK EXPERIENCE
Senior Frontend Engineer | AccessiTech Inc. (2023 - Present)
- Refactored core web portal to conform strictly to WCAG 2.2 AA accessibility benchmarks.
- Increased accessibility audit score from 62% to 98% across 40+ user-facing screens.
- Improved keyboard focus trapping and ARIA live region notifications for screen readers.

Web Developer | CodeCraft Studio (2021 - 2023)
- Developed responsive React dashboards for healthcare and education clients.
- Reduced layout shifts (CLS) by 25% using CSS Grid and optimized font loading.

PROJECTS
OpenAccess Dashboard
- Built open-source accessibility diagnostic dashboard using Next.js and Web Speech API.
- Starred by 450+ developers on GitHub.

EDUCATION
B.S. in Computer Science | State University (2017 - 2021)
- GPA: 3.8 / 4.0

CERTIFICATIONS
- IAAP Certified Web Accessibility Specialist (WAS)`;
    } else {
      sampleFileName = 'priya_sharma_data_ai_resume.txt';
      sampleContent = `Priya Sharma
Email: priya.sharma@ai.org | Phone: (555) 987-6543 | LinkedIn: linkedin.com/in/psharma

EXECUTIVE SUMMARY
Data Scientist & AI Specialist with experience developing Machine Learning models, NLP pipelines, and Python backend services. Passionate about ethical AI and accessible data visualization.

SKILLS
- AI & ML: Python, PyTorch, TensorFlow, Scikit-learn, Pandas, NumPy, NLP
- Databases & Cloud: PostgreSQL, MongoDB, AWS S3, Docker, Git
- Analytics: SQL, Data Mining, Matplotlib, Tableau

EXPERIENCE
AI Researcher & Data Scientist | NeuralData Labs (2022 - Present)
- Trained Transformer-based text summarization models with 89% accuracy on technical papers.
- Deployed ML inference REST APIs using FastAPI and Docker containers on AWS.

Data Analyst Intern | Analytics Corp (2021 - 2022)
- Built SQL queries and PostgreSQL database indexes, reducing query latency by 40%.
- Created interactive dashboards for candidate metrics tracking.

PROJECTS
SpeechToText Assist AI
- Built real-time audio transcription pipeline using Python and WebSockets.

EDUCATION
M.S. in Data Science & Artificial Intelligence | Tech Institute (2020 - 2022)
B.Tech in Information Technology (2016 - 2020)

CERTIFICATIONS
- AWS Certified Machine Learning - Specialty`;
    }

    const blob = new Blob([sampleContent], { type: 'text/plain' });
    const sampleFile = new File([blob], sampleFileName, { type: 'text/plain' });
    uploadAndAnalyzeFile(sampleFile);
  };

  // Section list for Voice Narration mode
  const narrationSections = report ? [
    {
      title: 'Overall Resume Summary & Score',
      text: activeLanguage === 'hi-IN'
        ? `आपका कुल रीज़्यूमे स्कोर 100 में से ${report.score} है। ${report.candidate.executiveSummary}`
        : `Your overall resume score is ${report.score} out of 100. ${report.candidate.executiveSummary}`
    },
    {
      title: 'Core Strengths',
      text: activeLanguage === 'hi-IN'
        ? `आपकी मुख्य ताकतें हैं: ${report.strengths.join('. ')}`
        : `Your primary grounded strengths include: ${report.strengths.join('. ')}`
    },
    {
      title: 'Work Experience Evaluation',
      text: report.workExperience.length > 0
        ? `We found ${report.workExperience.length} work experience entries. ${report.experienceSummary.achievementQuality}. ${report.experienceSummary.strengths.join('. ')}`
        : `Work experience evaluation: No formal work experience entries were extracted from this file.`
    },
    {
      title: 'Technical Skills Matrix',
      text: `Your extracted skills include: ${report.skills.programmingLanguages.join(', ')} in programming, and frameworks like ${report.skills.frameworks.join(', ')}.`
    },
    {
      title: 'Skills Gaps & Missing Capabilities',
      text: report.skillsGaps.length > 0
        ? `Skill gap analysis identified: ${report.skillsGaps.map(g => `${g.skillName} (${g.status})`).join(', ')}.`
        : `Skill gap analysis shows strong alignment with no major missing foundational skills.`
    },
    {
      title: 'Projects Deep Dive',
      text: report.projects.length > 0
        ? `Identified ${report.projects.length} projects in your resume, including ${report.projects.map(p => p.projectName).join(', ')}.`
        : `No explicit project section was detected in your uploaded file.`
    },
    {
      title: 'Education & Certifications',
      text: `Education: ${report.education.degree || 'Degree listed'}, ${report.education.institution || 'Institution listed'}. Certifications: ${report.certifications.extracted.map(c => c.name).join(', ') || 'No certifications extracted'}.`
    },
    {
      title: 'Resume Vulnerabilities & Weaknesses',
      text: report.vulnerabilities.length > 0
        ? `We detected ${report.vulnerabilities.length} key vulnerabilities. Top issue: ${report.vulnerabilities[0]?.issue}. ${report.vulnerabilities[0]?.whyItMatters}`
        : `No high-severity vulnerabilities were detected in your resume formatting or content.`
    },
    {
      title: 'ATS Readiness & Compatibility',
      text: `Your ATS compatibility score is ${report.atsAnalysis.score} out of 100. ${report.atsAnalysis.reasoning}`
    },
    {
      title: 'Actionable Improvements',
      text: report.actionableImprovements.immediate.length > 0
        ? `Top recommendation: ${report.actionableImprovements.immediate[0]?.problem}. Change: ${report.actionableImprovements.immediate[0]?.change}`
        : `Review section-by-section optimization recommendations in reading mode.`
    }
  ] : [];

  // Start Voice Narration
  const startVoiceMode = () => {
    setViewMode('VOICE');
    setNarrativeSectionIndex(0);
    if (narrationSections[0]) {
      speakFeedback(`Beginning voice narration. Section 1 of ${narrationSections.length}: ${narrationSections[0].title}. ${narrationSections[0].text}`);
    }
  };

  // Next Voice Section
  const handleNextVoiceSection = () => {
    if (narrativeSectionIndex < narrationSections.length - 1) {
      const nextIdx = narrativeSectionIndex + 1;
      setNarrativeSectionIndex(nextIdx);
      const sec = narrationSections[nextIdx];
      speakFeedback(`Section ${nextIdx + 1}: ${sec.title}. ${sec.text}`);
    } else {
      speakFeedback("Voice narration complete. Switching to detailed reading mode.");
      setViewMode('READING');
    }
  };

  // Repeat Voice Section
  const handleRepeatVoiceSection = () => {
    const sec = narrationSections[narrativeSectionIndex];
    if (sec) speakFeedback(`Repeating section ${narrativeSectionIndex + 1}: ${sec.title}. ${sec.text}`);
  };

  // Switch to Reading Mode
  const startReadingMode = () => {
    setViewMode('READING');
    speakFeedback(activeLanguage === 'hi-IN' ? "पठन मोड चालू हो गया है।" : "Reading mode active. You can now explore your 13-section report.");
  };

  // Generate improved markdown resume based strictly on actual extracted facts
  const handleImproveResume = () => {
    if (!report) return;
    setImproving(true);
    setTimeout(() => {
      const candidateName = report.candidate.name || fullName;
      const role = report.candidate.currentRole || 'Software Professional';
      
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
    }, 1000);
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
    <div className="space-y-6">
      
      {/* Title */}
      <div className="space-y-1">
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-850 dark:text-white flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-emerald-500" /> Resume Intelligence & 13-Section AI Audit
        </h2>
        <p className="text-xs sm:text-sm text-slate-500">
          Upload your resume file to run real AI content parsing, ATS score auditing, vulnerability detection, and voice narration.
        </p>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Upload & Sample Scanner Column (4 Cols) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 space-y-5 shadow-sm">
            <h3 className="font-bold border-b border-slate-100 dark:border-slate-850 pb-3 text-slate-800 dark:text-white text-xs sm:text-sm uppercase tracking-wider">
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
                  ? 'border-emerald-500 bg-emerald-50/10' 
                  : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 hover:bg-slate-50 dark:hover:bg-slate-850'
              }`}
            >
              <UploadCloud className="w-12 h-12 text-slate-400 mb-3" />
              <p className="text-xs font-bold text-slate-700 dark:text-slate-200">
                Click or drag resume here
              </p>
              <p className="text-[10px] text-slate-400 mt-1">
                PDF, DOCX, or TXT up to 10MB
              </p>
            </div>

            {/* Built-in Sample Test Action */}
            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-850">
              <span className="text-[9px] font-bold text-slate-450 uppercase tracking-widest block">Run Real Sample Resumes:</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => scanSampleResume('SOFTWARE')}
                  className="py-2 px-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/20 rounded-xl text-[10px] font-bold transition text-left"
                >
                  Frontend Candidate (React / WCAG)
                </button>
                <button
                  type="button"
                  onClick={() => scanSampleResume('DATA_AI')}
                  className="py-2 px-3 bg-blue-500/10 border border-blue-500/20 text-blue-700 dark:text-blue-400 hover:bg-blue-500/20 rounded-xl text-[10px] font-bold transition text-left"
                >
                  Data Science Candidate (Python / ML)
                </button>
              </div>
            </div>

            {/* Error Message Card */}
            {errorMsg && (
              <div className="p-4 rounded-xl border border-red-500/30 bg-red-500/10 space-y-2 text-red-600 dark:text-red-400 text-xs">
                <div className="flex items-start gap-2.5">
                  <XCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">Analysis Failed</p>
                    <p className="text-[11px] opacity-90 mt-0.5">{errorMsg}</p>
                  </div>
                </div>
                {file && (
                  <button
                    onClick={() => uploadAndAnalyzeFile(file)}
                    className="w-full py-1.5 px-3 bg-red-500/20 hover:bg-red-500/30 text-red-700 dark:text-red-300 font-bold rounded-lg text-[11px] transition flex items-center justify-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Retry Analysis
                  </button>
                )}
              </div>
            )}

            {/* Loading Indicator */}
            {loading && (
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-850 space-y-3 animate-pulse">
                <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  <div className="w-3.5 h-3.5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                  <span>{loadingStage}</span>
                </div>
                <p className="text-[10px] text-slate-400">Extracting raw file contents and executing Gemini AI structured analysis.</p>
              </div>
            )}

            {report && !loading && (
              <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <div className="text-xs">
                      <p className="font-bold text-slate-850 dark:text-white">Extraction & Analysis Complete</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{fileName}</p>
                    </div>
                  </div>
                  <span className="text-xs font-black text-emerald-500 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                    {report.score}/100
                  </span>
                </div>
                {wordCount !== undefined && (
                  <div className="p-2 bg-emerald-500/10 rounded-lg text-[10px] text-emerald-700 dark:text-emerald-300 font-medium">
                    ✓ Extracted {wordCount} readable words across {pageCount || 1} pages using {extractionMethod || 'pdf-parse'}.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Results & Interaction Column (8 Cols) */}
        <div className="lg:col-span-8">
          
          {/* A. Mode Choice Prompt Modal (Voice vs Reading) */}
          {viewMode === 'PROMPT' && report && (
            <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl text-white space-y-6 shadow-xl animate-in fade-in duration-200">
              <div className="space-y-2 text-center max-w-lg mx-auto">
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                  Analysis Complete
                </span>
                <h3 className="text-xl font-extrabold text-white">How would you like to explore your report?</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Your resume has been parsed and structured into 13 detailed audit sections. Choose how you want to receive your analysis:
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md mx-auto">
                <button
                  onClick={startVoiceMode}
                  className="p-5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-2xl text-left space-y-2 font-bold transition group focus:outline-none shadow-lg shadow-emerald-500/10"
                >
                  <div className="flex items-center justify-between">
                    <Volume2 className="w-6 h-6 text-slate-950" />
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition" />
                  </div>
                  <div>
                    <p className="text-sm font-extrabold">🎙 Continue with Voice</p>
                    <p className="text-[11px] font-normal opacity-85 mt-0.5">Hear your resume analysis narrated section-by-section.</p>
                  </div>
                </button>

                <button
                  onClick={startReadingMode}
                  className="p-5 bg-slate-800 hover:bg-slate-750 text-white rounded-2xl text-left space-y-2 font-bold transition border border-slate-700 group focus:outline-none"
                >
                  <div className="flex items-center justify-between">
                    <Eye className="w-6 h-6 text-emerald-400" />
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition" />
                  </div>
                  <div>
                    <p className="text-sm font-extrabold">📖 Read Analysis</p>
                    <p className="text-[11px] font-normal text-slate-400 mt-0.5">Explore the visual report and 13 audit cards yourself.</p>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* B. Voice Narration Mode UI */}
          {viewMode === 'VOICE' && report && (
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl text-white space-y-6 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 animate-pulse">
                    <Volume2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white">Voice Agent Resume Narration</h3>
                    <p className="text-[11px] text-slate-400">Section {narrativeSectionIndex + 1} of {narrationSections.length}</p>
                  </div>
                </div>

                <button
                  onClick={startReadingMode}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded-xl text-xs font-semibold border border-slate-700 transition"
                >
                  Switch to Reading Mode
                </button>
              </div>

              {/* Active Section Card */}
              {narrationSections[narrativeSectionIndex] && (
                <div className="p-6 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest block">
                    {narrationSections[narrativeSectionIndex].title}
                  </span>
                  <p className="text-sm text-slate-200 leading-relaxed font-medium">
                    {narrationSections[narrativeSectionIndex].text}
                  </p>
                </div>
              )}

              {/* Interactive Player Controls */}
              <div className="flex items-center justify-between gap-3 pt-2">
                <button
                  onClick={handleRepeatVoiceSection}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-750 text-slate-200 rounded-xl text-xs font-bold transition flex items-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" /> Repeat Section
                </button>

                <button
                  onClick={handleNextVoiceSection}
                  className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-xs font-extrabold transition flex items-center gap-2 shadow-lg shadow-emerald-500/10"
                >
                  Next Section <SkipForward className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* C. Reading Mode / 13-Section Detailed Visual Report */}
          {viewMode === 'READING' && report && (
            <div className="space-y-6 animate-in fade-in duration-200">
              
              {/* Header Score Card */}
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl text-white space-y-4 shadow-md">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider bg-emerald-500/10 px-2.5 py-1 rounded border border-emerald-500/20">
                      Grounded AI Resume Audit
                    </span>
                    <h3 className="font-extrabold text-lg text-white mt-1">
                      {report.candidate.name && !report.candidate.name.startsWith('%PDF') && !report.candidate.name.includes('CreationDate')
                        ? report.candidate.name
                        : fullName}
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">{report.candidate.executiveSummary}</p>
                  </div>
                  <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 text-center shrink-0 min-w-[120px]">
                    <span className="text-3xl font-black text-emerald-400 leading-none">{report.score}</span>
                    <span className="text-slate-400 text-[10px] font-bold block mt-1 uppercase tracking-wider">Overall Score</span>
                  </div>
                </div>

                {/* Score Breakdown Grid */}
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 pt-3 border-t border-slate-800 text-center text-[10px]">
                  <div className="p-2 bg-slate-950 rounded-xl border border-slate-850">
                    <span className="text-slate-400 block font-semibold">Content</span>
                    <span className="font-extrabold text-emerald-400 text-xs">{report.scoreBreakdown.content}</span>
                  </div>
                  <div className="p-2 bg-slate-950 rounded-xl border border-slate-850">
                    <span className="text-slate-400 block font-semibold">Experience</span>
                    <span className="font-extrabold text-emerald-400 text-xs">{report.scoreBreakdown.experience}</span>
                  </div>
                  <div className="p-2 bg-slate-950 rounded-xl border border-slate-850">
                    <span className="text-slate-400 block font-semibold">Skills</span>
                    <span className="font-extrabold text-emerald-400 text-xs">{report.scoreBreakdown.skills}</span>
                  </div>
                  <div className="p-2 bg-slate-950 rounded-xl border border-slate-850">
                    <span className="text-slate-400 block font-semibold">Projects</span>
                    <span className="font-extrabold text-emerald-400 text-xs">{report.scoreBreakdown.projects}</span>
                  </div>
                  <div className="p-2 bg-slate-950 rounded-xl border border-slate-850">
                    <span className="text-slate-400 block font-semibold">Education</span>
                    <span className="font-extrabold text-emerald-400 text-xs">{report.scoreBreakdown.education}</span>
                  </div>
                  <div className="p-2 bg-slate-950 rounded-xl border border-slate-850">
                    <span className="text-slate-400 block font-semibold">ATS</span>
                    <span className="font-extrabold text-emerald-400 text-xs">{report.scoreBreakdown.atsReadiness}</span>
                  </div>
                </div>
              </div>

              {/* SECTION 1: Grounded Strengths */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 space-y-3.5">
                <h4 className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-850 pb-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Grounded Resume Strengths
                </h4>
                <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  {report.strengths.map((str, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-emerald-500 font-bold">•</span>
                      <span>{str}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* SECTION 2: Work Experience Evaluation */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 space-y-4">
                <h4 className="font-bold text-xs text-slate-500 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-850 pb-2">
                  <Briefcase className="w-4 h-4 text-emerald-500" /> Work Experience Audit
                </h4>
                {report.workExperience.length > 0 ? (
                  <div className="space-y-4">
                    {report.workExperience.map((exp, idx) => (
                      <div key={idx} className="p-4 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-200/60 dark:border-slate-800 space-y-2 text-xs">
                        <div className="flex justify-between items-start">
                          <div>
                            <h5 className="font-bold text-slate-850 dark:text-white text-sm">{exp.jobTitle}</h5>
                            <p className="text-slate-500 font-medium">{exp.company} {exp.dates ? `• ${exp.dates}` : ''}</p>
                          </div>
                        </div>
                        {exp.responsibilities.length > 0 && (
                          <ul className="list-disc pl-4 space-y-1 text-slate-650 dark:text-slate-300">
                            {exp.responsibilities.map((r, rIdx) => <li key={rIdx}>{r}</li>)}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic">No formal work experience entries extracted from the uploaded file.</p>
                )}
              </div>

              {/* SECTION 3: Projects Deep Dive */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 space-y-4">
                <h4 className="font-bold text-xs text-slate-500 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-850 pb-2">
                  <FolderGit2 className="w-4 h-4 text-emerald-500" /> Projects Analysis
                </h4>
                {report.projects.length > 0 ? (
                  <div className="space-y-3">
                    {report.projects.map((proj, idx) => (
                      <div key={idx} className="p-4 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-200/60 dark:border-slate-800 space-y-2 text-xs">
                        <h5 className="font-bold text-slate-850 dark:text-white text-sm">{proj.projectName}</h5>
                        <p className="text-slate-650 dark:text-slate-300">{proj.description}</p>
                        <div className="flex flex-wrap gap-1 pt-1">
                          {proj.technologies.map((tech, tIdx) => (
                            <span key={tIdx} className="px-2 py-0.5 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded text-[10px] font-semibold">
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic">No project section extracted from the uploaded file.</p>
                )}
              </div>

              {/* SECTION 4: Skills Matrix */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 space-y-4">
                <h4 className="font-bold text-xs text-slate-500 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-850 pb-2">
                  <Award className="w-4 h-4 text-emerald-500" /> Extracted Skills Categorization
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  {report.skills.programmingLanguages.length > 0 && (
                    <div>
                      <span className="font-bold text-slate-500 block text-[10px] uppercase mb-1">Languages</span>
                      <div className="flex flex-wrap gap-1">
                        {report.skills.programmingLanguages.map((s, i) => (
                          <span key={i} className="px-2 py-1 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 rounded-lg text-xs font-semibold">{s}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {report.skills.frameworks.length > 0 && (
                    <div>
                      <span className="font-bold text-slate-500 block text-[10px] uppercase mb-1">Frameworks</span>
                      <div className="flex flex-wrap gap-1">
                        {report.skills.frameworks.map((s, i) => (
                          <span key={i} className="px-2 py-1 bg-blue-500/10 text-blue-700 dark:text-blue-300 rounded-lg text-xs font-semibold">{s}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {report.skills.databases.length > 0 && (
                    <div>
                      <span className="font-bold text-slate-500 block text-[10px] uppercase mb-1">Databases</span>
                      <div className="flex flex-wrap gap-1">
                        {report.skills.databases.map((s, i) => (
                          <span key={i} className="px-2 py-1 bg-amber-500/10 text-amber-700 dark:text-amber-300 rounded-lg text-xs font-semibold">{s}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {report.skills.tools.length > 0 && (
                    <div>
                      <span className="font-bold text-slate-500 block text-[10px] uppercase mb-1">Tools</span>
                      <div className="flex flex-wrap gap-1">
                        {report.skills.tools.map((s, i) => (
                          <span key={i} className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold">{s}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* SECTION 5: Vulnerabilities & Weaknesses */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 space-y-4">
                <h4 className="font-bold text-xs text-amber-600 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-850 pb-2">
                  <ShieldAlert className="w-4 h-4" /> Resume Vulnerabilities & Weaknesses
                </h4>
                {report.vulnerabilities.length > 0 ? (
                  <div className="space-y-3">
                    {report.vulnerabilities.map((vuln, idx) => (
                      <div key={idx} className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 space-y-1.5 text-xs">
                        <div className="flex items-center justify-between">
                          <h5 className="font-bold text-slate-850 dark:text-white text-sm flex items-center gap-2">
                            <span>{vuln.issue}</span>
                          </h5>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                            vuln.priority === 'Critical' ? 'bg-red-500/20 text-red-500 border border-red-500/30' :
                            vuln.priority === 'High' ? 'bg-amber-500/20 text-amber-500 border border-amber-500/30' :
                            'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                          }`}>
                            {vuln.priority} Priority
                          </span>
                        </div>
                        <p className="text-slate-650 dark:text-slate-300"><strong>Why it matters:</strong> {vuln.whyItMatters}</p>
                        <p className="text-slate-650 dark:text-slate-300"><strong>How to fix:</strong> {vuln.howToFix}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic">No critical resume vulnerabilities detected.</p>
                )}
              </div>

              {/* SECTION 6: ATS Analysis */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 text-white">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <h4 className="font-bold text-xs text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
                    <FileCheck className="w-4 h-4" /> ATS Compatibility Audit
                  </h4>
                  <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded border border-emerald-500/20">
                    ATS Score: {report.atsAnalysis.score}/100
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{report.atsAnalysis.reasoning}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px] text-slate-400 pt-2 border-t border-slate-800">
                  <p><strong>Keyword Usage:</strong> {report.atsAnalysis.keywordUsage}</p>
                  <p><strong>Contact Info:</strong> {report.atsAnalysis.contactInformation}</p>
                </div>
              </div>

              {/* SECTION 7: Improvement & Download Action */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 space-y-4">
                <h4 className="font-bold text-xs text-slate-500 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-850 pb-2">
                  <TrendingUp className="w-4 h-4 text-emerald-500" /> Actionable Resume Improvements
                </h4>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={handleImproveResume}
                    disabled={improving}
                    className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold rounded-xl text-xs transition flex items-center justify-center gap-1.5 focus:outline-none"
                  >
                    {improving ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                        <span>Generating Revision...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" /> Generate Improved Resume (.MD)
                      </>
                    )}
                  </button>
                  {showImprovements && (
                    <button
                      onClick={handleDownloadImproved}
                      className="py-3 px-5 border border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-850 text-slate-750 dark:text-slate-200 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 focus:outline-none"
                    >
                      <Download className="w-4 h-4" /> Download Markdown
                    </button>
                  )}
                </div>

                {showImprovements && improvedResumeData && (
                  <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 max-h-60 overflow-y-auto text-xs font-mono leading-relaxed text-slate-350 whitespace-pre-wrap">
                    {improvedResumeData}
                  </div>
                )}
              </div>

            </div>
          )}

          {/* D. Default Initial View Awaiting Upload */}
          {!viewMode && !loading && (
            <div className="h-full flex flex-col items-center justify-center border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/30 rounded-2xl p-12 text-center text-slate-400 min-h-[480px]">
              <FileText className="w-12 h-12 text-slate-300 mb-3 animate-pulse" />
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Awaiting Resume File Upload
              </p>
              <p className="text-[10px] text-slate-400 mt-1 max-w-xs leading-normal">
                Upload your resume file (PDF, DOCX, or TXT) on the left or run a sample scan to generate your real 13-section AI analysis report.
              </p>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
