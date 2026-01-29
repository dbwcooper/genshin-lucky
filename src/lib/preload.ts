/**
 * 资源预加载工具
 * 视频和音频在应用启动时并行预加载
 */

const videoCache = new Map<string, HTMLVideoElement>();
const audioCache = new Map<string, HTMLAudioElement>();

export function preloadVideo(src: string): Promise<HTMLVideoElement> {
  if (videoCache.has(src)) {
    return Promise.resolve(videoCache.get(src)!);
  }

  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.preload = 'auto';
    video.muted = true; // 避免自动播放限制
    video.playsInline = true;
    video.src = src;

    video.oncanplaythrough = () => {
      videoCache.set(src, video);
      resolve(video);
    };

    video.onerror = () => {
      reject(new Error(`Failed to load video: ${src}`));
    };
  });
}

export function preloadAudio(src: string): Promise<HTMLAudioElement> {
  if (audioCache.has(src)) {
    return Promise.resolve(audioCache.get(src)!);
  }

  return new Promise((resolve, reject) => {
    const audio = new Audio();
    audio.preload = 'auto';
    audio.src = src;

    audio.oncanplaythrough = () => {
      audioCache.set(src, audio);
      resolve(audio);
    };

    audio.onerror = () => {
      reject(new Error(`Failed to load audio: ${src}`));
    };
  });
}

export function getVideo(src: string): HTMLVideoElement | undefined {
  return videoCache.get(src);
}

export function getAudio(src: string): HTMLAudioElement | undefined {
  return audioCache.get(src);
}

// 资源路径常量
export const ASSETS = {
  videos: {
    meteor: '/assets/videos/meteor-gold.webm',
    transition: '/assets/videos/transition.webm',
    landing: '/assets/videos/landing.webm',
  },
  audio: {
    bgm: '/assets/audio/bgm.mp3',
    reveal: '/assets/audio/reveal.mp3',
    result: '/assets/audio/result.mp3',
  },
  textures: {
    cardBack: '/assets/textures/card-back.webp',
    cardGold: '/assets/textures/card-gold.webp',
  },
} as const;

/**
 * 预加载抽卡动画所需的所有资源
 * 在抽奖开始前调用
 */
export async function preloadGachaAssets(): Promise<void> {
  const promises: Promise<unknown>[] = [];

  // 预加载视频（可能不存在，忽略错误）
  Object.values(ASSETS.videos).forEach((src) => {
    promises.push(preloadVideo(src).catch(() => console.warn(`Video not found: ${src}`)));
  });

  // 预加载音频（可能不存在，忽略错误）
  Object.values(ASSETS.audio).forEach((src) => {
    promises.push(preloadAudio(src).catch(() => console.warn(`Audio not found: ${src}`)));
  });

  await Promise.all(promises);
}

/**
 * 预加载图片
 */
export function preloadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = src;
    img.onload = () => resolve(img);
    img.onerror = reject;
  });
}
