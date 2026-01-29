import { createContext, useContext, useRef, useCallback, type ReactNode } from 'react';
import { getAudio, ASSETS } from '@/lib/preload';

interface AudioContextValue {
  playBGM: () => void;
  stopBGM: () => void;
  playReveal: () => void;
  playResult: () => void;
  stopAll: () => void;
}

const AudioContext = createContext<AudioContextValue | null>(null);

export function AudioProvider({ children }: { children: ReactNode }) {
  const bgmRef = useRef<HTMLAudioElement | null>(null);
  const isPlayingRef = useRef(false);

  const playBGM = useCallback(() => {
    if (isPlayingRef.current) return;

    const audio = getAudio(ASSETS.audio.bgm);
    if (audio) {
      bgmRef.current = audio;
      audio.loop = true;
      audio.volume = 0.5;
      audio.currentTime = 0;
      audio.play().catch(() => {
        // 用户未交互时可能无法播放
        console.warn('BGM autoplay blocked');
      });
      isPlayingRef.current = true;
    }
  }, []);

  const stopBGM = useCallback(() => {
    if (bgmRef.current) {
      bgmRef.current.pause();
      bgmRef.current.currentTime = 0;
      isPlayingRef.current = false;
    }
  }, []);

  const playReveal = useCallback(() => {
    const audio = getAudio(ASSETS.audio.reveal);
    if (audio) {
      // 克隆节点以支持重叠播放
      const clone = audio.cloneNode() as HTMLAudioElement;
      clone.volume = 0.7;
      clone.play().catch(() => {});
    }
  }, []);

  const playResult = useCallback(() => {
    const audio = getAudio(ASSETS.audio.result);
    if (audio) {
      audio.currentTime = 0;
      audio.volume = 0.8;
      audio.play().catch(() => {});
    }
  }, []);

  const stopAll = useCallback(() => {
    stopBGM();
  }, [stopBGM]);

  return (
    <AudioContext.Provider
      value={{
        playBGM,
        stopBGM,
        playReveal,
        playResult,
        stopAll,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
}

export function useAudio() {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudio must be used within AudioProvider');
  }
  return context;
}
