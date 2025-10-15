export interface PlayerDTO {
  address: string;
  totalTaps: number;
  totalRewards: string;
  tapsSinceCritical: number;
  lastTapBlock: string;
  registeredMiners: string[];
  minerCount: number;
  totalPower: string;
}

export interface LeaderboardEntryDTO {
  rank: number;
  address: string;
  totalTaps: number;
  totalRewards: string;
  totalPower: string;
}

export interface PlayerStatsDTO {
  address: string;
  totalTaps: number;
  totalRewards: string;
  criticalHitRate: number;
  averageRewardPerTap: string;
  rank?: number;
}
