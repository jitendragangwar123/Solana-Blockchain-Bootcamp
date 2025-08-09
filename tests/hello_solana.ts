import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { HelloSolana } from "../target/types/hello_solana";
import { assert } from "chai";

describe("solana_vault", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.helloSolana as Program<HelloSolana>;
  const signer = anchor.web3.Keypair.generate();
  const data_account = anchor.web3.Keypair.generate();
  const recipient = anchor.web3.Keypair.generate();

  it("Is initialized with hello solana vault", async () => {
    // Fund the signer wallet
    await program.provider.connection.confirmTransaction(
      await program.provider.connection.requestAirdrop(
        signer.publicKey,
        100 * anchor.web3.LAMPORTS_PER_SOL
      ),
      "confirmed"
    );

    const tx = await program.methods
      .initialize("Solana Vault")
      .accounts({
        signer: signer.publicKey,
        dataAccount: data_account.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      } as any)
      .signers([signer, data_account])
      .rpc();

    const data = await program.account.dataAccount.fetch(data_account.publicKey);

    console.log("Data Account:", data);
    console.log("Your transaction signature:", tx);
    assert.equal(data.hello, "Solana Vault", "Should store correct hello message");
  });

  it("Initializes with a different message", async () => {
    // Create a new data account
    const newDataAccount = anchor.web3.Keypair.generate();

    // Fund the signer wallet
    await program.provider.connection.confirmTransaction(
      await program.provider.connection.requestAirdrop(
        signer.publicKey,
        100 * anchor.web3.LAMPORTS_PER_SOL
      ),
      "confirmed"
    );

    const message = "welcome to solana vault";
    const tx = await program.methods
      .initialize(message)
      .accounts({
        signer: signer.publicKey,
        dataAccount: newDataAccount.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      } as any)
      .signers([signer, newDataAccount])
      .rpc();

    const data = await program.account.dataAccount.fetch(newDataAccount.publicKey);

    console.log("Data Account:", data);
    console.log("Your transaction signature:", tx);
    assert.equal(data.hello, message, "Should store the new message correctly");
  });

  it("Transfers lamports successfully", async () => {
    // Fund the signer wallet
    await program.provider.connection.confirmTransaction(
      await program.provider.connection.requestAirdrop(
        signer.publicKey,
        100 * anchor.web3.LAMPORTS_PER_SOL
      ),
      "confirmed"
    );

    // Get initial balances
    const initialSignerBalance = await program.provider.connection.getBalance(signer.publicKey);
    const initialRecipientBalance = await program.provider.connection.getBalance(recipient.publicKey);

    const transferAmount = 1 * anchor.web3.LAMPORTS_PER_SOL;

    const tx = await program.methods
      .transferLamports(new anchor.BN(transferAmount))
      .accounts({
        signer: signer.publicKey,
        recipient: recipient.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      } as any)
      .signers([signer])
      .rpc();

    // Get final balances
    const finalSignerBalance = await program.provider.connection.getBalance(signer.publicKey);
    const finalRecipientBalance = await program.provider.connection.getBalance(recipient.publicKey);

    console.log("Transfer transaction signature:", tx);
    console.log("Initial signer balance:", initialSignerBalance);
    console.log("Final signer balance:", finalSignerBalance);
    console.log("Initial recipient balance:", initialRecipientBalance);
    console.log("Final recipient balance:", finalRecipientBalance);

    // Verify the transfer (accounting for transaction fees)
    assert.approximately(
      finalSignerBalance,
      initialSignerBalance - transferAmount,
      0.1 * anchor.web3.LAMPORTS_PER_SOL,
      "Signer balance should decrease by approximately the transfer amount"
    );
    assert.equal(
      finalRecipientBalance,
      initialRecipientBalance + transferAmount,
      "Recipient balance should increase by the transfer amount"
    );
  });

  it("Fails to transfer zero lamports", async () => {
    // Fund the signer wallet
    await program.provider.connection.confirmTransaction(
      await program.provider.connection.requestAirdrop(
        signer.publicKey,
        100 * anchor.web3.LAMPORTS_PER_SOL
      ),
      "confirmed"
    );

    try {
      await program.methods
        .transferLamports(new anchor.BN(0))
        .accounts({
          signer: signer.publicKey,
          recipient: recipient.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        } as any)
        .signers([signer])
        .rpc();
      assert.fail("Should have thrown an error for zero lamports");
    } catch (error) {
      assert.include(
        error.message,
        "The transfer amount must be greater than 0",
        "Should throw InvalidAmount error"
      );
    }
  });

  it("Fails to transfer more lamports than available", async () => {
    // Fund the signer wallet with a small amount
    await program.provider.connection.confirmTransaction(
      await program.provider.connection.requestAirdrop(
        signer.publicKey,
        1 * anchor.web3.LAMPORTS_PER_SOL
      ),
      "confirmed"
    );

    const signerBalance = await program.provider.connection.getBalance(signer.publicKey);
    const transferAmount = signerBalance + 1 * anchor.web3.LAMPORTS_PER_SOL; // More than available

    try {
      await program.methods
        .transferLamports(new anchor.BN(transferAmount))
        .accounts({
          signer: signer.publicKey,
          recipient: recipient.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        } as any)
        .signers([signer])
        .rpc();
      assert.fail("Should have thrown an error for insufficient funds");
    } catch (error) {
      assert.include(
        error.message,
        "Insufficient funds for the transfer",
        "Should throw InsufficientFunds error"
      );
    }
  });

  it("Verifies data account contents after initialization", async () => {
    // Assuming the first test (initialize) has run, fetch and verify data_account
    const data = await program.account.dataAccount.fetch(data_account.publicKey);
    assert.equal(data.hello, "Solana Vault", "Data account should contain the initialized message");
  });
});