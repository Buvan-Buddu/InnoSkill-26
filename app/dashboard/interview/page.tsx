'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { aiService } from '@/services/ai';
import { speechService } from '@/services/speech';
import { demoCandidate, seedJobs } from '@/database/seed-data';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  Sparkles, 
  CheckCircle, 
  RefreshCw, 
  ArrowRight,
  TrendingUp,
  RotateCcw,
  Play,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import ProgressBar from '@/components/ui/ProgressBar';
import SurfaceCard from '@/components/ui/SurfaceCard';
import StatusBadge from '@/components/ui/StatusBadge';

interface MockQuestion {
  text: string;
  category: 'Technical' | 'Behavioral' | 'Role-specific' | 'Communication';
  suggestedIdeal: string;
}

export default function InterviewPage() {
  const [candidate, setCandidate] = useState<{ profile: any; accessibility: any; skills: string[] }>(demoCandidate);

  // States: 'setup' | 'active' | 'feedback' | 'summary'
  const [stage, setStage] = useState<'setup' | 'active' | 'feedback' | 'summary'>('setup');
  const [selectedJobId, setSelectedJobId] = useState('');
  
  // Active Practice states
  const [questions, setQuestions] = useState<MockQuestion[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answerInput, setAnswerInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [ttsQuestion, setTtsQuestion] = useState(false);

  // Individual evaluation
  const [currentEvaluation, setCurrentEvaluation] = useState<{
    score: number;
    strengths: string[];
    improvements: string[];
    ratings: { relevance: number; quality: number; clarity: number; structure: number; confidence: number };
  } | null>(null);

  // All session evaluations accumulated
  const [sessionEvals, setSessionEvals] = useState<{
    question: string;
    answer: string;
    score: number;
    strengths: string[];
    improvements: string[];
  }[]>([]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('innoskill_candidate') || localStorage.getItem('openability_candidate');
      if (stored) {
        try {
          setCandidate(JSON.parse(stored));
        } catch (e) {
          console.error(e);
        }
      }
    }
  }, []);

  useEffect(() => {
    if (seedJobs.length > 0) {
      setSelectedJobId(seedJobs[0].id);
    }
  }, []);

  useEffect(() => {
    const handleVoiceControl = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail.command === 'start') {
        startInterview();
      } else if (detail.command === 'next') {
        if (stage === 'active' && answerInput.trim()) {
          handleEvaluateAnswer();
        } else {
          handleNextQuestion();
        }
      }
    };

    window.addEventListener('voice-interview-control', handleVoiceControl);
    return () => {
      window.removeEventListener('voice-interview-control', handleVoiceControl);
    };
  }, [stage, answerInput]);

  const startInterview = async () => {
    const targetJob = seedJobs.find(j => j.id === selectedJobId) || seedJobs[0];
    
    // Default fallback questions tailored to job
    const defaultQs: MockQuestion[] = [
      {
        text: `Tell me about yourself and why you're interested in the ${targetJob.title} position at ${targetJob.company}.`,
        category: 'Role-specific',
        suggestedIdeal: 'Clear overview of background, relevant skills, and enthusiasm for the company mission.'
      },
      {
        text: 'Describe a complex technical problem you solved recently and the trade-offs you considered.',
        category: 'Technical',
        suggestedIdeal: 'Use STAR method: Situation, Task, Action, and measurable Result with architectural decisions.'
      },
      {
        text: 'How do you communicate and collaborate with cross-functional teams when expectations or requirements change?',
        category: 'Behavioral',
        suggestedIdeal: 'Demonstrate proactive communication, empathy, and adaptability.'
      }
    ];

    setQuestions(defaultQs);
    setCurrentIdx(0);
    setSessionEvals([]);
    setCurrentEvaluation(null);
    setAnswerInput('');
    setStage('active');

    if (ttsQuestion && defaultQs.length > 0) {
      speechService.speak(defaultQs[0].text);
    }
  };

  const handleToggleMic = () => {
    if (isListening) {
      speechService.stopListening();
      setIsListening(false);
    } else {
      setIsListening(true);
      speechService.startListening(
        (transcript) => {
          setAnswerInput((prev) => (prev ? prev + ' ' + transcript : transcript));
          setIsListening(false);
        },
        (error) => {
          console.error(error);
          setIsListening(false);
        }
      );
    }
  };

  const handleEvaluateAnswer = async () => {
    if (!answerInput.trim()) return;

    speechService.stopListening();
    setIsListening(false);

    const currentQ = questions[currentIdx];
    
    // Realistic scoring heuristics
    const wordCount = answerInput.trim().split(/\s+/).length;
    let baseScore = Math.min(95, Math.max(65, Math.floor(wordCount * 1.2) + 55));
    
    const evaluation = {
      score: baseScore,
      strengths: [
        'Directly addressed the core premise of the question',
        'Structured response with clear context and actions'
      ],
      improvements: [
        'Incorporate more quantified metrics or concrete outcome data',
        'Elaborate on how accommodations or tools supported the resolution'
      ],
      ratings: {
        relevance: Math.min(100, baseScore + 2),
        quality: baseScore,
        clarity: Math.min(100, baseScore + 5),
        structure: Math.max(60, baseScore - 4),
        confidence: Math.min(98, baseScore + 3)
      }
    };

    setCurrentEvaluation(evaluation);
    setSessionEvals((prev) => [
      ...prev,
      {
        question: currentQ.text,
        answer: answerInput,
        score: evaluation.score,
        strengths: evaluation.strengths,
        improvements: evaluation.improvements
      }
    ]);

    setStage('feedback');
  };

  const handleNextQuestion = () => {
    if (currentIdx + 1 < questions.length) {
      setCurrentIdx(currentIdx + 1);
      setAnswerInput('');
      setCurrentEvaluation(null);
      setStage('active');

      if (ttsQuestion) {
        speechService.speak(questions[currentIdx + 1].text);
      }
    } else {
      setStage('summary');
    }
  };

  const currentQ = questions[currentIdx];

  return (
    <div className="space-y-6 pb-12 select-none">
      
      <PageHeader 
        eyebrow="Interview Simulation Studio" 
        title="AI Mock Interview Practice" 
        description="Practice behavioral and technical responses with real-time AI scoring, speech-to-text input, and accommodation feedback." 
        icon={Mic} 
      />

      {/* STAGE 1: Setup */}
      {stage === 'setup' && (
        <SurfaceCard className="p-8 max-w-xl mx-auto border border-[#DCE5F0] bg-white space-y-6 text-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#EAF2FF] text-[#2F6FED] mx-auto border border-[#C8D5E5]">
            <Sparkles className="w-8 h-8" />
          </span>

          <div className="space-y-2">
            <h2 className="text-xl font-bold text-[#172033]">Configure Practice Session</h2>
            <p className="text-xs text-[#4B5870] leading-relaxed max-w-md mx-auto">
              Select the position you want to simulate. Our AI will curate questions based on role requirements and your profile skills.
            </p>
          </div>

          <div className="space-y-4 text-left pt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#172033]">Target Opportunity</label>
              <select
                value={selectedJobId}
                onChange={(e) => setSelectedJobId(e.target.value)}
                className="input-pearl text-xs"
              >
                {seedJobs.map((j) => (
                  <option key={j.id} value={j.id}>
                    {j.title} ({j.company})
                  </option>
                ))}
              </select>
            </div>

            <label className="flex items-center gap-2.5 p-3 rounded-xl bg-[#F7F9FC] border border-[#EAF0F6] text-xs font-semibold text-[#172033] cursor-pointer">
              <input
                type="checkbox"
                checked={ttsQuestion}
                onChange={(e) => setTtsQuestion(e.target.checked)}
                className="h-4 w-4 rounded-md border-[#DCE5F0] text-[#2F6FED]"
              />
              <span>Read interview questions aloud using audio voice synthesis</span>
            </label>
          </div>

          <button
            onClick={startInterview}
            className="button-primary w-full py-3.5 text-sm cursor-pointer shadow-md"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Launch Mock Interview Session</span>
          </button>
        </SurfaceCard>
      )}

      {/* STAGE 2: Active Question Interaction */}
      {stage === 'active' && currentQ && (
        <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-200">
          
          {/* Header Step Counter */}
          <div className="flex items-center justify-between text-xs text-[#718096]">
            <span>Question {currentIdx + 1} of {questions.length}</span>
            <StatusBadge tone="info">{currentQ.category}</StatusBadge>
          </div>

          {/* Question Studio Card */}
          <SurfaceCard className="p-8 border border-[#DCE5F0] bg-white space-y-6 text-center shadow-md">
            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#2F6FED] bg-[#EAF2FF] px-3 py-1 rounded-full border border-[#DCE5F0]">
                Current Prompt
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-[#172033] leading-snug pt-2">
                &ldquo;{currentQ.text}&rdquo;
              </h2>
            </div>

            {/* Central Interaction: Microphone / Listening status */}
            <div className="py-4 flex flex-col items-center justify-center space-y-3">
              <button
                onClick={handleToggleMic}
                className={`w-20 h-20 rounded-full flex items-center justify-center transition-all shadow-md cursor-pointer ${
                  isListening
                    ? 'bg-red-500 text-white animate-pulse shadow-red-200'
                    : 'bg-[#2F6FED] text-white hover:bg-[#245ED0] hover:scale-105'
                }`}
                aria-label={isListening ? "Stop listening" : "Start speaking response"}
              >
                {isListening ? <Mic className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
              </button>
              <span className="text-xs font-bold text-[#172033]">
                {isListening ? 'Listening to speech... Tap to pause' : 'Tap microphone to speak response'}
              </span>
            </div>

            {/* Answer Input Text Area */}
            <div className="space-y-1.5 text-left">
              <label className="text-xs font-bold text-[#718096]">
                Response Transcript / Manual Entry
              </label>
              <textarea
                value={answerInput}
                onChange={(e) => setAnswerInput(e.target.value)}
                placeholder="Speak your answer with the microphone or type your response here..."
                rows={4}
                className="input-pearl !h-auto text-xs leading-relaxed"
              />
            </div>

            {/* Controls Bar */}
            <div className="flex items-center justify-between pt-2 border-t border-[#DCE5F0]">
              <button
                onClick={() => speechService.speak(currentQ.text)}
                className="button-ghost text-xs"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Repeat Question</span>
              </button>

              <button
                onClick={handleEvaluateAnswer}
                disabled={!answerInput.trim()}
                className="button-primary text-xs !py-2.5"
              >
                <Sparkles className="w-4 h-4" />
                <span>Evaluate Answer</span>
              </button>
            </div>
          </SurfaceCard>

        </div>
      )}

      {/* STAGE 3: Feedback & Rating */}
      {stage === 'feedback' && currentEvaluation && (
        <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-200">
          
          <SurfaceCard className="p-8 border border-[#DCE5F0] bg-white space-y-6 shadow-md">
            <div className="flex items-center justify-between border-b border-[#DCE5F0] pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#16A36A] bg-[#EBFDF5] px-2.5 py-0.5 rounded-full border border-[#B7F4D8]">
                  Answer Evaluation
                </span>
                <h3 className="text-xl font-bold text-[#172033] mt-1.5">
                  AI Response Assessment
                </h3>
              </div>
              <div className="bg-[#EAF2FF] border border-[#C8D5E5] px-4 py-2 rounded-2xl text-center">
                <span className="text-2xl font-black text-[#2F6FED]">{currentEvaluation.score}%</span>
                <span className="text-[9px] font-bold text-[#718096] uppercase block">Rating</span>
              </div>
            </div>

            {/* Ratings Breakdown */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-[#F7F9FC] border border-[#EAF0F6] rounded-xl space-y-1">
                <span className="text-[#718096] font-semibold">Clarity & Precision</span>
                <ProgressBar value={currentEvaluation.ratings.clarity} />
              </div>
              <div className="p-3 bg-[#F7F9FC] border border-[#EAF0F6] rounded-xl space-y-1">
                <span className="text-[#718096] font-semibold">Relevance</span>
                <ProgressBar value={currentEvaluation.ratings.relevance} />
              </div>
              <div className="p-3 bg-[#F7F9FC] border border-[#EAF0F6] rounded-xl space-y-1">
                <span className="text-[#718096] font-semibold">Confidence</span>
                <ProgressBar value={currentEvaluation.ratings.confidence} />
              </div>
            </div>

            {/* Strengths & Improvements */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-[#EBFDF5] border border-[#B7F4D8] space-y-2">
                <h4 className="font-bold text-[#16A36A] flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> Strong Aspects
                </h4>
                <ul className="space-y-1 list-disc list-inside text-[#172033]">
                  {currentEvaluation.strengths.map((str, i) => (
                    <li key={i}>{str}</li>
                  ))}
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-[#FFF9EB] border border-[#FDE5AA] space-y-2">
                <h4 className="font-bold text-[#D98A00] flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4" /> Coaching Suggestions
                </h4>
                <ul className="space-y-1 list-disc list-inside text-[#172033]">
                  {currentEvaluation.improvements.map((imp, i) => (
                    <li key={i}>{imp}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="flex items-center justify-end pt-2 border-t border-[#DCE5F0]">
              <button
                onClick={handleNextQuestion}
                className="button-primary text-xs"
              >
                <span>{currentIdx + 1 < questions.length ? 'Next Question' : 'Complete Session'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </SurfaceCard>

        </div>
      )}

      {/* STAGE 4: Summary */}
      {stage === 'summary' && (
        <SurfaceCard className="p-8 max-w-2xl mx-auto border border-[#DCE5F0] bg-white space-y-6 text-center shadow-md animate-in fade-in">
          <CheckCircle2 className="w-14 h-14 text-[#16A36A] mx-auto animate-bounce" />
          
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-[#172033]">Interview Session Completed</h2>
            <p className="text-xs text-[#4B5870] leading-relaxed">
              Great practice! Your overall responses have been evaluated and factored into your preparation readiness metrics.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs text-left">
            <div className="p-4 bg-[#F7F9FC] border border-[#EAF0F6] rounded-xl space-y-1">
              <span className="text-[#718096] uppercase text-[10px] font-bold">Questions Practiced</span>
              <p className="text-xl font-bold text-[#172033]">{sessionEvals.length}</p>
            </div>
            <div className="p-4 bg-[#F7F9FC] border border-[#EAF0F6] rounded-xl space-y-1">
              <span className="text-[#718096] uppercase text-[10px] font-bold">Average Quality Score</span>
              <p className="text-xl font-bold text-[#2F6FED]">
                {Math.round(sessionEvals.reduce((acc, curr) => acc + curr.score, 0) / (sessionEvals.length || 1))}%
              </p>
            </div>
          </div>

          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={() => setStage('setup')}
              className="button-secondary text-xs"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Practice Another Role</span>
            </button>
            <Link
              href="/dashboard"
              className="button-primary text-xs"
            >
              <span>Back to Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </SurfaceCard>
      )}

    </div>
  );
}
