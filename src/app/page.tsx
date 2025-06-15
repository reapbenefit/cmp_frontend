"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Mic, Square, Play, Pause, Send, Trash2, TreePine, Users, Recycle, Heart, Sprout, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

// TypeScript declarations for Audio APIs
declare global {
  interface Window {
    webkitAudioContext: typeof AudioContext;
  }
}

// Waveform component
const Waveform = ({ audioData }: { audioData: number[] }) => {
  return (
    <div className="flex items-center justify-center h-16 gap-1 px-4">
      {audioData.map((height, index) => (
        <div
          key={index}
          className="bg-green-500 rounded-full transition-all duration-100 ease-out"
          style={{
            width: '4px',
            height: `${Math.max(8, height * 50 + 10)}px`,
            opacity: Math.max(0.3, height * 0.7 + 0.3),
            backgroundColor: `hsl(${120 + height * 60}, 70%, ${50 + height * 20}%)`
          }}
        />
      ))}
    </div>
  );
};

// Example Actions component
const ExampleActions = ({ onExampleClick }: { onExampleClick: (text: string) => void }) => {
  const examples = [
    { icon: TreePine, text: "Planted trees", color: "text-green-600", starter: "Today I planted trees in my neighborhood to help combat climate change. " },
    { icon: Recycle, text: "Organized cleanup", color: "text-blue-600", starter: "I organized a community cleanup drive to keep our local area clean. " },
    { icon: Users, text: "Helped neighbors", color: "text-purple-600", starter: "I helped my neighbors with their daily needs and built stronger community bonds. " },
    { icon: Sprout, text: "Started garden", color: "text-emerald-600", starter: "I started a community garden to promote sustainable living and fresh produce. " },
    { icon: Heart, text: "Volunteered", color: "text-red-500", starter: "I volunteered my time for a local cause that I care deeply about. " },
    { icon: BookOpen, text: "Taught skills", color: "text-orange-600", starter: "I taught valuable skills to community members to help them grow. " }
  ];

  return (
    <div className="w-full max-w-4xl mx-auto mb-8">
      <p className="text-center text-gray-600 mb-4 text-sm font-medium">
        💡 Examples to get you started
      </p>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {examples.map((example, index) => {
          const Icon = example.icon;
          return (
            <div
              key={index}
              onClick={() => onExampleClick(example.starter)}
              className="bg-white/60 backdrop-blur-sm rounded-lg p-3 shadow-sm border border-gray-200/50 hover:bg-white/80 transition-all duration-200 cursor-pointer group"
            >
              <div className="flex items-center gap-2">
                <Icon className={`h-4 w-4 ${example.color} group-hover:scale-110 transition-transform duration-200`} />
                <span className="text-sm text-gray-700 font-medium">{example.text}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default function Home() {
  const [action, setAction] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [currentPlaybackTime, setCurrentPlaybackTime] = useState(0);
  const [audioData, setAudioData] = useState<number[]>(Array(20).fill(0.1));
  const [playbackAudioData, setPlaybackAudioData] = useState<number[]>(Array(20).fill(0.1));

  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const playbackAudioContextRef = useRef<AudioContext | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const animationRef = useRef<number | undefined>(undefined);
  const playbackAnimationRef = useRef<number | undefined>(undefined);
  const recordingStartTimeRef = useRef<number>(0);
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const playbackTimeIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const isRecordingRef = useRef(isRecording);
  isRecordingRef.current = isRecording;

  const isPlayingRef = useRef(isPlaying);
  isPlayingRef.current = isPlaying;

  const stopAudioAnalysis = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = undefined;
    }

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }

    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    setAudioData(Array(20).fill(0.1));
  }, []);

  const stopPlaybackAnalysis = useCallback(() => {
    if (playbackAnimationRef.current) {
      cancelAnimationFrame(playbackAnimationRef.current);
      playbackAnimationRef.current = undefined;
    }

    if (playbackAudioContextRef.current && playbackAudioContextRef.current.state !== 'closed') {
      playbackAudioContextRef.current.close();
      playbackAudioContextRef.current = null;
    }

    setPlaybackAudioData(Array(20).fill(0.1));
  }, []);

  const startAudioAnalysis = useCallback(async () => {
    try {
      console.log('Starting audio analysis...');
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        }
      });
      mediaStreamRef.current = stream;
      console.log('Got media stream:', stream);

      const context = new (window.AudioContext || window.webkitAudioContext)();
      audioContextRef.current = context;

      if (context.state === 'suspended') {
        await context.resume();
      }

      const source = context.createMediaStreamSource(stream);
      const analyzer = context.createAnalyser();

      analyzer.fftSize = 256;
      analyzer.smoothingTimeConstant = 0.5;
      analyzer.minDecibels = -90;
      analyzer.maxDecibels = -10;
      source.connect(analyzer);
      console.log('Audio context and analyzer set up');

      const bufferLength = analyzer.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const updateWaveform = () => {
        if (!isRecordingRef.current) {
          console.log('Stopping waveform: recording stopped');
          return;
        }

        analyzer.getByteFrequencyData(dataArray);

        // Calculate overall audio level for noise gating
        const totalEnergy = dataArray.reduce((sum, value) => sum + value * value, 0);
        const rmsLevel = Math.sqrt(totalEnergy / bufferLength);

        // Stricter noise gate: if overall level is too low, show no activity
        if (rmsLevel < 15) {
          setAudioData(Array(20).fill(0.1));
          animationRef.current = requestAnimationFrame(updateWaveform);
          return;
        }

        // Focus on voice frequency range, starting slightly higher to avoid room noise
        const sampleRate = audioContextRef.current?.sampleRate || 44100;
        const nyquist = sampleRate / 2;
        const binWidth = nyquist / bufferLength;

        // Map voice frequencies to bins - start higher to avoid low-frequency noise
        const voiceMinFreq = 120;  // 120 Hz instead of 80 Hz
        const voiceMaxFreq = 4000; // 4 kHz
        const voiceStartBin = Math.floor(voiceMinFreq / binWidth);
        const voiceEndBin = Math.floor(voiceMaxFreq / binWidth);
        const voiceRange = voiceEndBin - voiceStartBin;

        const waveformData = [];

        for (let i = 0; i < 20; i++) {
          // Use logarithmic-like distribution for better perceptual representation
          const logPosition = Math.pow(i / 19, 0.7); // Curve the distribution
          const binIndex = voiceStartBin + Math.floor(logPosition * voiceRange);

          // Average a few adjacent bins for smoother visualization
          const avgBins = 3;
          let sum = 0;
          let count = 0;

          for (let j = -Math.floor(avgBins / 2); j <= Math.floor(avgBins / 2); j++) {
            const currentBin = binIndex + j;
            if (currentBin >= voiceStartBin && currentBin <= voiceEndBin && currentBin < bufferLength) {
              sum += dataArray[currentBin];
              count++;
            }
          }

          const average = count > 0 ? sum / count : 0;

          // More conservative normalization
          let normalized = (average / 255) * 1.8;

          // Extra filtering for lower frequency bars (first 5 bars)
          if (i < 5) {
            // Higher threshold for low frequencies to combat room noise
            if (normalized < 0.15) {
              normalized = 0.1; // Force to rest state
            }
          }

          // Only boost signal if it's above noise floor
          if (normalized > 0.05) {
            normalized = Math.pow(normalized, 0.8); // Gentle curve for natural look
          } else {
            normalized = 0.1; // Rest state
          }

          waveformData.push(Math.min(1, normalized));
        }

        setAudioData(waveformData);
        animationRef.current = requestAnimationFrame(updateWaveform);
      };

      animationRef.current = requestAnimationFrame(updateWaveform);
      console.log('Waveform animation loop started');
    } catch (error) {
      console.error('Error in startAudioAnalysis:', error);
      alert('Could not access microphone. Please check permissions in your browser settings.');
      setIsRecording(false);
    }
  }, []);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      const chunks: BlobPart[] = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        setRecordedBlob(blob);
        stopAudioAnalysis();
      };

      mediaRecorder.start();
      setIsRecording(true);
      setCurrentPlaybackTime(0);
      recordingStartTimeRef.current = Date.now();

      // Start duration counter
      durationIntervalRef.current = setInterval(() => {
        setRecordingDuration(Math.floor((Date.now() - recordingStartTimeRef.current) / 1000));
      }, 1000);

      // Start waveform visualization
      startAudioAnalysis();

      console.log('Recording started');
    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Could not start recording. Please check microphone permissions.');
    }
  }, [startAudioAnalysis, stopAudioAnalysis]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }

    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
      durationIntervalRef.current = null;
    }

    setIsRecording(false);
    console.log('Recording stopped');
  }, []);

  const startPlaybackAnalysis = useCallback((audioElement: HTMLAudioElement) => {
    try {
      console.log('Starting playback analysis...');
      const context = new (window.AudioContext || window.webkitAudioContext)();
      playbackAudioContextRef.current = context;

      if (context.state === 'suspended') {
        context.resume();
      }

      const source = context.createMediaElementSource(audioElement);
      const analyzer = context.createAnalyser();

      analyzer.fftSize = 256;
      analyzer.smoothingTimeConstant = 0.5;
      analyzer.minDecibels = -90;
      analyzer.maxDecibels = -10;

      // Connect audio element to analyzer and then to speakers
      source.connect(analyzer);
      analyzer.connect(context.destination);

      console.log('Playback audio context and analyzer set up');

      const bufferLength = analyzer.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const updatePlaybackWaveform = () => {
        if (!isPlayingRef.current) {
          console.log('Stopping playback waveform: playback stopped');
          setPlaybackAudioData(Array(20).fill(0.1));
          return;
        }

        analyzer.getByteFrequencyData(dataArray);

        // Calculate overall audio level for noise gating
        const totalEnergy = dataArray.reduce((sum, value) => sum + value * value, 0);
        const rmsLevel = Math.sqrt(totalEnergy / bufferLength);

        // Lower threshold for playback since it's recorded audio
        if (rmsLevel < 5) {
          setPlaybackAudioData(Array(20).fill(0.1));
          playbackAnimationRef.current = requestAnimationFrame(updatePlaybackWaveform);
          return;
        }

        // Same frequency analysis as recording but for playback
        const sampleRate = playbackAudioContextRef.current?.sampleRate || 44100;
        const nyquist = sampleRate / 2;
        const binWidth = nyquist / bufferLength;

        const voiceMinFreq = 120;
        const voiceMaxFreq = 4000;
        const voiceStartBin = Math.floor(voiceMinFreq / binWidth);
        const voiceEndBin = Math.floor(voiceMaxFreq / binWidth);
        const voiceRange = voiceEndBin - voiceStartBin;

        const waveformData = [];

        for (let i = 0; i < 20; i++) {
          const logPosition = Math.pow(i / 19, 0.7);
          const binIndex = voiceStartBin + Math.floor(logPosition * voiceRange);

          const avgBins = 3;
          let sum = 0;
          let count = 0;

          for (let j = -Math.floor(avgBins / 2); j <= Math.floor(avgBins / 2); j++) {
            const currentBin = binIndex + j;
            if (currentBin >= voiceStartBin && currentBin <= voiceEndBin && currentBin < bufferLength) {
              sum += dataArray[currentBin];
              count++;
            }
          }

          const average = count > 0 ? sum / count : 0;
          let normalized = (average / 255) * 1.8;

          // Extra filtering for lower frequency bars
          if (i < 5) {
            if (normalized < 0.12) {
              normalized = 0.1;
            }
          }

          if (normalized > 0.05) {
            normalized = Math.pow(normalized, 0.8);
          } else {
            normalized = 0.1;
          }

          waveformData.push(Math.min(1, normalized));
        }

        setPlaybackAudioData(waveformData);
        playbackAnimationRef.current = requestAnimationFrame(updatePlaybackWaveform);
      };

      playbackAnimationRef.current = requestAnimationFrame(updatePlaybackWaveform);
      console.log('Playback waveform animation loop started');
    } catch (error) {
      console.error('Error in startPlaybackAnalysis:', error);
    }
  }, []);

  const playRecording = useCallback(() => {
    if (recordedBlob) {
      // If audio element doesn't exist, create it
      if (!audioElementRef.current) {
        const audioUrl = URL.createObjectURL(recordedBlob);
        const audio = new Audio(audioUrl);
        audioElementRef.current = audio;

        audio.onplay = () => {
          setIsPlaying(true);

          // Only start analysis when audio element is first created
          if (!playbackAudioContextRef.current) {
            startPlaybackAnalysis(audio);
          }

          // Start tracking playback time
          playbackTimeIntervalRef.current = setInterval(() => {
            if (audioElementRef.current) {
              setCurrentPlaybackTime(Math.floor(audioElementRef.current.currentTime));
            }
          }, 100); // Update every 100ms for smooth progress
        };

        audio.onpause = () => {
          setIsPlaying(false);
          // Don't stop analysis on pause - keep it running for resume

          // Stop tracking playback time
          if (playbackTimeIntervalRef.current) {
            clearInterval(playbackTimeIntervalRef.current);
            playbackTimeIntervalRef.current = null;
          }
        };

        audio.onended = () => {
          setIsPlaying(false);
          stopPlaybackAnalysis();
          setCurrentPlaybackTime(0);

          // Stop tracking playback time
          if (playbackTimeIntervalRef.current) {
            clearInterval(playbackTimeIntervalRef.current);
            playbackTimeIntervalRef.current = null;
          }

          // Reset audio element for next play
          audioElementRef.current = null;
          URL.revokeObjectURL(audioUrl);
        };
      } else {
        // For resume, just restart the time tracking
        if (!playbackTimeIntervalRef.current) {
          playbackTimeIntervalRef.current = setInterval(() => {
            if (audioElementRef.current) {
              setCurrentPlaybackTime(Math.floor(audioElementRef.current.currentTime));
            }
          }, 100);
        }
      }

      // Play the audio (either new or existing)
      if (audioElementRef.current) {
        audioElementRef.current.play();
        setIsPlaying(true);
      }
    }
  }, [recordedBlob, startPlaybackAnalysis, stopPlaybackAnalysis]);

  const pausePlayback = useCallback(() => {
    if (audioElementRef.current) {
      audioElementRef.current.pause();
    }
  }, []);

  const deleteRecording = useCallback(() => {
    if (audioElementRef.current) {
      audioElementRef.current.pause();
      audioElementRef.current = null;
    }

    // Clear playback time tracking
    if (playbackTimeIntervalRef.current) {
      clearInterval(playbackTimeIntervalRef.current);
      playbackTimeIntervalRef.current = null;
    }

    stopPlaybackAnalysis();
    setRecordedBlob(null);
    setRecordingDuration(0);
    setCurrentPlaybackTime(0);
    setIsPlaying(false);
  }, [stopPlaybackAnalysis]);

  const handleExampleClick = (text: string) => {
    setAction(text);
    // Focus the textarea after a short delay to ensure it's rendered
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        // Move cursor to the end of the text
        inputRef.current.setSelectionRange(text.length, text.length);
        // Trigger resize after setting text
        handleTextareaResize();
      }
    }, 100);
  };

  const handleTextareaResize = () => {
    if (inputRef.current) {
      // Reset height to auto to get the correct scrollHeight
      inputRef.current.style.height = 'auto';

      // Calculate the height needed
      const scrollHeight = inputRef.current.scrollHeight;

      // Set minimum height (1 line) and maximum height (5 lines)
      // Approximate line height is 24px, plus padding
      const minHeight = 60; // Original height for 1 line
      const maxHeight = 120; // Approximately 4 lines

      // Set the height, but don't exceed max
      const newHeight = Math.min(Math.max(scrollHeight, minHeight), maxHeight);
      inputRef.current.style.height = `${newHeight}px`;
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setAction(e.target.value);
    handleTextareaResize();
  };

  const handleSubmit = () => {
    if (recordedBlob) {
      // Here you would typically upload the audio blob to your server
      console.log('Submitting audio recording:', recordedBlob);
      alert('Voice recording submitted successfully! 🥷✨');
      // Reset state
      deleteRecording();
    } else if (action.trim()) {
      console.log('Submitting text action:', action);
      setAction("");
      alert('Action submitted successfully! 🥷✨');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    return () => {
      stopAudioAnalysis();
      stopPlaybackAnalysis();
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }
      if (playbackTimeIntervalRef.current) {
        clearInterval(playbackTimeIntervalRef.current);
      }
    };
  }, [stopAudioAnalysis, stopPlaybackAnalysis]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-10 w-32 h-32 bg-green-400 rounded-full blur-3xl"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-blue-400 rounded-full blur-2xl"></div>
        <div className="absolute bottom-40 left-1/4 w-40 h-40 bg-orange-400 rounded-full blur-3xl"></div>
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
        {/* Hero section */}
        <div className="text-center mb-8 max-w-2xl">
          <div className="mb-6">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-2">
              Solve Ninja Movement
            </h1>
            <p className="text-xl text-gray-700 mb-8">
              India's Largest Changemaker Community
            </p>
            <p className="text-lg text-gray-600 mb-8">
              Share your latest community action and inspire others to join the movement!
            </p>
          </div>

          {/* Stats or encouragement */}
          {/* <div className="flex justify-center gap-8 mb-8 text-center">
            <div className="bg-white/70 backdrop-blur-sm rounded-lg p-4 shadow-sm">
              <div className="text-2xl font-bold text-green-600">10M+</div>
              <div className="text-sm text-gray-600">Actions by 2030</div>
            </div>
            <div className="bg-white/70 backdrop-blur-sm rounded-lg p-4 shadow-sm">
              <div className="text-2xl font-bold text-blue-600">120K+</div>
              <div className="text-sm text-gray-600">Active Ninjas</div>
            </div>
          </div> */}

          {/* Example Actions */}
          <ExampleActions onExampleClick={handleExampleClick} />
        </div>
      </div>

      {/* Fixed input at bottom */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-sm border-t border-gray-200 z-50">
        <div className="max-w-2xl mx-auto">
          <div className="relative">
            {/* Show different UI based on state */}
            {isRecording ? (
              <div className="w-full border-2 border-red-400 rounded-2xl bg-gradient-to-r from-red-50 to-orange-50 shadow-lg min-h-[60px] flex items-center justify-center relative z-10">
                <Waveform audioData={audioData} />
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-red-600 font-medium text-sm flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                  Recording {formatDuration(recordingDuration)}
                </div>
              </div>
            ) : recordedBlob ? (
              <div className="w-full border-2 border-blue-400 rounded-2xl bg-gradient-to-r from-blue-50 to-green-50 shadow-lg min-h-[60px] flex items-center relative z-10">
                {/* Play/Pause button on the left */}
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 z-20">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={isPlaying ? pausePlayback : playRecording}
                    className="rounded-full w-10 h-10 p-0 bg-blue-500 hover:bg-blue-600 text-white border-blue-500"
                  >
                    {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </Button>
                </div>

                {/* Current playback time - always shown when recording exists */}
                <div className="absolute left-16 top-1/2 transform -translate-y-1/2 text-xs font-medium text-blue-700">
                  {formatDuration(currentPlaybackTime)} / {formatDuration(recordingDuration)}
                </div>

                {/* Waveform in the middle - always visible */}
                <div className="flex-1 mx-16">
                  <Waveform audioData={isPlaying ? playbackAudioData : Array(20).fill(0.1)} />
                </div>
              </div>
            ) : (
              <textarea
                ref={inputRef}
                value={action}
                onChange={handleTextChange}
                onKeyPress={handleKeyPress}
                placeholder="🌟 What awesome action did you take today?"
                className="w-full p-4 pr-28 border-2 border-gray-200 rounded-2xl resize-none focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-200 transition-all duration-200 shadow-lg placeholder-gray-500 text-gray-700 min-h-[60px] relative z-10 overflow-y-auto"
                rows={1}
              />
            )}

            {/* Action buttons */}
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex gap-2 z-20">
              {recordedBlob ? (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={deleteRecording}
                  className="rounded-full w-10 h-10 p-0 text-red-500 hover:text-red-600 border-red-300 hover:border-red-400 transition-all duration-200"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  type="button"
                  size="sm"
                  variant={isRecording ? "default" : "outline"}
                  onClick={isRecording ? stopRecording : startRecording}
                  disabled={isRecording && recordingDuration < 1}
                  className={`rounded-full w-10 h-10 p-0 transition-all duration-200 ${isRecording
                    ? recordingDuration < 1
                      ? "bg-gray-400 cursor-not-allowed text-white"
                      : "bg-red-500 hover:bg-red-600 text-white"
                    : "hover:bg-green-50 hover:border-green-400"
                    }`}
                >
                  {isRecording ? (
                    <Square className="h-4 w-4" />
                  ) : (
                    <Mic className="h-4 w-4" />
                  )}
                </Button>
              )}

              <Button
                type="button"
                size="sm"
                onClick={handleSubmit}
                disabled={!action.trim() && !recordedBlob}
                className="rounded-full w-10 h-10 p-0 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-200"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Hint text */}
          <p className="text-xs text-gray-500 mt-2 text-center">
            {isRecording
              ? "🔴 Click the stop button when you're done recording"
              : recordedBlob
                ? "🎵 Review your recording and submit when ready"
                : "💡 Type your action or click the mic to record a voice message"
            }
          </p>
        </div>
      </div>
    </div>
  );
}
