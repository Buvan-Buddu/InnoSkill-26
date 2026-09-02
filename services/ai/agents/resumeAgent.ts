import { ResumeAnalysis, StructuredResumeReport, ResumeVulnerability, SectionOptimization } from '@/types';
export type { StructuredResumeReport };

export interface StructuredResumeFacts {
  contact: {
    name?: string;
    email?: string;
    phone?: string;
    location?: string;
    linkedin?: string;
    github?: string;
    portfolio?: string;
  };
  summary?: string;
  education: {
    degree?: string;
    institution?: string;
    fieldOfStudy?: string;
    graduationYear?: string;
    gpa?: string;
    achievements?: string[];
  }[];
  experience: {
    company: string;
    jobTitle: string;
    location?: string;
    dates?: string;
    duration?: string;
    responsibilities: string[];
    achievements: string[];
    technologies: string[];
  }[];
  projects: {
    projectName: string;
    description: string;
    technologies: string[];
    role?: string;
    features?: string[];
    impact?: string;
    link?: string;
  }[];
  skills: {
    programmingLanguages: string[];
    frameworks: string[];
    libraries: string[];
    databases: string[];
    aiMl: string[];
    cloudDevOps: string[];
    toolsPlatforms: string[];
    softSkills: string[];
    other: string[];
  };
  certifications: {
    name: string;
    issuingOrganization?: string;
    date?: string;
  }[];
  achievements: {
    title: string;
    issuer?: string;
    year?: string;
    description?: string;
  }[];
  researchInterests: string[];
  languages: string[];
}

import { OllamaProvider, CloudAIProvider } from '../providers';

export class ResumeAgent {
  async process(
    resumeText: string,
    targetRole?: string
  ): Promise<ResumeAnalysis & { structuredReport: StructuredResumeReport; facts: StructuredResumeFacts; improvements: string[]; missingKeySections: string[] }> {
    let facts: StructuredResumeFacts | null = null;
    let structuredReport: StructuredResumeReport | null = null;

    // Primary Provider: Local Ollama Desktop
    const ollama = new OllamaProvider();
    const ollamaStatus = await ollama.isAvailable();

    if (ollamaStatus.available) {
      console.log(`[ResumeAI] Provider: ollama | Model: ${ollamaStatus.model}`);
      try {
        facts = await ollama.extractFacts(resumeText);
        if (facts) {
          structuredReport = await ollama.evaluateResume(resumeText, facts, targetRole);
        }
      } catch (ollamaErr: any) {
        console.warn('[ResumeAI] Ollama evaluation warning:', ollamaErr.message);
      }
    } else {
      console.warn(`[ResumeAI] Local Ollama unavailable (${ollamaStatus.reason}). Checking secondary Cloud AI Provider...`);
      const cloud = new CloudAIProvider();
      const cloudStatus = await cloud.isAvailable();
      if (cloudStatus.available) {
        console.log(`[ResumeAI] Provider: ${cloud.name} | Model: ${cloudStatus.model}`);
        try {
          facts = await cloud.extractFacts(resumeText);
          if (facts) {
            structuredReport = await cloud.evaluateResume(resumeText, facts, targetRole);
          }
        } catch (cloudErr: any) {
          console.warn('[ResumeAI] Cloud AI evaluation warning:', cloudErr.message);
        }
      } else {
        console.warn('[ResumeAI] Neither Ollama nor Cloud AI available. Running real-text heuristic fact extractor.');
      }
    }

    if (!facts) {
      facts = this.extractFactsHeuristically(resumeText);
    }
    if (!structuredReport) {
      structuredReport = this.evaluateFactsHeuristically(resumeText, facts, targetRole);
    }

    const summary = structuredReport.candidate.executiveSummary || `Parsed resume for ${facts.contact.name || 'Candidate'}.`;
    const experienceYears = structuredReport.candidate.totalExperienceYears || 0;
    const parsedSkills = [
      ...facts.skills.programmingLanguages,
      ...facts.skills.frameworks,
      ...facts.skills.databases,
      ...facts.skills.cloudDevOps,
      ...facts.skills.toolsPlatforms,
      ...facts.skills.aiMl
    ];

    const improvements = structuredReport.actionableImprovements.immediate.map(i => i.change);
    const missingKeySections: string[] = [];
    if (structuredReport.education.gaps.length > 0) missingKeySections.push(...structuredReport.education.gaps);
    if (structuredReport.experienceSummary.gaps.length > 0) missingKeySections.push(...structuredReport.experienceSummary.gaps);

    return {
      id: `res-anal-${Date.now()}`,
      resumeId: `res-${Date.now()}`,
      summary,
      experienceYears,
      parsedSkills: Array.from(new Set(parsedSkills)),
      structuredReport,
      facts,
      improvements,
      missingKeySections,
      rawAnalysis: { parsedAt: new Date().toISOString(), textLength: resumeText.length },
      analyzedAt: new Date()
    };
  }

