# Solana Vault

Solana Vault is a Solana-based smart contract built using the Anchor framework. It allows users to initialize a data account with a greeting message and transfer lamports (Solana's native currency) between accounts. The program ensures secure and validated transactions while demonstrating basic Anchor program functionality.


## Overview
Solana Vault is a simple Solana program that includes two main instructions:
1. `initialize`: Creates a data account to store a greeting message.
2. `transfer_lamports`: Transfers a specified amount of lamports from a signer to a recipient account, with validation checks for sufficient funds and valid amounts.

The program uses Anchor's declarative macros and CPI (Cross-Program Invocation) to interact with the Solana System Program for lamport transfers.

## Features
- Initialize a data account with a custom greeting message.
- Securely transfer lamports between accounts with validation checks.
- Uses Anchor's account validation and error handling.
- Logs transfer details for transparency.

## Prerequisites
Before setting up the project, ensure you have the following installed:
- [Rust](https://www.rust-lang.org/tools/install) (latest stable version)
- [Solana CLI](https://docs.solana.com/cli/install-solana-cli-tools) (v1.18.0 or higher)
- [Anchor CLI](https://www.anchor-lang.com/docs/installation) (v0.30.0 or higher)
- [Node.js](https://nodejs.org/) (for testing with TypeScript, optional)
- A Solana wallet with some SOL for deployment and testing (e.g., on devnet)

## Installation
1. **Install Anchor Manually**
   ```shell
   cargo install --git https://github.com/coral-xyz/anchor --tag v0.31.1 anchor-cli --locked
2. **Create a New Project (Optional)**:
    If starting from scratch, initialize a new Anchor project:
    ```shell
    anchor init hello_solana
    cd hello_solana
3. **Clone the Repository**
    If using the provided code:
    ```shell
    git clone https://github.com/jitendragangwar123/Solana-Blockchain-Bootcamp.git
    cd Solana-Blockchain-Bootcamp
4. **Install Dependencies**
   ```bash
   yarn install
5. **Build the Program**
   ```bash
   anchor build
6. **Deploy to Devnet**
    Ensure your Solana CLI is configured for devnet:
    ```bash
    solana config set --url https://api.devnet.solana.com
    anchor deploy
## Testing
1. **Start a Local Validator**
    ```shell
    cd .anchor
    solana-test-validator
2. **Run Tests**
   ```shell
   anchor test