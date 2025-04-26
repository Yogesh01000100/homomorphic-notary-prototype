import { generateRandomKeys } from 'paillier-bigint';
import fs from 'fs';
(async () => {
  const { publicKey, privateKey } = await generateRandomKeys(2048);
  fs.mkdirSync('./keys',{recursive:true});
  fs.writeFileSync('keys/public.json',JSON.stringify({n:publicKey.n.toString(),g:publicKey.g.toString()},null,2));
  fs.writeFileSync('keys/private.json',JSON.stringify({lambda:privateKey.lambda.toString(),mu:privateKey.mu.toString(),publicKey:{n:publicKey.n.toString(),g:publicKey.g.toString()}},null,2));
  console.log('Paillier keys generated.');
})();
