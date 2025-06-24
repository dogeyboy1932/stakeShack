const bs58 = require('bs58').default;
const fs = require('fs');

// Your private key from Phantom
const privateKey = '3Pv9tZo1W9LZp4RsJLPJpKunuMoBEB7S35vMq7GXKNRswJ2CTPPJSE95oiHf27Trx2zCxvVJ7sWid9HX54TJW73H';

// Convert to keypair format
const secretKey = bs58.decode(privateKey);
const keypairArray = Array.from(secretKey);

// Save as keypair.json
fs.writeFileSync('keypair.json', JSON.stringify(keypairArray));