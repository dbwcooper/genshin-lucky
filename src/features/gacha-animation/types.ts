export type AnimationPhase = 
  | 'idle'
  | 'meteor'      // 流星判定 ~2s
  | 'transition'  // 穿越动画 ~1.5s
  | 'landing'     // 落地动画 ~1s
  | 'revealing'   // 逐张翻牌
  | 'complete';   // 动画完成

export interface AnimationConfig {
  /** 流星阶段时长 (ms) */
  meteorDuration: number;
  /** 穿越阶段时长 (ms) */
  transitionDuration: number;
  /** 落地阶段时长 (ms) */
  landingDuration: number;
  /** 每张卡片翻牌时长 (ms) */
  revealDuration: number;
  /** 卡片翻牌间隔 (ms) */
  revealInterval: number;
}

export const DEFAULT_CONFIG: AnimationConfig = {
  meteorDuration: 2000,
  transitionDuration: 1500,
  landingDuration: 1000,
  revealDuration: 600,
  revealInterval: 300,
};

export const REDUCED_MOTION_CONFIG: AnimationConfig = {
  meteorDuration: 0,
  transitionDuration: 0,
  landingDuration: 0,
  revealDuration: 300,
  revealInterval: 100,
};

export interface CardData {
  id: string;
  name: string;
  dept?: string;
  revealed: boolean;
}
