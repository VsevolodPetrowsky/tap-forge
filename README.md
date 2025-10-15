# TapForge - Web3 Tap-to-Earn Game

> **⚠️ TESTNET ONLY**: This project is for educational purposes and runs on Sepolia testnet only.

TapForge is a Web3 tap-to-earn game where players control dwarven miners to extract valuable resources. Built with a fully on-chain game engine, NFT miners, and ERC20 token rewards.

## Features

- 🎮 **Fully On-Chain Gameplay** - All game mechanics implemented in smart contracts
- ⛏️ **NFT Miners** - Collectible characters with different rarities and power levels
- 💎 **Critical Hits & Gems** - Chance-based rewards with pity system
- 🪙 **MINE Token** - In-game currency for upgrades and rewards
- 📱 **Multi-Platform** - Web app and Telegram Mini App support
- 🔮 **WASM Predictions** - Local probability calculations for better UX
- 📊 **Real-time Updates** - GraphQL subscriptions for live game events

## Tech Stack

- **Smart Contracts**: Solidity, Hardhat, OpenZeppelin
- **Backend**: Node.js, Fastify, GraphQL (Mercurius), DDD Architecture
- **Frontend**: React, Vite, wagmi, RainbowKit, TailwindCSS
- **WASM**: Rust, wasm-bindgen
- **Infrastructure**: pnpm workspaces, TypeScript, Turbo

## Project Structure

```
tap-forge/
├── contracts/        # Smart contracts
├── apps/
│   ├── frontend/    # React web application
│   └── backend/     # GraphQL API server
├── packages/
│   ├── shared/      # Shared types and utilities
│   └── wasm-modules/# Rust WASM modules
└── docs/           # Documentation
```

## Quick Start

### Prerequisites

- Node.js 20+
- pnpm 8+
- Rust (for WASM modules)
- Git

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/tap-forge.git
cd tap-forge
```

2. Install dependencies:
```bash
pnpm install
```

3. Copy environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Deploy contracts to Sepolia:
```bash
pnpm contracts:deploy
```

5. Build WASM modules:
```bash
pnpm wasm:build
```

6. Start development servers:
```bash
pnpm dev
```

## Development

### Available Scripts

```bash
# Development
pnpm dev              # Start all services in dev mode
pnpm backend:dev      # Start backend only
pnpm frontend:dev     # Start frontend only

# Building
pnpm build           # Build all packages
pnpm contracts:compile # Compile smart contracts

# Testing
pnpm test            # Run all tests
pnpm contracts:test  # Test smart contracts

# Linting & Formatting
pnpm lint            # Lint all packages
pnpm format          # Format code with Prettier
```

## Smart Contracts

### Deployed Addresses (Sepolia Testnet)

| Contract | Address | Etherscan |
|----------|---------|-----------|
| MinerToken (MINE) | `0x...` | [View](https://sepolia.etherscan.io/) |
| MinerNFT | `0x...` | [View](https://sepolia.etherscan.io/) |
| MinerGame | `0x...` | [View](https://sepolia.etherscan.io/) |

### Contract Features

- **MinerToken**: ERC20 token for in-game rewards
- **MinerNFT**: ERC721 NFT collection with rarity tiers
- **MinerGame**: Core game logic with tap mining, upgrades, and events

## Game Mechanics

### Tap Mining
- Tap to mine and earn MINE tokens
- Batch taps (10-20) to save gas
- Critical hit multipliers: x2, x5, x10, x50

### Pity System
- Increased critical chance after dry spells
- Guaranteed periodic rewards

### NFT Miners
- Rarities: Common, Rare, Epic, Legendary
- Power calculation: `total_power × (level + 1)`
- Upgrade cost: `(level + 1) × 100 MINE`

### Special Events
- GemFound: Rare gems on critical hits
- Bonus rewards: Ruby, Sapphire, Diamond

## API Documentation

### GraphQL Endpoint
```
http://localhost:4000/graphql
```

### Key Queries
- `leaderboard`: Get top players
- `player(address)`: Get player stats
- `miners(address)`: Get player's NFT miners

### Key Mutations
- `siweRequestNonce`: Start Web3 authentication
- `siweVerify`: Complete authentication
- `faucetMine`: Request test tokens
- `faucetNft`: Request test NFT

### Subscriptions
- `tapped`: Real-time tap events
- `gemFound`: Gem discovery events
- `leaderboardUpdated`: Leaderboard changes

## Security

- ✅ Rate limiting on all endpoints
- ✅ CORS protection
- ✅ JWT authentication
- ✅ Contract reentrancy guards
- ✅ Input validation
- ✅ Secure key management

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - see [LICENSE](LICENSE) file for details

## Disclaimer

This is a testnet-only educational project. Do not use in production or with real funds.

## Support

- [Documentation](./docs)
- [Discord](#)
- [Twitter](#)

---

Built with ❤️ by the TapForge team