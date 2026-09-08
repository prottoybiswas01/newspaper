import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Sparkles } from 'lucide-react';

const AudioPlayer = ({ 
  text = '', 
  title = '', 
  audioUrl = '',
  language = 'bn' 
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const utteranceRef = useRef(null);
  const audioElemRef = useRef(null);

  useEffect(() => {
    if (!('speechSynthesis' in window) && !audioUrl) {
      setIsSupported(false);
    }
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [audioUrl]);

  if (!isSupported && !audioUrl) return null;

  const plainTextToRead = (title ? title + '। ' : '') + text.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

  const togglePlay = () => {
    // If native audio file exists
    if (audioUrl && audioElemRef.current) {
      if (isPlaying) {
        audioElemRef.current.pause();
        setIsPlaying(false);
      } else {
        audioElemRef.current.play();
        setIsPlaying(true);
      }
      return;
    }

    // Web Speech API synthesis
    if (!('speechSynthesis' in window)) return;

    if (isPlaying) {
      window.speechSynthesis.pause();
      setIsPlaying(false);
    } else {
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
        setIsPlaying(true);
      } else {
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(plainTextToRead.substring(0, 1500));
        utterance.lang = language === 'bn' ? 'bn-BD' : 'en-US';
        utterance.rate = speed;

        utterance.onend = () => {
          setIsPlaying(false);
        };
        utterance.onerror = () => {
          setIsPlaying(false);
        };

        utteranceRef.current = utterance;
        window.speechSynthesis.speak(utterance);
        setIsPlaying(true);
      }
    }
  };

  const handleReset = () => {
    if (audioUrl && audioElemRef.current) {
      audioElemRef.current.currentTime = 0;
      audioElemRef.current.pause();
      setIsPlaying(false);
    } else if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
    }
  };

  const handleSpeedChange = () => {
    const nextSpeed = speed === 1 ? 1.25 : (speed === 1.25 ? 1.5 : 1);
    setSpeed(nextSpeed);
    if (audioUrl && audioElemRef.current) {
      audioElemRef.current.playbackRate = nextSpeed;
    } else if (isPlaying && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(plainTextToRead.substring(0, 1500));
      utterance.lang = language === 'bn' ? 'bn-BD' : 'en-US';
      utterance.rate = nextSpeed;
      utterance.onend = () => setIsPlaying(false);
      utteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="my-5 p-3.5 rounded-2xl bg-gradient-to-r from-red-50 via-white to-gray-50 dark:from-[#181216] dark:via-[#121212] dark:to-[#161616] border border-red-200/70 dark:border-red-950/40 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 no-print">
      {audioUrl && (
        <audio 
          ref={audioElemRef} 
          src={audioUrl} 
          onEnded={() => setIsPlaying(false)}
          className="hidden" 
        />
      )}

      {/* Title info */}
      <div className="flex items-center space-x-3 w-full sm:w-auto">
        <div className={`p-2 rounded-xl flex items-center justify-center transition-all ${
          isPlaying 
            ? 'bg-red-600 text-white animate-pulse' 
            : 'bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400'
        }`}>
          <Volume2 className="h-5 w-5" />
        </div>
        <div>
          <span className="text-xs font-black text-gray-950 dark:text-white flex items-center gap-1">
            <span>সংবাদ শুনুন</span>
            <span className="text-[9px] font-bold text-red-600 dark:text-red-400 uppercase bg-red-100/60 dark:bg-red-950/40 px-1.5 py-0.2 rounded">
              {audioUrl ? 'অডিও রেকর্ড' : 'এআই ভয়েস'}
            </span>
          </span>
          <p className="text-[10px] text-gray-500 dark:text-neutral-400">
            {isPlaying ? 'অডিও পাঠ চলছে...' : 'সংবাদটি অডিও আকারে শুনতে প্লে করুন'}
          </p>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
        {/* Speed toggle */}
        <button
          onClick={handleSpeedChange}
          className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 text-gray-700 dark:text-neutral-300 text-xs font-bold hover:bg-gray-50"
          title="Playback Speed"
        >
          {speed}x
        </button>

        {/* Reset */}
        <button
          onClick={handleReset}
          className="p-2 rounded-lg bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 text-gray-500 hover:text-gray-900 dark:hover:text-white"
          title="Reset"
        >
          <RotateCcw className="h-4 w-4" />
        </button>

        {/* Play / Pause button */}
        <button
          onClick={togglePlay}
          className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-black text-white transition-all shadow-xs ${
            isPlaying ? 'bg-neutral-900 hover:bg-neutral-800' : 'bg-red-600 hover:bg-red-700'
          }`}
        >
          {isPlaying ? (
            <>
              <Pause className="h-4 w-4" />
              <span>থামান</span>
            </>
          ) : (
            <>
              <Play className="h-4 w-4 fill-current" />
              <span>শুনুন</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default AudioPlayer;
