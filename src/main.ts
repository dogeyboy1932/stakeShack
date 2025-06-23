import { loadKeypairSignerFromFile, saveKeypairSignerToFile } from "gill/node";

import { createSolanaClient, createTransaction, generateExtractableKeyPairSigner, getSignatureFromTransaction, KeyPairSigner, signTransactionMessageWithSigners } from "gill";

import { getAddMemoInstruction } from "gill/programs";

import { Keypair } from "@solana/web3.js";
import bs58 from "bs58";


// const extractableSigner: KeyPairSigner = await generateExtractableKeyPairSigner();

// await saveKeypairSignerToFile(extractableSigner, "~/.config/solana/id.json");


const signer = await loadKeypairSignerFromFile("~/.config/solana/id.json");


const { rpc, rpcSubscriptions, sendAndConfirmTransaction } = createSolanaClient({

urlOrMoniker: "devnet" // Change to mainnet for production

});

const { value: latestBlockhash } = await rpc.getLatestBlockhash().send();

// console.log(latestBlockhash)

const memoIx = getAddMemoInstruction({

    memo: "Hello World",

})

const transaction = createTransaction({
    version: "legacy",
    feePayer: signer,
    instructions: [memoIx],
    latestBlockhash,
    computeUnitLimit: 200000,
    computeUnitPrice: 1000
});

const signedTransaction = await signTransactionMessageWithSigners(transaction);

// console.log(signedTransaction)

const sig = getSignatureFromTransaction(signedTransaction);

// console.log(sig)

const sig2 = await sendAndConfirmTransaction(signedTransaction);

// console.log(sig2)