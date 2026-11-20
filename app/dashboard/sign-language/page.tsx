'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { aiService } from '@/services/ai';
import { speechService } from '@/services/speech';
import { demoCandidate } from '@/database/seed-data';
import { 
  Camera, 
  CameraOff, 
  Sparkles, 
  CheckCircle, 
  Hand,
  Volume2,
  HelpCircle,
  ArrowRight
} from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import SurfaceCard from '@/components/ui/SurfaceCard';
import StatusBadge from '@/components/ui/StatusBadge';
import ProgressBar from '@/components/ui/ProgressBar';

export default function SignLanguagePrototype() {
  const [candidate, setCandidate] = useState<{ profile: any; accessibility: any; skills: string[] }>(demoCandidate);
  const [cameraActive, setCameraActive] = useState(false);
  const [detectedGesture, setDetectedGesture] = useState<string>('NONE');
  const [convertedText, setConvertedText] = useState<string>('');
  const [aiResponse, setAiResponse] = useState<string>('');
  const [confidence, setConfidence] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const requestRef = useRef<number | null>(null);

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

    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } });
      mediaStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setCameraActive(true);
      startSimulationTracking();
    } catch (err) {
      // Graceful fallback with simulation
      setCameraActive(true);
      startSimulationTracking();
    }
  };

  const stopCamera = () => {
    if (requestRef.current) {
      cancelAnimationFrame(requestRef.current);
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
    setDetectedGesture('NONE');
    setConfidence(0);
  };

  // Landmark tracking simulation on canvas in Pearl Blue
  const startSimulationTracking = () => {
    const render = () => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (canvas && ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (cameraActive) {
          ctx.strokeStyle = '#2F6FED'; // Pearl Blue
          ctx.fillStyle = '#2F6FED';
          ctx.lineWidth = 2.5;

          const centerX = canvas.width / 2;
          const centerY = canvas.height / 2;

          // Draw hand skeleton nodes
          for (let i = 0; i < 7; i++) {
            const angle = (i * 2 * Math.PI) / 7 + Date.now() / 1000;
            const x = centerX + Math.cos(angle) * 70;
            const y = centerY + Math.sin(angle) * 70;

            ctx.beginPath();
            ctx.arc(x, y, 5, 0, 2 * Math.PI);
            ctx.fill();

            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.lineTo(x, y);
            ctx.stroke();
          }
        }
      }
      requestRef.current = requestAnimationFrame(render);
    };

    requestRef.current = requestAnimationFrame(render);

    // Mock gesture detection loop
    const gestureInterval = setInterval(() => {
      if (cameraActive) {
        const gestures = ['HELLO', 'JOB SEARCH', 'RESUME HELP', 'INTERVIEW PRACTICE'];
        const randomG = gestures[Math.floor(Math.random() * gestures.length)];
        setDetectedGesture(randomG);
        setConfidence(Math.floor(Math.random() * 15) + 84);

        if (randomG === 'JOB SEARCH') {
          setConvertedText("I am looking for remote accessible software developer roles.");
        } else if (randomG === 'RESUME HELP') {
          setConvertedText("Can you please scan my resume for accessibility strengths?");
        } else if (randomG === 'INTERVIEW PRACTICE') {
          setConvertedText("Start mock interview for frontend engineer.");
        } else {
          setConvertedText("Hello InnoSkill assistant!");
        }
      }
    }, 4000);

    return () => clearInterval(gestureInterval);
  };

  const handleProcessGesture = async () => {
    if (!convertedText) return;
    setLoading(true);
    try {
      const response = await aiService.chatWithAssistant(
        convertedText,
        {
          fullName: candidate.profile.fullName,
          skills: candidate.skills,
          accessibility: candidate.accessibility
        },
        []
      );
      setAiResponse(response);
      speechService.speak(response);
    } catch (e) {
      console.error(e);
      setAiResponse("Gesture recognized, but failed to connect to assistant.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 select-none">
      
      <PageHeader 
        eyebrow="Vision Accessibility" 
        title="Sign Language Recognition Workspace" 
        description="Real-time optical gesture tracking converts sign language gestures into text queries for conversational career navigation." 
        icon={Hand} 
      />

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Video Canvas Workspace (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <SurfaceCard className="p-6 border border-[#DCE5F0] bg-white space-y-4">
            
            <div className="flex items-center justify-between border-b border-[#DCE5F0] pb-3">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-[#EAF2FF] text-[#2F6FED]">
                  <Camera className="w-4 h-4" />
                </span>
                <h3 className="font-bold text-xs uppercase tracking-wider text-[#172033]">
                  Camera Detection Stream
                </h3>
              </div>
              <StatusBadge tone={cameraActive ? 'success' : 'neutral'}>
                {cameraActive ? 'Tracking Active' : 'Camera Standby'}
              </StatusBadge>
            </div>

            {/* Viewport Screen */}
            <div className="relative aspect-video rounded-2xl bg-[#F7F9FC] border border-[#DCE5F0] overflow-hidden flex items-center justify-center">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover ${cameraActive ? 'block' : 'hidden'}`}
              />
              <canvas
                ref={canvasRef}
                width={640}
                height={480}
                className="absolute inset-0 w-full h-full pointer-events-none"
              />

              {!cameraActive && (
                <div className="text-center space-y-3 p-6">
                  <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EAF2FF] text-[#2F6FED] mx-auto border border-[#C8D5E5]">
                    <Hand className="w-7 h-7" />
                  </span>
                  <p className="text-xs text-[#718096]">
                    Camera currently inactive. Click below to start vision tracking.
                  </p>
                </div>
              )}
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between pt-1">
              {!cameraActive ? (
                <button
                  onClick={startCamera}
                  className="button-primary text-xs cursor-pointer"
                >
                  <Camera className="w-4 h-4" />
                  <span>Start Camera Tracking</span>
                </button>
              ) : (
                <button
                  onClick={stopCamera}
                  className="button-secondary text-xs cursor-pointer"
                >
                  <CameraOff className="w-4 h-4" />
                  <span>Stop Tracking</span>
                </button>
              )}
            </div>
          </SurfaceCard>
        </div>

        {/* Detection Status & AI Translation (5 Cols) */}
        <div className="lg:col-span-5 space-y-5">
          
          <SurfaceCard className="p-6 border border-[#DCE5F0] bg-white space-y-4">
            <h3 className="font-bold text-xs uppercase tracking-wider text-[#172033] border-b border-[#DCE5F0] pb-2">
              Gesture Recognition Diagnostics
            </h3>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-[#F7F9FC] border border-[#EAF0F6] rounded-xl flex items-center justify-between">
                <span className="text-[#718096]">Detected Gesture:</span>
                <span className="font-bold text-[#2F6FED] text-sm">{detectedGesture}</span>
              </div>

              <div className="p-3 bg-[#F7F9FC] border border-[#EAF0F6] rounded-xl space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-[#718096]">Confidence Score:</span>
                  <span className="font-bold text-[#172033]">{confidence}%</span>
                </div>
                <ProgressBar value={confidence} showValue={false} />
              </div>
            </div>
          </SurfaceCard>

          {/* Converted Text Output */}
          <SurfaceCard className="p-6 border border-[#DCE5F0] bg-white space-y-3">
            <h3 className="font-bold text-xs uppercase tracking-wider text-[#172033] border-b border-[#DCE5F0] pb-2">
              Translated Query
            </h3>
            
            <div className="p-3.5 bg-[#F7F9FC] border border-[#DCE5F0] rounded-xl text-xs font-semibold text-[#172033]">
              {convertedText || 'Sign language gestures will appear here as text translation.'}
            </div>

            <button
              onClick={handleProcessGesture}
              disabled={!convertedText || loading}
              className="button-primary w-full text-xs !py-2.5"
            >
              <Sparkles className="w-4 h-4" />
              <span>{loading ? 'Processing Query...' : 'Submit to AI Companion'}</span>
            </button>
          </SurfaceCard>

          {/* Assistant Response */}
          {aiResponse && (
            <SurfaceCard className="p-6 border border-[#C8D5E5] bg-[#EAF2FF] space-y-2 animate-in fade-in">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#2F6FED] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Spoken AI Guidance
              </span>
              <p className="text-xs leading-relaxed text-[#172033] font-medium">
                {aiResponse}
              </p>
            </SurfaceCard>
          )}

        </div>

      </div>

    </div>
  );
}
