import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Escrow } from "../target/types/escrow";


import { PublicKey, Keypair, SystemProgram } from "@solana/web3.js";


describe("escrow", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.escrow as Program<Escrow>;
  const provider = anchor.getProvider();

  it("Is initialized!", async () => {
    // Get the escrow PDA
    const [escrowPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from("escrow")],
      program.programId
    );

    // Initialize escrow with the provider's wallet as owner
    const tx = await program.methods
      .initializeEscrow(provider.publicKey!)
      .accounts({
        escrowAccount: escrowPDA,
        payer: provider.publicKey,
        systemProgram: SystemProgram.programId,
      } as any)
      .rpc();
    
    console.log("Initialize escrow transaction signature", tx);

    // Fetch the escrow account to verify
    const escrowAccount = await program.account.escrowAccount.fetch(escrowPDA);
    console.log("Escrow owner:", escrowAccount.owner.toString());
  });
});
