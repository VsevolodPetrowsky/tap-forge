export const schema = `
  type Player {
    address: String!
    totalTaps: Int!
    totalRewards: String!
    tapsSinceCritical: Int!
    lastTapBlock: String!
    registeredMiners: [String!]!
    minerCount: Int!
    totalPower: String!
  }

  type Miner {
    tokenId: String!
    owner: String!
    rarity: String!
    basePower: String!
    level: Int!
    currentPower: String!
    upgradeCost: String!
    name: String
  }

  type Balance {
    address: String!
    ethBalance: String!
    tokenBalance: String!
    nftBalance: Int!
  }

  type LeaderboardEntry {
    rank: Int!
    address: String!
    totalTaps: Int!
    totalRewards: String!
    totalPower: String!
  }

  type ContractAddresses {
    minerToken: String!
    minerNFT: String!
    minerGame: String!
  }

  type HealthStatus {
    status: String!
    timestamp: String!
    blockNumber: String!
  }

  type Query {
    # Player queries
    player(address: String!): Player
    leaderboard(limit: Int, offset: Int): [LeaderboardEntry!]!

    # Miner queries
    miner(tokenId: String!): Miner
    playerMiners(address: String!): [Miner!]!

    # Balance queries
    balance(address: String!): Balance

    # Contract info
    contractAddresses: ContractAddresses!

    # Health check
    health: HealthStatus!
  }
`;