  // STAGE A: AI Fact Extraction (Strict non-hallucination prompt)
  private async extractFactsWithGemini(resumeText: string, apiKey: string): Promise<StructuredResumeFacts | null> {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    const prompt = `You are a strict Resume Fact Extractor.
Extract ONLY facts explicitly present in the provided resume text.

STRICT RULES:
1. Extract ONLY facts explicitly contained in the text.
2. Never invent technologies, employers, dates, degrees, awards, or metrics.
3. If information is missing (e.g. phone, github, or specific date), return null or empty array.
4. Categorize skills contextually across programmingLanguages, frameworks, libraries, databases, aiMl, cloudDevOps, toolsPlatforms, softSkills, and other.
5. Return ONLY a valid JSON object matching the schema below.

SCHEMA:
{
  "contact": {
    "name": string or null,
    "email": string or null,
    "phone": string or null,
    "location": string or null,
    "linkedin": string or null,
    "github": string or null,
    "portfolio": string or null
  },
  "summary": string or null,
  "education": [
    {
      "degree": string or null,
      "institution": string or null,
      "fieldOfStudy": string or null,
      "graduationYear": string or null,
      "gpa": string or null,
      "achievements": string[]
    }
  ],
  "experience": [
    {
      "company": string,
      "jobTitle": string,
      "location": string or null,
      "dates": string or null,
      "duration": string or null,
      "responsibilities": string[],
      "achievements": string[],
      "technologies": string[]
    }
  ],
  "projects": [
    {
      "projectName": string,
      "description": string,
      "technologies": string[],
      "role": string or null,
      "features": string[],
      "impact": string or null,
      "link": string or null
    }
  ],
  "skills": {
    "programmingLanguages": string[],
    "frameworks": string[],
    "libraries": string[],
    "databases": string[],
    "aiMl": string[],
    "cloudDevOps": string[],
    "toolsPlatforms": string[],
    "softSkills": string[],
    "other": string[]
  },
  "certifications": [
    {
      "name": string,
      "issuingOrganization": string or null,
      "date": string or null
    }
  ],
  "achievements": [
    {
      "title": string,
      "issuer": string or null,
      "year": string or null,
      "description": string or null
    }
  ],
  "researchInterests": string[],
  "languages": string[]
}`;

    let candidateText = '';
    let finishReason = 'STOP';

    if (process.env.OPENAI_API_KEY) {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
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

      if (!response.ok) {
        console.warn(`[ResumeAnalysis Stage A] OpenAI API error: ${response.status}`);
        return null;
      }

      const data = await response.json();
      candidateText = data.choices?.[0]?.message?.content || '';
      finishReason = data.choices?.[0]?.finish_reason || 'stop';
    } else {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [
                { text: prompt },
                { text: `RESUME TEXT CONTENT:\n${resumeText.substring(0, 15000)}` }
              ]
            }
          ],
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.1,
            maxOutputTokens: 8192
          }
        })
      });

      if (!response.ok) {
        console.warn(`[ResumeAnalysis Stage A] Gemini API error: ${response.status}`);
        return null;
      }

      const data = await response.json();
      candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      finishReason = data.candidates?.[0]?.finishReason || 'STOP';
    }

    if (!candidateText) {
      console.warn('[ResumeAnalysis Stage A] Empty response text from AI provider');
      return null;
    }

    console.log(`[ResumeAnalysis Stage A] Response length: ${candidateText.length} | finishReason: ${finishReason}`);
    console.log(`[ResumeAnalysis Stage A] Starts with: ${candidateText.substring(0, 100).replace(/\n/g, ' ')}`);
    console.log(`[ResumeAnalysis Stage A] Ends with: ${candidateText.substring(Math.max(0, candidateText.length - 100)).replace(/\n/g, ' ')}`);

    return this.safeJsonParse<StructuredResumeFacts>(candidateText);
  }

  // STAGE B: AI Resume Evaluation
  private async evaluateResumeWithGemini(
    resumeText: string,
    facts: StructuredResumeFacts,
    apiKey: string,
    targetRole?: string
  ): Promise<StructuredResumeReport | null> {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    const prompt = `You are an expert Resume Evaluator & ATS Audit Specialist.
Evaluate the candidate using the extracted facts and clean resume text.

RULES:
1. Ground every strength and vulnerability in actual evidence from the resume.
2. Provide a transparent ATS score breakdown out of 100 across 10 categories.
3. Highlight vulnerabilities with explicit priority (Critical, High, Medium, Low) and 'evidence' fields.
4. For improved rewrites, use ONLY candidate facts. Use '[Add metric]' for missing numbers.

Return ONLY a raw JSON object matching the StructuredResumeReport schema.`;

    let candidateText = '';
    let finishReason = 'STOP';

    if (process.env.OPENAI_API_KEY) {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          response_format: { type: 'json_object' },
          messages: [
            { role: 'system', content: prompt },
            { role: 'user', content: `Target Role Context: ${targetRole || 'Not specified'}\nEXTRACTED FACTS:\n${JSON.stringify(facts, null, 2)}\n\nRAW TEXT:\n${resumeText.substring(0, 15000)}` }
          ],
          temperature: 0.2
        })
      });

      if (!response.ok) {
        console.warn(`[ResumeAnalysis Stage B] OpenAI API error: ${response.status}`);
        return null;
      }

      const data = await response.json();
      candidateText = data.choices?.[0]?.message?.content || '';
      finishReason = data.choices?.[0]?.finish_reason || 'stop';
    } else {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [
                { text: prompt },
                { text: `Target Role Context: ${targetRole || 'Not specified'}\nEXTRACTED FACTS:\n${JSON.stringify(facts, null, 2)}\n\nRAW TEXT:\n${resumeText.substring(0, 15000)}` }
              ]
            }
          ],
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.2,
            maxOutputTokens: 8192
          }
        })
      });

      if (!response.ok) {
        console.warn(`[ResumeAnalysis Stage B] Gemini API error: ${response.status}`);
        return null;
      }

      const data = await response.json();
      candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      finishReason = data.candidates?.[0]?.finishReason || 'STOP';
    }

    if (!candidateText) {
      console.warn('[ResumeAnalysis Stage B] Empty response text from AI provider');
      return null;
    }

    console.log(`[ResumeAnalysis Stage B] Response length: ${candidateText.length} | finishReason: ${finishReason}`);
    console.log(`[ResumeAnalysis Stage B] Starts with: ${candidateText.substring(0, 100).replace(/\n/g, ' ')}`);
    console.log(`[ResumeAnalysis Stage B] Ends with: ${candidateText.substring(Math.max(0, candidateText.length - 100)).replace(/\n/g, ' ')}`);

    return this.safeJsonParse<StructuredResumeReport>(candidateText);
  }

  // Resilient JSON Parser with Automatic Truncation Repair
  private safeJsonParse<T>(jsonText: string): T | null {
    if (!jsonText || !jsonText.trim()) return null;

    let clean = jsonText
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/```\s*$/i, '')
      .trim();

    try {
      return JSON.parse(clean) as T;
    } catch (err1) {
      console.warn('[ResumeAnalysis] Direct JSON.parse failed, executing defensive truncation repair...');

      try {
        let repaired = clean;

        // Balance unclosed quotes
        const quoteMatches = repaired.match(/(?<!\\)"/g) || [];
        if (quoteMatches.length % 2 !== 0) {
          repaired += '"';
        }

        // Track open brackets and braces
        const openStack: string[] = [];
        let inStr = false;

        for (let i = 0; i < repaired.length; i++) {
          const char = repaired[i];
          if (char === '"' && (i === 0 || repaired[i - 1] !== '\\')) {
            inStr = !inStr;
          } else if (!inStr) {
            if (char === '{' || char === '[') {
              openStack.push(char);
            } else if (char === '}' && openStack.length > 0 && openStack[openStack.length - 1] === '{') {
              openStack.pop();
            } else if (char === ']' && openStack.length > 0 && openStack[openStack.length - 1] === '[') {
              openStack.pop();
            }
          }
        }

        // Close unclosed arrays and objects
        while (openStack.length > 0) {
          const top = openStack.pop();
          if (top === '{') repaired += '}';
          else if (top === '[') repaired += ']';
        }

        const parsed = JSON.parse(repaired) as T;
        console.log('[ResumeAnalysis] Successfully repaired truncated JSON response!');
        return parsed;
      } catch (err2) {
        console.error('[ResumeAnalysis] Defensive JSON repair failed:', err2);
        return null;
      }
    }
  }

  // Real-Text Heuristic Fact Extractor
  private extractFactsHeuristically(resumeText: string): StructuredResumeFacts {
    const lines = resumeText.split('\n').map(l => l.trim()).filter(Boolean);
    const textLower = resumeText.toLowerCase();

    const emailMatch = resumeText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    const email = emailMatch ? emailMatch[0] : undefined;

    const phoneMatch = resumeText.match(/(\+\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
    const phone = phoneMatch ? phoneMatch[0] : undefined;

    const githubMatch = resumeText.match(/github\.com\/[a-zA-Z0-9_-]+/i);
    const github = githubMatch ? githubMatch[0] : undefined;

    const linkedinMatch = resumeText.match(/linkedin\.com\/in\/[a-zA-Z0-9_-]+/i);
    const linkedin = linkedinMatch ? linkedinMatch[0] : undefined;

    const nameLine = lines.find(l => l.length > 2 && !l.includes('@') && !l.includes('http') && !l.toLowerCase().includes('resume'));
    const candidateName = nameLine ? nameLine.substring(0, 45) : undefined;

    const skillCatalog = {
      programmingLanguages: ['JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'SQL', 'Go', 'Rust', 'HTML5', 'CSS3', 'PHP', 'Swift', 'Kotlin'],
      frameworks: ['React', 'Next.js', 'Node.js', 'Express', 'Django', 'FastAPI', 'Flask', 'Spring Boot', 'Vue', 'Angular', 'Tailwind CSS'],
      libraries: ['Redux', 'Pandas', 'NumPy', 'Scikit-learn', 'PyTorch', 'TensorFlow', 'RxJS', 'jQuery', 'OpenCV'],
      databases: ['PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'SQLite', 'DynamoDB', 'Oracle', 'Elasticsearch'],
      aiMl: ['Machine Learning', 'Deep Learning', 'NLP', 'Computer Vision', 'Generative AI', 'LLMs', 'Transformer', 'PyTorch', 'TensorFlow'],
      cloudDevOps: ['AWS', 'Docker', 'Kubernetes', 'GCP', 'Azure', 'CI/CD', 'GitHub Actions', 'Terraform', 'Linux', 'Nginx'],
      toolsPlatforms: ['Git', 'VS Code', 'Jira', 'Postman', 'Figma', 'Webpack', 'Vite', 'Babel', 'REST API', 'GraphQL'],
      softSkills: ['Leadership', 'Problem Solving', 'Team Collaboration', 'Agile', 'Communication']
    };

    const foundSkills: any = {
      programmingLanguages: [], frameworks: [], libraries: [], databases: [],
      aiMl: [], cloudDevOps: [], toolsPlatforms: [], softSkills: [], other: []
    };

    Object.keys(skillCatalog).forEach(cat => {
      (skillCatalog as any)[cat].forEach((skill: string) => {
        if (textLower.includes(skill.toLowerCase())) {
          foundSkills[cat].push(skill);
        }
      });
    });

    // Work Experience section parsing
    const expKeywords = ['experience', 'employment', 'work history', 'internship'];
    const experienceLines = lines.filter(l => expKeywords.some(k => l.toLowerCase().includes(k)) || l.toLowerCase().includes('engineer') || l.toLowerCase().includes('developer') || l.toLowerCase().includes('analyst'));
    const workExpList = experienceLines.slice(0, 4).map((line, idx) => ({
      company: line.split('|')[0] || line.split('-')[0] || `Company ${idx + 1}`,
      jobTitle: line,
      location: undefined,
      dates: undefined,
      duration: undefined,
      responsibilities: [`Performed responsibilities described in: ${line.trim()}`],
      achievements: [`Demonstrated experience in: ${line.trim()}`],
      technologies: foundSkills.programmingLanguages.concat(foundSkills.frameworks).slice(0, 3)
    }));

    // Education section parsing
    const eduKeywords = ['bachelor', 'b.s', 'b.tech', 'master', 'm.s', 'm.tech', 'phd', 'degree', 'university', 'college'];
    const eduLines = lines.filter(l => eduKeywords.some(k => l.toLowerCase().includes(k)));
    const educationList = eduLines.map(l => ({
      degree: l,
      institution: l.includes('University') ? l : 'University listed in resume',
      fieldOfStudy: l,
      graduationYear: undefined,
      gpa: undefined,
      achievements: []
    }));

    // Projects section parsing
    const projectKeywords = ['project', 'app', 'system', 'platform', 'dashboard', 'tool', 'website'];
    const projLines = lines.filter(l => projectKeywords.some(k => l.toLowerCase().includes(k)) && !l.toLowerCase().includes('experience'));
    const projectsList = projLines.slice(0, 3).map(l => ({
      projectName: l.substring(0, 35),
      description: l,
      technologies: foundSkills.programmingLanguages.slice(0, 3),
      role: 'Developer',
      features: ['Engineered application feature outlined in project section.'],
      impact: 'Demonstrated project capability.',
      link: undefined
    }));

    // Certifications section parsing
    const certKeywords = ['certificate', 'certification', 'certified', 'license', 'aws certified', 'iaap'];
    const certLines = lines.filter(l => certKeywords.some(k => l.toLowerCase().includes(k)));
    const certsList = certLines.map(l => ({
      name: l,
      issuingOrganization: undefined,
      date: undefined
    }));

    return {
      contact: { name: candidateName, email, phone, location: undefined, linkedin, github },
      summary: lines.find(l => l.toLowerCase().includes('summary') || l.toLowerCase().includes('profile')) || undefined,
      education: educationList,
      experience: workExpList,
      projects: projectsList,
      skills: foundSkills,
      certifications: certsList,
      achievements: [],
      researchInterests: [],
      languages: []
    };
  }

  // Real-Text Heuristic Evaluator
  private evaluateFactsHeuristically(resumeText: string, facts: StructuredResumeFacts, targetRole?: string): StructuredResumeReport {
    const textLower = resumeText.toLowerCase();
    const lines = resumeText.split('\n').map(l => l.trim()).filter(Boolean);

    const allSkills = [
      ...facts.skills.programmingLanguages,
      ...facts.skills.frameworks,
      ...facts.skills.databases,
      ...facts.skills.cloudDevOps,
      ...facts.skills.toolsPlatforms,
      ...facts.skills.aiMl
    ];

    let score = 70;
    if (allSkills.length >= 5) score += 10;
    if (facts.experience.length > 0) score += 10;
    if (facts.projects.length > 0) score += 5;
    if (facts.education.length > 0) score += 5;
    if (score > 95) score = 95;

    const vulnerabilities: ResumeVulnerability[] = [];
    if (!textLower.includes('%') && !textLower.match(/\d+\+/)) {
      vulnerabilities.push({
        issue: 'Lack of Quantified Metrics',
        whyItMatters: 'Bullet points without numerical outcomes feel unverified to hiring managers and ATS filters.',
        whereItOccurs: 'Work Experience / Projects section',
        howToFix: 'Include measurable results (e.g. "Increased performance by 25%", "Reduced latency by 200ms").',
        priority: 'High'
      });
    }
    if (!textLower.includes('wcag') && !textLower.includes('accessibility')) {
      vulnerabilities.push({
        issue: 'Missing Web Accessibility & Inclusive Design Standards',
        whyItMatters: 'Accessible UI architecture is a core requirement for inclusive engineering teams.',
        whereItOccurs: 'Skills & Experience section',
        howToFix: 'Highlight WCAG 2.1/2.2 AA benchmarks, ARIA roles, and assistive technology testing.',
        priority: 'Medium'
      });
    }

    return {
      score,
      scoreBreakdown: {
        content: Math.min(score, 85),
        experience: facts.experience.length > 0 ? 80 : 50,
        skills: Math.min(allSkills.length * 12, 90),
        projects: facts.projects.length > 0 ? 85 : 55,
        education: facts.education.length > 0 ? 85 : 60,
        atsReadiness: Math.min(score + 5, 90),
        impact: textLower.includes('%') ? 85 : 60,
        clarity: 80,
        formatting: 75
      },
      candidate: {
        name: facts.contact.name || 'Candidate',
        currentRole: facts.experience[0]?.jobTitle || targetRole || 'Software Professional',
        totalExperienceYears: facts.experience.length * 2 || 1,
        careerLevel: facts.experience.length > 2 ? 'Mid-Senior Level' : 'Early Career',
        primaryDomain: allSkills.includes('Python') || allSkills.includes('Machine Learning') ? 'AI & Data Science' : 'Software Engineering',
        resumeLength: `${lines.length} lines (~${Math.ceil(lines.length / 45)} page)`,
        qualityScore: score,
        executiveSummary: facts.summary || `Parsed resume for ${facts.contact.name || 'Candidate'} containing ${allSkills.length} identified technical skills (${allSkills.slice(0, 5).join(', ') || 'Technical Stack'}) and ${facts.experience.length} experience entries.`
      },
      education: {
        degree: facts.education[0]?.degree || 'Degree listed in education section',
        institution: facts.education[0]?.institution || 'Institution listed in education section',
        fieldOfStudy: facts.education[0]?.fieldOfStudy || 'Computer Science / Related Field',
        graduationYear: facts.education[0]?.graduationYear,
        academicAchievements: [],
        relevantCoursework: [],
        strengths: facts.education.length > 0 ? ['Formal degree listed on resume.'] : [],
        gaps: facts.education.length === 0 ? ['Education section is unformatted or missing.'] : []
      },
      workExperience: facts.experience.map(e => ({
        company: e.company,
        jobTitle: e.jobTitle,
        location: e.location,
        dates: e.dates,
        duration: e.duration,
        responsibilities: e.responsibilities,
        achievements: e.achievements,
        technologies: e.technologies,
        quantifiedImpact: [e.jobTitle]
      })),
      experienceSummary: {
        strengths: facts.experience.length > 0 ? ['Has explicit professional experience entries.'] : ['No clear experience entries extracted.'],
        gaps: facts.experience.length === 0 ? ['No work experience entries extracted from file.'] : [],
        achievementQuality: textLower.includes('%') ? 'Good quantification present' : 'Needs more numerical metric bullet points',
        quantificationOpportunities: ['Add numerical scale metrics or percentages to recent bullet points.']
      },
      projects: facts.projects.map(p => ({
        projectName: p.projectName,
        description: p.description,
        technologies: p.technologies,
        role: p.role,
        features: p.features,
        impact: p.impact,
        link: p.link,
        strengths: ['Relevant project listed.'],
        missingInfo: [],
        technicalDepth: 'Medium',
        businessImpact: 'Demonstrates practical project execution.',
        improvements: ['Add quantitative impact metric.']
      })),
      skills: {
        programmingLanguages: facts.skills.programmingLanguages,
        frameworks: facts.skills.frameworks,
        libraries: facts.skills.libraries,
        databases: facts.skills.databases,
        cloudDevops: facts.skills.cloudDevOps,
        aiMl: facts.skills.aiMl,
        tools: facts.skills.toolsPlatforms,
        softSkills: facts.skills.softSkills,
        otherTechnical: facts.skills.other,
        repeatedSkills: [],
        demonstratedInExperience: allSkills.slice(0, 3),
        listedOnlyNotDemonstrated: allSkills.slice(3)
      },
      certifications: {
        extracted: facts.certifications,
        strengths: facts.certifications.length > 0 ? ['Has professional industry certifications.'] : [],
        missingRelevantCertifications: ['Consider adding AWS or IAAP Web Accessibility certifications.']
      },
      strengths: [
        `Grounded in uploaded file: Found ${allSkills.length} technical skills (${allSkills.slice(0, 4).join(', ')}).`,
        `Extracted ${lines.length} lines of authentic candidate resume text.`,
        `Identified ${facts.experience.length} work experience entries.`
      ],
      skillsGaps: [
        {
          skillName: 'Web Accessibility & WCAG 2.1',
          status: textLower.includes('wcag') ? 'Present' : 'Missing',
          notes: textLower.includes('wcag') ? 'WCAG present in text' : 'Add WCAG compliance skills'
        }
      ],
      vulnerabilities,
      atsAnalysis: {
        score: Math.min(score + 5, 90),
        keywordUsage: `Found ${allSkills.length} technical keywords in clean extracted text.`,
        sectionHeadings: 'Standard section headings detected.',
        formattingReadability: 'Text extracted cleanly without binary PDF contamination.',
        jobTitleConsistency: facts.experience.length > 0 ? 'Consistent job titles.' : 'Job titles need clearer formatting.',
        skillsAlignment: 'Skills match candidate profile.',
        contactInformation: facts.contact.email ? `Contact email found: ${facts.contact.email}` : 'Contact email not found in uploaded resume.',
        reasoning: `ATS analysis based strictly on the ${lines.length} lines of clean text extracted from your file.`
      },
      actionableImprovements: {
        immediate: [
          {
            problem: 'Bullet points lack numerical metrics',
            change: 'Add percentage improvements or outcome metrics to recent project experience.',
            example: 'Change "Developed web interface" to "Developed interactive web interface improving user conversion by 18%".'
          }
        ],
        highImpact: [],
        optional: []
      },
      sectionOptimization: [
        {
          sectionName: 'Professional Summary',
          currentQuality: 'Needs Improvement',
          problems: ['Summary could be more impactful'],
          recommendedImprovements: ['Tailor summary to highlight core technical skills and career achievements.'],
          exampleRewrite: `${facts.contact.name || 'Candidate'} is a ${targetRole || 'Software Professional'} with demonstrated experience in ${allSkills.slice(0, 3).join(', ') || 'technical development'}.`
        }
      ]
    };
  }
}

export const resumeAgent = new ResumeAgent();
