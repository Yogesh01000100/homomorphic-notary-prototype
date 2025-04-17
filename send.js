import axios from "axios";
import fs from "fs";
import { PublicKey } from "paillier-bigint";

(async () => {
  // load public key
  const { n, g } = JSON.parse(fs.readFileSync("./keys/public.json", "utf-8"));
  const pub = new PublicKey(BigInt(n), BigInt(g));

  // encrypt
  const plaintext = 100n;
  const ciphertext = pub.encrypt(plaintext);

  // send to notary
  await axios.post("http://localhost:3000/store", {
    key: "user1",
    encrypted: ciphertext.toString(),
  });

  console.log(`✅ Encrypted ${plaintext} and sent to Notary`);
})();
