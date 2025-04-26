import axios from 'axios';
import fs from 'fs';
import { PublicKey } from 'paillier-bigint';

(async () => {
  const { n, g } = JSON.parse(fs.readFileSync('../notary-app/keys/public.json', 'utf8'));
  const pub = new PublicKey(BigInt(n), BigInt(g));

  const valueToEncrypt = 5071101467509235461034139442176004925795401834967259178960252334516776254442793n;

  const cipher = pub.encrypt(valueToEncrypt).toString();

  await axios.post('http://localhost:3000/store', {
    key: 'user1',
    encrypted: cipher
  });

  console.log(`✅ Encrypted ${valueToEncrypt} stored.`);
})();
