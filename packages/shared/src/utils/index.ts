// Utility functions for TapForge

import { formatEther, parseEther } from 'viem';
import type { Address } from '../types';

// Address utilities
export function isValidAddress(address: string): address is Address {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

export function shortenAddress(address: Address, chars = 4): string {
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

export function isSameAddress(a: string, b: string): boolean {
  return a.toLowerCase() === b.toLowerCase();
}

// Number formatting utilities
export function formatTokenAmount(amount: bigint): string {
  const formatted = formatEther(amount);
  const num = parseFloat(formatted);

  if (num === 0) return '0';
  if (num < 0.001) return '<0.001';
  if (num < 1) return num.toFixed(3);
  if (num < 1000) return num.toFixed(2);
  if (num < 1000000) return `${(num / 1000).toFixed(1)}K`;
  if (num < 1000000000) return `${(num / 1000000).toFixed(1)}M`;
  return `${(num / 1000000000).toFixed(1)}B`;
}

export function parseTokenAmount(amount: string): bigint {
  return parseEther(amount);
}

// Time utilities
export function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  }
  return `${secs}s`;
}

export function formatTimestamp(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleString();
}

export function getTimeAgo(timestamp: number): string {
  const now = Date.now() / 1000;
  const diff = now - timestamp;

  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(timestamp * 1000).toLocaleDateString();
}

// Random utilities
export function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function weightedRandom(weights: number[]): number {
  const total = weights.reduce((sum, w) => sum + w, 0);
  let random = Math.random() * total;

  for (let i = 0; i < weights.length; i++) {
    random -= weights[i];
    if (random <= 0) return i;
  }

  return weights.length - 1;
}

// Calculate pity bonus
export function calculatePityBonus(tapsSinceCritical: number, threshold: number, increment: number, max: number): number {
  if (tapsSinceCritical <= threshold) return 0;
  const bonus = (tapsSinceCritical - threshold) * increment;
  return Math.min(bonus, max);
}

// Calculate critical chance
export function calculateCriticalChance(baseChance: number, pityBonus: number): number {
  return Math.min(baseChance + pityBonus, 100);
}

// Calculate total power
export function calculateTotalPower(minerPowers: bigint[], level: number): bigint {
  const totalBasePower = minerPowers.reduce((sum, power) => sum + power, BigInt(0));
  return totalBasePower * BigInt(level + 1);
}

// Calculate upgrade cost
export function calculateUpgradeCost(currentLevel: number, multiplier: bigint): bigint {
  return BigInt(currentLevel + 1) * multiplier;
}

// Validation utilities
export function validateTapCount(taps: number, max: number): boolean {
  return taps > 0 && taps <= max;
}

export function validateTokenId(tokenId: string | bigint): boolean {
  try {
    const id = typeof tokenId === 'string' ? BigInt(tokenId) : tokenId;
    return id >= BigInt(0);
  } catch {
    return false;
  }
}

// Error handling
export function parseContractError(error: any): string {
  if (error?.message) {
    // Check for common revert reasons
    if (error.message.includes('insufficient funds')) {
      return 'Insufficient funds for transaction';
    }
    if (error.message.includes('user rejected')) {
      return 'Transaction rejected by user';
    }
    if (error.message.includes('nonce')) {
      return 'Transaction nonce issue';
    }
    // Extract revert reason if present
    const match = error.message.match(/reason="([^"]+)"/);
    if (match) {
      return match[1];
    }
  }
  return 'Transaction failed';
}

// Batch utilities
export function chunk<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Retry with exponential backoff
export async function retry<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  baseDelay = 1000,
): Promise<T> {
  let lastError: Error | undefined;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      if (i < maxRetries - 1) {
        const delay = baseDelay * Math.pow(2, i);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
}

// Local storage utilities
export const storage = {
  get<T>(key: string, defaultValue?: T): T | undefined {
    if (typeof window === 'undefined') return defaultValue;
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  },

  set<T>(key: string, value: T): void {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Handle storage quota exceeded
    }
  },

  remove(key: string): void {
    if (typeof window === 'undefined') return;
    window.localStorage.removeItem(key);
  },

  clear(): void {
    if (typeof window === 'undefined') return;
    window.localStorage.clear();
  },
};

// Export all utilities
export default {
  isValidAddress,
  shortenAddress,
  isSameAddress,
  formatTokenAmount,
  parseTokenAmount,
  formatTime,
  formatTimestamp,
  getTimeAgo,
  getRandomInt,
  weightedRandom,
  calculatePityBonus,
  calculateCriticalChance,
  calculateTotalPower,
  calculateUpgradeCost,
  validateTapCount,
  validateTokenId,
  parseContractError,
  chunk,
  delay,
  retry,
  storage,
};