# TapForge - Project Development Plan

## Project Description

**TapForge** is a Web3 tap-to-earn game about dwarves, where players mine ore through tap mechanics. The game operates fully on-chain using smart contracts on Ethereum (Sepolia testnet).

### Core Features:
- **Fully on-chain gameplay** - all game mechanics implemented in smart contracts
- **NFT miners** - collectible characters with different rarities (ERC721)
- **MINE token** - in-game currency (ERC20)
- **WASM prediction** - local probability calculations without blockchain calls
- **Web + Telegram Mini App** - accessibility across platforms
- **GraphQL API** - efficient frontend-backend communication

## Project Architecture

### Monorepo Structure (pnpm workspaces)
```
tap-forge/
├── contracts/        # Smart contracts (Hardhat + Solidity)
├── backend/          # GraphQL API (Fastify + DDD)
├── frontend/         # React application (modular architecture)
├── wasm/            # Rust WASM modules
├── shared/          # Shared types and utilities
└── docs/            # Project documentation
```

### Technology Stack

#### Contracts
- Solidity ^0.8.24
- Hardhat + Ethers v6
- OpenZeppelin Contracts
- Slither for security analysis

#### Backend (DDD Architecture)
- Node.js + TypeScript
- Fastify + Mercurius (GraphQL)
- Domain-Driven Design with modules:
  - Domain Layer (entities, value objects, aggregates)
  - Application Layer (use cases, DTOs)
  - Infrastructure Layer (repositories, external services)
  - Presentation Layer (GraphQL resolvers)
- SQLite for demo data
- JWT authentication
- Rate limiting and security headers

#### Frontend (Modular Architecture)
- React 18 + TypeScript + Vite
- Feature-Sliced Design architecture:
  - app/ - application initialization
  - pages/ - application pages
  - widgets/ - composite blocks
  - features/ - functionality
  - entities/ - business entities
  - shared/ - reusable code
- wagmi + viem + RainbowKit for Web3
- TailwindCSS for styling
- React Query for state management

#### WASM
- Rust + wasm-bindgen
- Modules for cryptography and prediction

## Implementation Plan

### Phase 1: Basic Infrastructure ✅ COMPLETED
- [x] Setup monorepo with pnpm workspaces
- [x] Basic folder structure for all modules
- [x] Configure TypeScript, ESLint, Prettier
- [x] Create shared library for common types
- [x] Update all dependencies to latest versions (React 19, Vite 6, etc.)

### Phase 2: Smart Contracts ✅ COMPLETED
- [x] MinerToken (ERC20) - in-game currency
- [x] MinerNFT (ERC721) - NFT miners with rarities
- [x] MinerGame - main game logic:
  - [x] Tap system with batching
  - [x] Pity system for criticals
  - [x] Rewards and jackpot system
  - [x] Miner upgrades
  - [x] GemFound events
- [x] Contract tests (60 tests passing)
- [x] Deploy scripts
- [x] Deployed to Sepolia testnet
- [x] Verified on Etherscan

### Phase 3: WASM Modules ✅ COMPLETED
- [x] Reward prediction module
- [x] Cryptographic functions (Keccak256 hashing)
- [x] JavaScript integration via wasm-bindgen
- [x] TypeScript type definitions

### Phase 4: Backend (DDD)
#### Domain Layer
- [ ] Entities: Player, Miner, GameSession
- [ ] Value Objects: Address, TokenId, Reward
- [ ] Aggregates: PlayerAggregate
- [ ] Domain Events: TappedEvent, GemFoundEvent

#### Application Layer
- [ ] Use Cases: Tap, Withdraw, Upgrade, GetLeaderboard
- [ ] GraphQL DTOs
- [ ] Validation services

#### Infrastructure Layer
- [ ] Blockchain integration (viem)
- [ ] SQLite repositories
- [ ] JWT service
- [ ] Telegram Bot API integration

#### Presentation Layer
- [ ] GraphQL schema
- [ ] Query resolvers (leaderboard, player, miners)
- [ ] Mutation resolvers (auth, faucet)
- [ ] Subscription resolvers (events)
- [ ] WebSocket support

### Phase 5: Frontend (Modular Architecture)
#### Shared Layer
- [ ] UI components (Button, Card, Modal)
- [ ] Web3 hooks and utilities
- [ ] API client (GraphQL)

#### Entities Layer
- [ ] Miner entity and components
- [ ] Player entity and components
- [ ] Reward entity

#### Features Layer
- [ ] Tap mechanics (batching, animations)
- [ ] Wallet connection (RainbowKit)
- [ ] Miner upgrades
- [ ] Token withdrawal
- [ ] Testnet faucet

#### Widgets Layer
- [ ] Game board widget
- [ ] Leaderboard widget
- [ ] Miners collection widget
- [ ] Stats panel widget

#### Pages Layer
- [ ] Game page
- [ ] Profile page
- [ ] Leaderboard page

### Phase 6: Telegram Mini App
- [ ] UI adaptation for Telegram
- [ ] Telegram Web App SDK integration
- [ ] Authentication via initData
- [ ] Bot configuration

### Phase 7: Security & Optimization
- [ ] Rate limiting on all endpoints
- [ ] CORS configuration
- [ ] Replay attack protection in contracts
- [ ] Gas optimization
- [ ] Contract security audit

### Phase 8: DevOps & CI/CD
- [ ] GitHub Actions for tests
- [ ] Automated contract deployment
- [ ] Docker containerization
- [ ] Monitoring and logging

## Game Mechanics

### Core Gameplay
1. **Tap Mining**: Player taps button to mine
2. **Batching**: Taps grouped by 10-20 to save gas
3. **Rewards**: Base reward + critical chance (x2, x5, x10, x50)
4. **Pity System**: Increased critical chance after long dry spell
5. **Gem Events**: Rare gems on critical hits

### Progression
1. **NFT Miners**: Collection with different rarity and power
2. **Upgrades**: Level up miners with MINE tokens
3. **Power**: Total power = sum of all miners' power × (level+1)

### Economy
1. **MINE Token**: Main currency, mined through taps
2. **Upgrade cost**: (level+1) × 100 MINE
3. **Faucet**: Test tokens for new players

## Security

### Smart Contracts
- Limit taps per transaction (≤20)
- Limit taps per block per address
- Audit events for all actions
- Reentrancy guards

### Backend
- JWT tokens with short lifetime (15-30 min)
- Rate limiting on all endpoints
- SIWE for Web3 authentication
- Telegram initData validation

### Frontend
- Content Security Policy
- XSS protection
- Secure key storage (.env only)

## Success Metrics
- [ ] Response time < 200ms
- [ ] Gas per tap operation < 50k
- [ ] Support 1000+ concurrent players
- [ ] 99.9% uptime
- [ ] Full test coverage for critical functions

## Development Commands

```bash
# Install dependencies
pnpm install

# Run entire project
pnpm dev

# Deploy contracts
pnpm contracts:deploy

# Run tests
pnpm test

# Linting
pnpm lint

# Production build
pnpm build
```

## Important Notes
- Project runs on testnet only (Sepolia)
- All secrets stored in .env files (not committed)
- Use official contract addresses from README
- Faucet for testing only, disabled in production

## Next Steps
1. Setup basic monorepo structure
2. Create .env examples
3. Start with smart contract implementation
4. Develop backend and frontend in parallel
5. Integrate all components
6. Testing and optimization