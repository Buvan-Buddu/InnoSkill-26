'use client';

import React, { useState, useEffect, useRef } from 'react';

export default function GeminiLiveTestPage() {
  const [connectionStatus, setConnectionStatus] = useState<'DISCONNECTED' | 'CONNECTING' | 'CONNECTED' | 'ERROR'>('DISCONNECTED');
  const [micStatus, setMicStatus] = useState<'INACTIVE' | 'REQUESTING' | 'ACTIVE' | 'ERROR'>('INACTIVE');
  const [geminiStatus, setGeminiStatus] = useState<'IDLE' | 'LISTENING' | 'PROCESSING' | 'SPEAKING'>('IDLE');
  
  // Real-time PCM Diagnostic Counters
  const [chunksSent, setChunksSent] = useState<number>(0);
  const [totalBytesSent, setTotalBytesSent] = useState<number>(0);
  const [lastChunkSize, setLastChunkSize] = useState<number>(0);
  const [micLevel, setMicLevel] = useState<number>(0);

  // Transcriptions & Logs
  const [inputTranscription, setInputTranscription] = useState<string>('');
  const [outputStatus, setOutputStatus] = useState<string>('Ready');
  const [logs, setLogs] = useState<string[]>([]);
  const [pipelineState, setPipelineState] = useState<string>('INACTIVE');

  // Audio & WebSocket Refs
  const wsRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const playbackContextRef = useRef<AudioContext | null>(null);
  const playbackWorkletRef = useRef<AudioWorkletNode | null>(null);
  const workletNodeRef = useRef<AudioWorkletNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const pendingPcmBufferRef = useRef<number[]>([]);
  const isStreamingRef = useRef<boolean>(false);

  const addLog = (msg: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prev) => [`[${timestamp}] ${msg}`, ...prev.slice(0, 49)]);
    console.log(`[LIVE TEST] ${msg}`);
  };

  // Phase 0: Start Voice Session (Microphone + WebSocket)
  const startVoiceTest = async () => {
    if (isStreamingRef.current) return;
    addLog('MIC_REQUESTED: Requesting microphone permission...');
    setMicStatus('REQUESTING');
    setConnectionStatus('CONNECTING');
    setPipelineState('INITIALIZING');

    try {
      // 1. Request Microphone MediaStream
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        }
      });
      mediaStreamRef.current = stream;
      addLog('MIC_GRANTED: Microphone access granted.');
      setMicStatus('ACTIVE');

      // 2. Fetch Ephemeral Token Configuration
      addLog('GEMINI_SOCKET_CONNECTING: Fetching short-lived session token...');
      const tokenRes = await fetch('/api/gemini/live-token', { method: 'POST' });
      const tokenData = await tokenRes.json();

      if (!tokenData.success || !tokenData.wsUrl) {
        addLog(`GEMINI_ERROR: Failed to fetch token - ${tokenData.error}`);
        setConnectionStatus('ERROR');
        return;
      }

      // 3. Connect WebSocket to Gemini Live
      const ws = new WebSocket(tokenData.wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        addLog('GEMINI_SOCKET_CONNECTED: WebSocket opened to Gemini Live endpoint.');
        setConnectionStatus('CONNECTED');
        setGeminiStatus('LISTENING');

        // Send Initial Setup with Google Official geminilive.js Format
        const setupPayload = {
          setup: {
            model: tokenData.model || 'models/gemini-2.0-flash-exp',
            generationConfig: {
              responseModalities: ['AUDIO', 'TEXT'],
              speechConfig: {
                voiceConfig: {
                  prebuiltVoiceConfig: {
                    voiceName: 'Puck'
                  }
                }
              }
            },
            systemInstruction: {
              parts: [
                {
                  text: `You are a voice input test assistant. Listen carefully to the user's speech. The user will say simple words such as: Yes, No, English, Hindi, Yes please, Yeah, I want English. Wait for the user to finish speaking. Return a short spoken response acknowledging what you heard.`
                }
              ]
            },
            inputAudioTranscription: {}
          }
        };

        ws.send(JSON.stringify(setupPayload));
        addLog('GEMINI_SESSION_CONFIGURED: Initial setup payload sent to Gemini Live.');
        
        // 4. Initialize 16kHz PCM Capture AudioContext & AudioWorklet
        initAudioCapture(stream);
        
        // 5. Initialize 24kHz PCM Playback AudioContext & AudioWorklet
        initAudioPlayback();
      };

      ws.onmessage = (event) => {
        handleServerMessage(event.data);
      };

      ws.onerror = (err) => {
        addLog('GEMINI_ERROR: WebSocket error occurred.');
        setConnectionStatus('ERROR');
      };

      ws.onclose = () => {
        addLog('GEMINI_SOCKET_CLOSED: WebSocket session closed.');
        setConnectionStatus('DISCONNECTED');
        setGeminiStatus('IDLE');
      };
    } catch (err: any) {
      addLog(`GEMINI_ERROR: Failed to start test session - ${err.message}`);
      setMicStatus('ERROR');
      setConnectionStatus('ERROR');
    }
  };

  // Initialize 16kHz PCM Microphone Capture AudioWorklet
  const initAudioCapture = async (stream: MediaStream) => {
    try {
      addLog('AUDIO_CONTEXT_CREATED: Creating 16kHz AudioContext for microphone capture...');
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: 16000
      });
      audioContextRef.current = ctx;

      if (ctx.state === 'suspended') {
        await ctx.resume();
      }

      addLog('AUDIO_WORKLET_LOADED: Loading /audio-worklet/capture.worklet.js...');
      await ctx.audioWorklet.addModule('/audio-worklet/capture.worklet.js');

      const worklet = new AudioWorkletNode(ctx, 'audio-capture-processor');
      workletNodeRef.current = worklet;

      const source = ctx.createMediaStreamSource(stream);
      source.connect(worklet);

      isStreamingRef.current = true;
      addLog('PCM_CAPTURE_STARTED: Worklet capturing Int16 PCM samples (~100ms 16kHz chunks)...');
      setPipelineState('AUDIO IS REACHING WORKLET');

      let chunkCount = 0;
      let totalBytes = 0;

      worklet.port.onmessage = (event) => {
        if (!isStreamingRef.current) return;

        if (event.data.type === 'audio') {
          const inputData: Float32Array = event.data.data;
          
          // Calculate RMS level for UI meter
          let sum = 0;
          for (let i = 0; i < inputData.length; i++) {
            sum += inputData[i] * inputData[i];
          }
          const rms = Math.sqrt(sum / inputData.length);
          setMicLevel(Math.min(100, Math.round(rms * 400)));

          // Convert Float32 (-1.0 to 1.0) to Int16 PCM (-32768 to 32767)
          for (let i = 0; i < inputData.length; i++) {
            const s = Math.max(-1, Math.min(1, inputData[i]));
            const int16Sample = s < 0 ? s * 0x8000 : s * 0x7FFF;
            pendingPcmBufferRef.current.push(int16Sample);
          }

          // Aggregate into target ~100ms chunks (1600 samples = 3200 bytes)
          if (pendingPcmBufferRef.current.length >= 1600) {
            const chunkSamples = pendingPcmBufferRef.current.splice(0, 1600);
            const int16Array = new Int16Array(chunkSamples);
            const base64Audio = arrayBufferToBase64(int16Array.buffer);

            // Stream base64 PCM over WebSocket (Google Official Format: realtimeInput.audio)
            if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
              wsRef.current.send(JSON.stringify({
                realtimeInput: {
                  audio: {
                    mimeType: 'audio/pcm',
                    data: base64Audio
                  }
                }
              }));

              chunkCount += 1;
              totalBytes += int16Array.buffer.byteLength;
              setChunksSent(chunkCount);
              setTotalBytesSent(totalBytes);
              setLastChunkSize(int16Array.buffer.byteLength);
            }
          }
        }
      };
    } catch (err: any) {
      addLog(`AUDIO_CAPTURE_ERROR: ${err.message}`);
      setPipelineState('MICROPHONE AUDIO IS NOT REACHING AUDIOWORKLET');
    }
  };

  // Initialize 24kHz PCM Audio Playback AudioWorklet
  const initAudioPlayback = async () => {
    try {
      const pCtx = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: 24000
      });
      playbackContextRef.current = pCtx;

      if (pCtx.state === 'suspended') {
        await pCtx.resume();
      }

      await pCtx.audioWorklet.addModule('/audio-worklet/playback.worklet.js');
      const pWorklet = new AudioWorkletNode(pCtx, 'pcm-processor');
      const gainNode = pCtx.createGain();
      gainNode.gain.value = 1.0;

      pWorklet.connect(gainNode);
      gainNode.connect(pCtx.destination);
      playbackWorkletRef.current = pWorklet;

      addLog('AUDIO_PLAYBACK_INITIALIZED: 24kHz Gemini audio playback worklet ready.');
    } catch (err: any) {
      addLog(`AUDIO_PLAYBACK_ERROR: ${err.message}`);
    }
  };

  // Play Gemini 24kHz PCM base64 audio output
  const playGeminiAudioChunk = (base64Audio: string) => {
    try {
      if (playbackContextRef.current && playbackContextRef.current.state === 'suspended') {
        playbackContextRef.current.resume();
      }

      const binaryString = atob(base64Audio);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      const inputArray = new Int16Array(bytes.buffer);
      const float32Data = new Float32Array(inputArray.length);
      for (let i = 0; i < inputArray.length; i++) {
        float32Data[i] = inputArray[i] / 32768;
      }

      if (playbackWorkletRef.current) {
        playbackWorkletRef.current.port.postMessage(float32Data);
        setGeminiStatus('SPEAKING');
        setOutputStatus('Playing audio response...');
      }
    } catch (err: any) {
      addLog(`PLAYBACK_ERROR: ${err.message}`);
    }
  };

  // Handle incoming Gemini Live WebSocket Server Messages (Google geminilive.js Format)
  const handleServerMessage = (dataStr: string) => {
    try {
      const msg = JSON.parse(dataStr);

      // 1. Handle Input Audio Transcription Diagnostics
      if (msg.serverContent?.inputTranscription?.text || msg.serverContent?.interimTranscript) {
        const text = msg.serverContent?.inputTranscription?.text || msg.serverContent?.interimTranscript;
        if (text) {
          setInputTranscription(text);
          addLog(`GEMINI_INPUT_TRANSCRIPTION: "${text}"`);
          setPipelineState('GEMINI AUDIO PIPELINE VERIFIED');
        }
      }

      if (msg.serverContent?.userTurn?.parts) {
        for (const part of msg.serverContent.userTurn.parts) {
          if (part.text) {
            setInputTranscription(part.text);
            addLog(`GEMINI_INPUT_FINAL: "${part.text}"`);
            setPipelineState('GEMINI AUDIO PIPELINE VERIFIED');
          }
        }
      }

      // 2. Handle Gemini Audio Responses
      if (msg.serverContent?.modelTurn?.parts) {
        for (const part of msg.serverContent.modelTurn.parts) {
          if (part.inlineData && part.inlineData.mimeType?.startsWith('audio/')) {
            addLog('GEMINI_AUDIO_RECEIVED: Received 24kHz PCM audio chunk from Gemini.');
            playGeminiAudioChunk(part.inlineData.data);
          }
          if (part.text) {
            setOutputStatus(`Assistant text: "${part.text}"`);
          }
        }
      }

      // 3. Handle Turn Completion
      if (msg.serverContent?.turnComplete) {
        addLog('GEMINI_TURN_COMPLETE: Model turn complete.');
        setGeminiStatus('LISTENING');
        setOutputStatus('Turn complete. Listening for user...');
      }

      // 4. Handle Barge-in Interruption Signal
      if (msg.serverContent?.interrupted) {
        addLog('GEMINI_INTERRUPTED: User interrupted playback.');
        if (playbackWorkletRef.current) {
          playbackWorkletRef.current.port.postMessage('interrupt');
        }
        setGeminiStatus('LISTENING');
        setOutputStatus('Interrupted. Listening...');
      }
    } catch (err: any) {
      addLog(`MESSAGE_PARSE_ERROR: ${err.message}`);
    }
  };

  // Stop Voice Session
  const stopVoiceTest = () => {
    isStreamingRef.current = false;
    pendingPcmBufferRef.current = [];

    if (workletNodeRef.current) {
      workletNodeRef.current.disconnect();
      workletNodeRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    if (playbackContextRef.current) {
      playbackContextRef.current.close();
      playbackContextRef.current = null;
    }

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    setMicStatus('INACTIVE');
    setConnectionStatus('DISCONNECTED');
    setGeminiStatus('IDLE');
    setMicLevel(0);
    addLog('TEST_STOPPED: Voice session completely stopped.');
  };

  useEffect(() => {
    return () => {
      stopVoiceTest();
    };
  }, []);

  const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 sm:p-8 my-8 space-y-6">
      <header className="border-b border-[#DCE5F0] pb-5 space-y-1">
        <span className="text-[10px] font-bold uppercase tracking-wider text-[#2F6FED] bg-[#EAF2FF] px-2.5 py-0.5 rounded-full border border-[#C8D5E5]">
          Diagnostic Tool
        </span>
        <h1 className="text-2xl font-bold text-[#172033]">
          Gemini Live Audio Diagnostics
        </h1>
        <p className="text-xs text-[#718096]">
          Direct PCM Microphone Stream &rarr; Gemini Live Real-Time Session &rarr; Live Input Transcription Diagnostics.
        </p>
      </header>

      {/* Control Buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={startVoiceTest}
          disabled={connectionStatus === 'CONNECTED' || connectionStatus === 'CONNECTING'}
          className="button-primary flex-1 py-3 text-sm font-bold"
        >
          {connectionStatus === 'CONNECTING' ? '⏳ Connecting to Gemini Live...' : '▶ Start Voice Test'}
        </button>

        <button
          onClick={stopVoiceTest}
          disabled={connectionStatus === 'DISCONNECTED'}
          className="button-danger flex-1 py-3 text-sm font-bold"
        >
          ⏹ Stop Voice Test
        </button>
      </div>

      {/* Status Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="surface-card p-4 border border-[#DCE5F0] bg-white space-y-1">
          <div className="text-[10px] font-bold uppercase tracking-wider text-[#718096]">Microphone Status</div>
          <div className={`text-base font-bold ${micStatus === 'ACTIVE' ? 'text-[#16A36A]' : 'text-[#D64545]'}`}>
            {micStatus === 'ACTIVE' ? '🎙 ACTIVE' : micStatus}
          </div>
        </div>

        <div className="surface-card p-4 border border-[#DCE5F0] bg-white space-y-1">
          <div className="text-[10px] font-bold uppercase tracking-wider text-[#718096]">Gemini Live Session</div>
          <div className={`text-base font-bold ${connectionStatus === 'CONNECTED' ? 'text-[#2F6FED]' : 'text-[#D64545]'}`}>
            {connectionStatus === 'CONNECTED' ? '⚡ CONNECTED' : connectionStatus}
          </div>
        </div>

        <div className="surface-card p-4 border border-[#DCE5F0] bg-white space-y-1">
          <div className="text-[10px] font-bold uppercase tracking-wider text-[#718096]">Model State</div>
          <div className="text-base font-bold text-[#2F6FED]">
            {geminiStatus}
          </div>
        </div>
      </div>

      {/* Microphone Level & PCM Diagnostics */}
      <div className="surface-card p-6 border border-[#DCE5F0] bg-white space-y-4">
        <div className="flex justify-between items-center text-xs">
          <span className="font-bold text-[#172033]">Microphone Level Meter</span>
          <span className="text-[#718096] font-semibold">{micLevel}%</span>
        </div>
        <div className="w-full h-3 bg-[#EEF4FB] rounded-full overflow-hidden">
          <div 
            className="h-full bg-[#2F6FED] transition-all duration-100" 
            style={{ width: `${micLevel}%` }} 
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-[#4B5870] pt-3 border-t border-[#DCE5F0]">
          <div>Chunks Sent: <strong className="text-[#172033]">{chunksSent}</strong></div>
          <div>Total Bytes: <strong className="text-[#172033]">{totalBytesSent.toLocaleString()} B</strong></div>
          <div>Chunk Size: <strong className="text-[#172033]">{lastChunkSize} B</strong></div>
          <div>Pipeline Status: <strong className={pipelineState.includes('VERIFIED') ? 'text-[#16A36A]' : 'text-[#D98A00]'}>{pipelineState}</strong></div>
        </div>
      </div>

      {/* Live Input Transcription Box */}
      <div className="surface-card p-6 border border-[#2F6FED]/40 bg-[#F4F8FF] space-y-2">
        <div className="text-xs font-bold text-[#2F6FED] uppercase tracking-wider">
          Gemini Input Transcription Diagnostic
        </div>
        <div className="text-base font-semibold text-[#172033] min-h-[40px]">
          {inputTranscription || 'Speak "Yes", "No", "English", or "Hindi" into your microphone...'}
        </div>
      </div>

      {/* Output Status */}
      <div className="surface-card p-4 border border-[#DCE5F0] bg-white space-y-1">
        <div className="text-[10px] font-bold uppercase tracking-wider text-[#718096]">Gemini Audio Output Status</div>
        <div className="text-xs text-[#4B5870]">{outputStatus}</div>
      </div>

      {/* Diagnostic Console Logs */}
      <div className="surface-card p-4 border border-[#DCE5F0] bg-[#F7F9FC] space-y-2">
        <div className="text-xs font-bold uppercase tracking-wider text-[#718096]">Diagnostic Log Console</div>
        <div className="max-h-48 overflow-y-auto font-mono text-xs text-[#172033] space-y-1 bg-white p-3 rounded-lg border border-[#DCE5F0]">
          {logs.length === 0 ? <div className="text-[#718096]">Logs will appear here when testing...</div> : logs.map((log, index) => <div key={index}>{log}</div>)}
        </div>
      </div>
    </div>
  );
}
