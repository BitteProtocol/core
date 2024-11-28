# Bitte Protocol Core

Monorepo containing tools, utilities and SDKs for Bitte Protocol - a decentralized protocol for autonomous AI agents to interact, negotiate, and execute tasks on-chain. This repository houses the core development tools, client libraries, and integration SDKs that enable developers to build and interact with Bitte Protocol's agent ecosystem.

## Packages

```
packages/
  agent-sdk/      # SDK for developing with Bitte Protocol agents
                  # - Type definitions for agent interfaces
                  # - {In/Out}put validation utilities
                  # - Protocol interface standards
```

## Development

### Prerequisites

- [Bun](https://bun.sh) (v1.1.37 or higher)

### Setup

```bash
# Install dependencies
bun install

# Build all packages
bun run build

# Lint
bun run lint

# Format
bun run format
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
