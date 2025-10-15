// Type definitions for TapForge

import { z } from 'zod';

// Blockchain types
export type Address = `0x${string}`;
export type Hash = `0x${string}`;

// NFT Rarity Levels
export enum Rarity {
  Common = 'COMMON',
  Rare = 'RARE',
  Epic = 'EPIC',
  Legendary = 'LEGENDARY',
}

// Gem Types
export enum GemType {
  Ruby = 'RUBY',
  Sapphire = 'SAPPHIRE',
  Diamond = 'DIAMOND',
}

// Miner NFT
export interface Miner {
  tokenId: bigint;
  owner: Address;
  rarity: Rarity;
  power: bigint;
  level: number;
  name?: string;
  imageUri?: string;
}

// Player Stats
export interface PlayerStats {
  address: Address;
  totalPower: bigint;
  pendingRewards: bigint;
  totalMined: bigint;
  totalTaps: bigint;
  criticalHits: bigint;
  lastTapBlock: bigint;
  miners: Miner[];
}

// Tap Result
export interface TapResult {
  reward: bigint;
  isCritical: boolean;
  criticalMultiplier?: number;
  gemFound?: GemType;
  gemBonus?: bigint;
}

// Game Parameters
export interface GameParams {
  baseReward: bigint;
  maxTapsPerCall: number;
  maxTapsPerBlock: number;
  upgradeCostMultiplier: bigint;
  pityThreshold: number;
  criticalWeights: number[];
  gemDropRate: number;
}

// Leaderboard Entry
export interface LeaderboardEntry {
  rank: number;
  address: Address;
  totalMined: bigint;
  totalPower: bigint;
  totalTaps: bigint;
  criticalHits: bigint;
}

// Transaction Status
export enum TxStatus {
  Pending = 'PENDING',
  Success = 'SUCCESS',
  Failed = 'FAILED',
}

// GraphQL Types
export const PlayerInputSchema = z.object({
  address: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
});

export const TapInputSchema = z.object({
  taps: z.number().min(1).max(20),
});

export const FaucetInputSchema = z.object({
  address: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  type: z.enum(['MINE', 'NFT']),
  amount: z.number().optional(),
  rarity: z.nativeEnum(Rarity).optional(),
});

// Event Types
export interface TappedEvent {
  user: Address;
  reward: bigint;
  critical: boolean;
  multiplier: number;
  timestamp: bigint;
  blockNumber: bigint;
  transactionHash: Hash;
}

export interface GemFoundEvent {
  user: Address;
  gemType: GemType;
  bonus: bigint;
  timestamp: bigint;
  blockNumber: bigint;
  transactionHash: Hash;
}

export interface UpgradedEvent {
  user: Address;
  tokenId: bigint;
  newLevel: number;
  cost: bigint;
  timestamp: bigint;
  blockNumber: bigint;
  transactionHash: Hash;
}

export interface WithdrawnEvent {
  user: Address;
  amount: bigint;
  timestamp: bigint;
  blockNumber: bigint;
  transactionHash: Hash;
}

// Authentication
export interface AuthToken {
  address: Address;
  chainId: number;
  issuedAt: number;
  expiresAt: number;
}

export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// Simulation Types
export interface SimulationParams {
  address: Address;
  taps: number;
  power: bigint;
  lastCriticalBlock: bigint;
  currentBlock: bigint;
}

export interface SimulationResult {
  expectedReward: bigint;
  criticalProbability: number;
  expectedCriticals: number;
  gemProbability: number;
  gasEstimate: bigint;
}