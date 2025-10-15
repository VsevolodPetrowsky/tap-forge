// Constants for TapForge

import type { Address } from '../types';

// Network Configuration
export const SUPPORTED_CHAINS = {
  SEPOLIA: {
    id: 11155111,
    name: 'Sepolia',
    nativeCurrency: {
      name: 'Sepolia Ether',
      symbol: 'ETH',
      decimals: 18,
    },
    rpcUrls: {
      default: {
        http: ['https://sepolia.infura.io/v3'],
      },
      public: {
        http: ['https://rpc.sepolia.org'],
      },
    },
    blockExplorers: {
      default: {
        name: 'Etherscan',
        url: 'https://sepolia.etherscan.io',
      },
    },
    testnet: true,
  },
  LOCALHOST: {
    id: 31337,
    name: 'Localhost',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
    rpcUrls: {
      default: {
        http: ['http://127.0.0.1:8545'],
      },
    },
    testnet: true,
  },
} as const;

// Token Configuration
export const TOKEN_CONFIG = {
  name: 'Miner Token',
  symbol: 'MINE',
  decimals: 18,
  initialSupply: BigInt(1000000) * BigInt(10 ** 18), // 1M MINE
} as const;

// NFT Configuration
export const NFT_CONFIG = {
  name: 'TapForge Miners',
  symbol: 'TFMINER',
  maxSupply: 10000,
  baseUri: 'https://api.tapforge.game/nft/',
} as const;

// Game Configuration
export const GAME_CONFIG = {
  BASE_REWARD: BigInt(10) * BigInt(10 ** 18), // 10 MINE per tap
  MAX_TAPS_PER_CALL: 20,
  MAX_TAPS_PER_BLOCK: 100,
  UPGRADE_COST_MULTIPLIER: BigInt(100) * BigInt(10 ** 18), // 100 MINE per level
  PITY_THRESHOLD: 50, // Taps without critical before pity kicks in
  PITY_INCREMENT: 2, // Percentage increase per tap after threshold
  MAX_PITY_BONUS: 50, // Maximum pity bonus percentage
} as const;

// Critical Hit Configuration
export const CRITICAL_CONFIG = {
  BASE_CHANCE: 10, // 10% base chance
  MULTIPLIERS: [2, 5, 10, 50] as const,
  WEIGHTS: [60, 25, 10, 5] as const, // Weights for each multiplier
} as const;

// Gem Configuration
export const GEM_CONFIG = {
  DROP_CHANCE: 5, // 5% chance on critical
  RUBY: {
    chance: 70,
    bonus: BigInt(100) * BigInt(10 ** 18), // 100 MINE
  },
  SAPPHIRE: {
    chance: 25,
    bonus: BigInt(500) * BigInt(10 ** 18), // 500 MINE
  },
  DIAMOND: {
    chance: 5,
    bonus: BigInt(2000) * BigInt(10 ** 18), // 2000 MINE
  },
} as const;

// Rarity Configuration
export const RARITY_CONFIG = {
  COMMON: {
    power: BigInt(1),
    dropRate: 60,
    color: '#808080',
  },
  RARE: {
    power: BigInt(3),
    dropRate: 25,
    color: '#0080FF',
  },
  EPIC: {
    power: BigInt(7),
    dropRate: 10,
    color: '#800080',
  },
  LEGENDARY: {
    power: BigInt(15),
    dropRate: 5,
    color: '#FFD700',
  },
} as const;

// Faucet Configuration
export const FAUCET_CONFIG = {
  MINE_AMOUNT: BigInt(1000) * BigInt(10 ** 18), // 1000 MINE
  NFT_AMOUNT: 1,
  COOLDOWN: 24 * 60 * 60, // 24 hours in seconds
  RATE_LIMIT: 3, // Max requests per IP per day
} as const;

// API Configuration
export const API_CONFIG = {
  GRAPHQL_PATH: '/graphql',
  REST_PATH: '/api',
  WS_PATH: '/ws',
  MAX_QUERY_DEPTH: 5,
  RATE_LIMIT: {
    WINDOW_MS: 60 * 1000, // 1 minute
    MAX_REQUESTS: 100,
  },
  CORS_ORIGINS: [
    'http://localhost:3000',
    'http://localhost:5173',
    'https://tapforge.game',
  ],
} as const;

// Cache Configuration
export const CACHE_CONFIG = {
  LEADERBOARD_TTL: 60, // 1 minute
  PLAYER_STATS_TTL: 30, // 30 seconds
  GAME_PARAMS_TTL: 300, // 5 minutes
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  // Contract Errors
  INSUFFICIENT_BALANCE: 'Insufficient balance',
  INSUFFICIENT_ALLOWANCE: 'Insufficient allowance',
  INVALID_TAP_COUNT: 'Invalid tap count',
  TOO_MANY_TAPS: 'Too many taps in this block',
  NOT_MINER_OWNER: 'Not the owner of this miner',
  MINER_NOT_REGISTERED: 'Miner not registered',
  UPGRADE_FAILED: 'Upgrade failed',

  // API Errors
  UNAUTHORIZED: 'Unauthorized',
  INVALID_SIGNATURE: 'Invalid signature',
  NONCE_EXPIRED: 'Nonce expired',
  RATE_LIMITED: 'Rate limit exceeded',
  FAUCET_COOLDOWN: 'Faucet on cooldown',

  // Validation Errors
  INVALID_ADDRESS: 'Invalid Ethereum address',
  INVALID_TOKEN_ID: 'Invalid token ID',
  INVALID_AMOUNT: 'Invalid amount',

  // Network Errors
  NETWORK_ERROR: 'Network error',
  RPC_ERROR: 'RPC error',
  TRANSACTION_FAILED: 'Transaction failed',
} as const;

// Contract Addresses (to be filled after deployment)
export const CONTRACT_ADDRESSES: Record<number, {
  MinerToken: Address;
  MinerNFT: Address;
  MinerGame: Address;
}> = {
  // Will be populated from environment variables
} as const;

// Time Constants
export const TIME = {
  SECOND: 1,
  MINUTE: 60,
  HOUR: 60 * 60,
  DAY: 24 * 60 * 60,
  WEEK: 7 * 24 * 60 * 60,
} as const;

// UI Constants
export const UI_CONFIG = {
  ANIMATION_DURATION: 300,
  TAP_BATCH_DELAY: 500,
  NOTIFICATION_DURATION: 3000,
  POLLING_INTERVAL: 5000,
  WS_RECONNECT_DELAY: 2000,
  MAX_RECONNECT_ATTEMPTS: 5,
} as const;