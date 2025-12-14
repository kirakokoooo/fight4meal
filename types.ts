export type PageState = 'setup' | 'intro' | 'game' | 'result' | 'final';

export type WeaponType = 'slingshot' | 'dart' | 'sniper';

export interface Weapon {
  id: WeaponType;
  name: string;
  accuracy: number; // 0 to 1
  description: string;
}

export interface GameResult {
  totalHits: number;
  grossEarnings: number; // Positive earnings
  blackBalloonsHit: number;
  penaltyAmount: number; // Absolute value of penalty
  finalScore: number;
}

export type BalloonType = 'normal' | 'angel' | 'devil';

export interface Balloon {
  id: number;
  x: number; // Percentage 0-100
  speed: number; // Percentage of height per frame
  color: string;
  isBlack: boolean;
  type: BalloonType;
  value: number;
  size: number; // pixel diameter
  popped: boolean;
  y: number; // Current vertical position in percentage (0-100)
}

export const BALLOON_COLORS = ['#EF4444', '#FFFFFF', '#F97316', '#000000']; // Red, White, Orange, Black
export const PRICE_TIERS = [5, 10, 15, 20, 50];

// Updated logic: Accuracy is now 100% for all (gameplay logic handles specific effects)
// Descriptions updated to match new rules
export const WEAPONS: Weapon[] = [
  { id: 'slingshot', name: '弹弓', accuracy: 1.0, description: '游戏时长 +10秒' },
  { id: 'dart', name: '飞镖', accuracy: 1.0, description: '粉色气球额外 +5元' },
  { id: 'sniper', name: '狙击枪', accuracy: 1.0, description: '时长 -10秒，一石二鸟' },
];