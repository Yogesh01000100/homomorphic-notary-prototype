import express from 'express';
import bodyParser from 'body-parser';
import fs, { readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Gateway, Wallets } from 'fabric-network';
import { PublicKey, PrivateKey } from 'paillier-bigint';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

const pubJson  = JSON.parse(readFileSync(path.join(__dirname, 'keys/public.json'),  'utf8'));
const privJson = JSON.parse(readFileSync(path.join(__dirname, 'keys/private.json'), 'utf8'));

const pubKey  = new PublicKey(BigInt(pubJson.n),  BigInt(pubJson.g));
const privKey = new PrivateKey(
  BigInt(privJson.lambda),
  BigInt(privJson.mu),
  pubKey
);

//
// ─── Fabric Gateway & Contract Setup ──────
//
let contract;  
async function init() {
  const ccp    = JSON.parse(readFileSync(path.join(__dirname, 'connection-profile.json'), 'utf8'));
  const wallet = await Wallets.newFileSystemWallet(path.join(__dirname, 'wallet'));
  const gateway = new Gateway();
  await gateway.connect(ccp, {
    wallet,
    identity: 'auditor',
    discovery: { enabled: true, asLocalhost: true }
  });
  const network  = await gateway.getNetwork('channela');
  contract = network.getContract('encrypted_cc');
}
init().catch(err => {
  console.error('Failed to initialize Fabric contract:', err);
  process.exit(1);
});

//
// ─── server & Routes ────────
//
const app = express();
app.use(bodyParser.json());

// Store encrypted blob
app.post('/store', async (req, res) => {
  await contract.submitTransaction('store', req.body.key, req.body.encrypted);
  res.json({ status: 'stored' });
});

// Read raw encrypted blob
app.get('/read/:key', async (req, res) => {
  const data = await contract.evaluateTransaction('read', req.params.key);
  res.json({ encrypted: data.toString() });
});

// Homomorphic sum of two on‑chain reads
app.get('/sum/:key', async (req, res) => {
  const a   = await contract.evaluateTransaction('read', req.params.key);
  const b   = await contract.evaluateTransaction('read', req.params.key);
  const sum = pubKey.addition(BigInt(a), BigInt(b));
  res.json({ encryptedSum: sum.toString() });
});

// ─── NEW: Single‑call homomorphic read+add+decrypt ────────────────────────────
app.get('/read-encrypted/:userId', async (req, res) => {
  try {
    // Fetch encrypted value from ledger
    const response = await contract.evaluateTransaction('read', req.params.userId);
    const encryptedFromLedger = BigInt(response.toString());

    // Encrypt a new value
    const newEncrypted = pubKey.encrypt(5071101467509235461034139442176004925795401834967259178960252334516776254442793n); // business value

    // Homomorphic addition
    const encryptedSum = pubKey.addition(encryptedFromLedger, newEncrypted);

    // Decrypt the final sum
    const decryptedResult = privKey.decrypt(encryptedSum);

    res.json({
      result: decryptedResult.toString()
    });
  } catch (err) {
    console.error('Error in /read-encrypted:', err);
    res.status(500).json({ error: err.message });
  }
});


app.listen(3000, () => console.log('Notary @ http://localhost:3000'));
