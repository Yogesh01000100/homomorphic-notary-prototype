import { Wallets } from 'fabric-network';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

async function main() {
  const mspPath = path.resolve(
    __dirname,
    '../fabric-samples/test-network/organizations/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp'
  );
  const certDir = path.join(mspPath,'signcerts');
  const keyDir  = path.join(mspPath,'keystore');
  const cert    = fs.readFileSync(path.join(certDir, fs.readdirSync(certDir)[0]), 'utf8');
  const key     = fs.readFileSync(path.join(keyDir,  fs.readdirSync(keyDir)[0] ), 'utf8');
  const wallet = await Wallets.newFileSystemWallet('wallet');
  await wallet.put('Admin@org1.example.com',{
    credentials:{certificate:cert,privateKey:key},
    mspId:'Org1MSP',
    type:'X.509'
  });
  console.log('Imported Admin@org1.example.com');
}
main().catch(err=>{ console.error(err); process.exit(1); });
