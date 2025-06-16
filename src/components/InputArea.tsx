"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Mic, Square, Play, Pause, Send, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

// TypeScript declarations for Audio APIs
declare global {
    interface Window {
        webkitAudioContext: typeof AudioContext;
    }
}

interface InputAreaProps {
    placeholder: string;
    value: string;
    onChange: (value: string) => void;
    onSubmit: (type: 'text' | 'audio', content: string | Blob) => void;
    disabled?: boolean;
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

export default function InputArea({
    placeholder,
    value,
    onChange,
    onSubmit,
    disabled = false
}: InputAreaProps) {
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

                const totalEnergy = dataArray.reduce((sum, value) => sum + value * value, 0);
                const rmsLevel = Math.sqrt(totalEnergy / bufferLength);

                if (rmsLevel < 15) {
                    setAudioData(Array(20).fill(0.1));
                    animationRef.current = requestAnimationFrame(updateWaveform);
                    return;
                }

                const sampleRate = audioContextRef.current?.sampleRate || 44100;
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

                    if (i < 5) {
                        if (normalized < 0.15) {
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

            durationIntervalRef.current = setInterval(() => {
                setRecordingDuration(Math.floor((Date.now() - recordingStartTimeRef.current) / 1000));
            }, 1000);

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

                const totalEnergy = dataArray.reduce((sum, value) => sum + value * value, 0);
                const rmsLevel = Math.sqrt(totalEnergy / bufferLength);

                if (rmsLevel < 5) {
                    setPlaybackAudioData(Array(20).fill(0.1));
                    playbackAnimationRef.current = requestAnimationFrame(updatePlaybackWaveform);
                    return;
                }

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
            if (!audioElementRef.current) {
                const audioUrl = URL.createObjectURL(recordedBlob);
                const audio = new Audio(audioUrl);
                audioElementRef.current = audio;

                audio.onplay = () => {
                    setIsPlaying(true);

                    if (!playbackAudioContextRef.current) {
                        startPlaybackAnalysis(audio);
                    }

                    playbackTimeIntervalRef.current = setInterval(() => {
                        if (audioElementRef.current) {
                            setCurrentPlaybackTime(Math.floor(audioElementRef.current.currentTime));
                        }
                    }, 100);
                };

                audio.onpause = () => {
                    setIsPlaying(false);

                    if (playbackTimeIntervalRef.current) {
                        clearInterval(playbackTimeIntervalRef.current);
                        playbackTimeIntervalRef.current = null;
                    }
                };

                audio.onended = () => {
                    setIsPlaying(false);
                    stopPlaybackAnalysis();
                    setCurrentPlaybackTime(0);

                    if (playbackTimeIntervalRef.current) {
                        clearInterval(playbackTimeIntervalRef.current);
                        playbackTimeIntervalRef.current = null;
                    }

                    audioElementRef.current = null;
                    URL.revokeObjectURL(audioUrl);
                };
            } else {
                if (!playbackTimeIntervalRef.current) {
                    playbackTimeIntervalRef.current = setInterval(() => {
                        if (audioElementRef.current) {
                            setCurrentPlaybackTime(Math.floor(audioElementRef.current.currentTime));
                        }
                    }, 100);
                }
            }

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

    const handleTextareaResize = () => {
        if (inputRef.current) {
            inputRef.current.style.height = 'auto';
            const scrollHeight = inputRef.current.scrollHeight;
            const minHeight = 60;
            const maxHeight = 120;
            const newHeight = Math.min(Math.max(scrollHeight, minHeight), maxHeight);
            inputRef.current.style.height = `${newHeight}px`;
        }
    };

    const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        onChange(e.target.value);
        handleTextareaResize();
    };

    const handleSubmit = () => {
        if (recordedBlob) {
            onSubmit('audio', recordedBlob);
            deleteRecording();
        } else if (value.trim()) {
            onSubmit('text', value.trim());
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && e.shiftKey) {
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
        <div className="w-full">
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
                                className="rounded-full w-10 h-10 p-0 bg-blue-500 hover:bg-blue-600 text-white hover:text-white border-blue-500 cursor-pointer"
                            >
                                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                            </Button>
                        </div>

                        {/* Current playback time */}
                        <div className="absolute left-16 top-1/2 transform -translate-y-1/2 text-xs font-medium text-blue-700">
                            {formatDuration(currentPlaybackTime)} / {formatDuration(recordingDuration)}
                        </div>

                        {/* Waveform in the middle */}
                        <div className="flex-1 mx-16">
                            <Waveform audioData={isPlaying ? playbackAudioData : Array(20).fill(0.1)} />
                        </div>
                    </div>
                ) : (
                    <textarea
                        ref={inputRef}
                        value={value}
                        onChange={handleTextChange}
                        onKeyPress={handleKeyPress}
                        placeholder={placeholder}
                        disabled={disabled}
                        className={`w-full p-4 pr-28 border-2 border-gray-200 rounded-2xl resize-none focus:outline-none transition-all duration-200 shadow-lg placeholder-gray-500 text-gray-700 min-h-[60px] relative z-10 overflow-y-auto bg-white/80 backdrop-blur-sm`}
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
                            disabled={disabled}
                            className="rounded-full w-10 h-10 p-0 text-red-500 hover:text-red-600 border-red-300 hover:border-red-400 transition-all duration-200 cursor-pointer"
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    ) : (
                        <Button
                            style={{ display: 'none' }}
                            type="button"
                            size="sm"
                            variant={isRecording ? "default" : "outline"}
                            onClick={isRecording ? stopRecording : startRecording}
                            disabled={disabled || (isRecording && recordingDuration < 1)}
                            className={`rounded-full w-10 h-10 p-0 transition-all duration-200 cursor-pointer ${isRecording
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
                        disabled={disabled || (!value.trim() && !recordedBlob)}
                        className="rounded-full w-10 h-10 p-0 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer flex items-center justify-center"
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
                        : "💡 Type your message or click the mic to record a voice message"
                }
            </p>
        </div>
    );
} 