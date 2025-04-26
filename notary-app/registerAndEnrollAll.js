// registerAndEnrollAll.js
import FabricCAServices from 'fabric-ca-client';
import { Wallets } from 'fabric-network';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

async function main() {
  // 1) Load the connection profile
  const ccpPath = path.resolve(
    __dirname,
    '../fabric-samples/test-network/organizations/peerOrganizations/org1.example.com/connection-org1.json'
  );
  const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

  // 2) Create CA client
  const caInfo = ccp.certificateAuthorities['ca.org1.example.com'];
  const ca     = new FabricCAServices(caInfo.url);

  // 3) Create (or open) the wallet
  const walletPath = path.join(__dirname, 'wallet');
  const wallet     = await Wallets.newFileSystemWallet(walletPath);

  // ────────── Enroll Admin ──────────
  let adminIdentity = await wallet.get('admin');
  if (!adminIdentity) {
    console.log('⏳ Enrolling admin...');
    const enrollment = await ca.enroll({
      enrollmentID: 'admin',
      enrollmentSecret: 'adminpw'
    });
    const x509Identity = {
      credentials: {
        certificate: enrollment.certificate,
        privateKey: enrollment.key.toBytes()
      },
      mspId: 'Org1MSP',
      type: 'X.509'
    };
    await wallet.put('admin', x509Identity);
    console.log('✅ Admin enrolled');
    // **Re-load** the admin identity from wallet
    adminIdentity = await wallet.get('admin');
  } else {
    console.log('✅ Admin already enrolled');
  }

  // ────────── Register & Enroll Auditor ──────────
  let auditorIdentity = await wallet.get('auditor');
  if (!auditorIdentity) {
    console.log('⏳ Registering & enrolling auditor...');

    // 4) Get a user object for admin so we can register a new user
    const provider  = wallet.getProviderRegistry().getProvider(adminIdentity.type);
    const adminUser = await provider.getUserContext(adminIdentity, 'admin');

    // 5) Register the new “auditor” user, embedding role=auditor
    await ca.register({
      enrollmentID: 'auditor',
      enrollmentSecret: 'auditorpw',
      role: 'client',
      affiliation: 'org1.department1',
      attrs: [{ name: 'role', value: 'auditor', ecert: true }]
    }, adminUser);

    // 6) Enroll “auditor”, requesting that attribute in the cert
    const enrollment2 = await ca.enroll({
      enrollmentID: 'auditor',
      enrollmentSecret: 'auditorpw',
      attr_reqs: [{ name: 'role', optional: false }]
    });
    const x509Auditor = {
      credentials: {
        certificate: enrollment2.certificate,
        privateKey: enrollment2.key.toBytes()
      },
      mspId: 'Org1MSP',
      type: 'X.509'
    };
    await wallet.put('auditor', x509Auditor);
    console.log('✅ Auditor enrolled with role=auditor');
  } else {
    console.log('✅ Auditor already enrolled');
  }
}

main().catch(err => {
  console.error('❌ Setup failed:', err);
  process.exit(1);
});
