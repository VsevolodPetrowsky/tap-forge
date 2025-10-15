# TapForge Development Guide

## Project Structure

This is a monorepo project using pnpm workspaces. The structure is organized as follows:

```
tap-forge/
├── contracts/          # Smart contracts (Solidity + Hardhat)
├── apps/
│   ├── backend/       # GraphQL API with DDD architecture
│   └── frontend/      # React web application
├── packages/
│   ├── shared/        # Shared types and utilities
│   └── wasm-modules/  # Rust WASM modules
└── docs/             # Documentation
```

## Getting Started

### Prerequisites

- **Node.js** 20+ (required)
- **pnpm** 8+ (required)
- **Rust** (for WASM modules)
- **Python** 3.x with distutils (for node-gyp)

### Initial Setup

1. **Clone and install dependencies:**
```bash
git clone <repository-url>
cd tap-forge
pnpm install
```

2. **Setup environment variables:**
```bash
# Copy example env files
cp .env.example .env
cp contracts/.env.example contracts/.env
cp apps/backend/.env.example apps/backend/.env
cp apps/frontend/.env.example apps/frontend/.env

# Edit each .env file with your configuration
```

3. **Build shared packages:**
```bash
pnpm --filter @tap-forge/shared build
```

## Development Workflow

### Working with Smart Contracts

```bash
# Compile contracts
pnpm contracts:compile

# Run tests
pnpm contracts:test

# Deploy to local network
pnpm contracts:deploy

# Deploy to Sepolia testnet
pnpm contracts:deploy:sepolia
```

### Backend Development

The backend uses Domain-Driven Design (DDD) architecture:

```
backend/
├── src/
│   ├── domain/        # Business logic
│   ├── application/   # Use cases and DTOs
│   ├── infrastructure/# External services
│   └── presentation/  # GraphQL resolvers
```

```bash
# Start backend in development mode
pnpm backend:dev

# Run tests
pnpm --filter backend test

# Build for production
pnpm backend:build
```

### Frontend Development

The frontend uses Feature-Sliced Design architecture:

```
frontend/
├── src/
│   ├── app/          # Application initialization
│   ├── pages/        # Application pages
│   ├── widgets/      # Composite UI blocks
│   ├── features/     # User features
│   ├── entities/     # Business entities
│   └── shared/       # Shared code
```

```bash
# Start frontend development server
pnpm frontend:dev

# Run tests
pnpm --filter frontend test

# Build for production
pnpm frontend:build
```

### WASM Development

```bash
# Build WASM modules
pnpm wasm:build

# The built modules will be copied to frontend/public/wasm/
```

## Common Commands

### Development
```bash
# Start all services in development mode
pnpm dev

# Start specific service
pnpm backend:dev
pnpm frontend:dev

# Watch mode for shared packages
pnpm --filter @tap-forge/shared dev
```

### Testing
```bash
# Run all tests
pnpm test

# Run tests for specific package
pnpm --filter backend test
pnpm --filter frontend test
pnpm contracts:test

# Run tests in watch mode
pnpm --filter backend test:watch
```

### Building
```bash
# Build all packages
pnpm build

# Build specific package
pnpm --filter backend build
pnpm --filter frontend build
```

### Linting and Formatting
```bash
# Lint all packages
pnpm lint

# Format all packages
pnpm format

# Type check
pnpm typecheck
```

### Clean
```bash
# Clean all build artifacts
pnpm clean

# Clean and reinstall dependencies
pnpm clean && rm -rf node_modules && pnpm install
```

## Architecture Guidelines

### Smart Contracts
- Use OpenZeppelin contracts for standard implementations
- Implement comprehensive tests with coverage
- Gas optimization is important
- Use events for all state changes
- Follow checks-effects-interactions pattern

### Backend (DDD)
- **Domain Layer**: Pure business logic, no dependencies
- **Application Layer**: Use cases, orchestration
- **Infrastructure Layer**: External services, databases
- **Presentation Layer**: API endpoints, GraphQL resolvers

### Frontend (FSD)
- **Shared**: Reusable UI kit, utilities
- **Entities**: Business entities and their UI
- **Features**: User interactions and scenarios
- **Widgets**: Composite blocks from entities/features
- **Pages**: Application pages composing widgets
- **App**: Application initialization and providers

### Code Style
- Use TypeScript strict mode
- Prefer functional components in React
- Use async/await over promises
- Implement proper error handling
- Add JSDoc comments for public APIs

## Deployment

### Local Development
```bash
# Start local blockchain
pnpm contracts:node

# Deploy contracts locally
pnpm contracts:deploy:local

# Start all services
pnpm dev
```

### Testnet Deployment
```bash
# Deploy to Sepolia
pnpm contracts:deploy:sepolia

# Verify contracts
pnpm contracts:verify
```

### Production Build
```bash
# Build all packages
pnpm build

# The output will be in:
# - contracts/artifacts/
# - apps/backend/dist/
# - apps/frontend/dist/
```

## Troubleshooting

### Common Issues

1. **Python/node-gyp errors during install:**
   - Install Python 3.x with distutils
   - Or use Node.js 18.x which has better compatibility

2. **Contract compilation errors:**
   - Ensure Solidity version matches in hardhat.config.ts
   - Check for OpenZeppelin version compatibility

3. **TypeScript errors:**
   - Run `pnpm --filter @tap-forge/shared build` first
   - Ensure all packages are built in correct order

4. **WASM build errors:**
   - Install Rust and wasm-bindgen-cli
   - Check Rust toolchain is up to date

### Getting Help

- Check [PROJECT_PLAN.md](PROJECT_PLAN.md) for project overview
- Review package-specific README files
- Check GitHub issues for known problems

## Contributing

1. Create feature branch from `main`
2. Follow the code style guidelines
3. Write tests for new functionality
4. Ensure all tests pass
5. Create pull request with clear description

## Security

- Never commit `.env` files
- Use environment variables for secrets
- Follow smart contract security best practices
- Implement proper input validation
- Use rate limiting on API endpoints

## Resources

- [Hardhat Documentation](https://hardhat.org/docs)
- [Fastify Documentation](https://www.fastify.io/docs/latest/)
- [wagmi Documentation](https://wagmi.sh)
- [Feature-Sliced Design](https://feature-sliced.design/)
- [Domain-Driven Design](https://martinfowler.com/tags/domain%20driven%20design.html)