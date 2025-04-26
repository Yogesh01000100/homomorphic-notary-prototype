import axios from 'axios';
import fs from 'fs';
import { PublicKey, PrivateKey } from 'paillier-bigint';

(async () => {
  const { lambda,mu,publicKey:pk } = JSON.parse(fs.readFileSync('../notary-app/keys/private.json','utf8'));
  const pub = new PublicKey(BigInt(pk.n),BigInt(pk.g));
  const priv = new PrivateKey(BigInt(lambda),BigInt(mu),pub);

  const res = await axios.get('http://localhost:3000/sum/user1');
  console.log('Decrypted Sum:', priv.decrypt(BigInt(res.data.encryptedSum)).toString());
})();
