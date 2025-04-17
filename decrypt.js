import { PublicKey, PrivateKey } from "paillier-bigint";
import fs from "fs";
import axios from "axios";

(async () => {
  const {
    lambda,
    mu,
    publicKey: pubObj,
  } = JSON.parse(fs.readFileSync("./keys/private.json", "utf-8"));
  const pub = new PublicKey(BigInt(pubObj.n), BigInt(pubObj.g));
  const priv = new PrivateKey(BigInt(lambda), BigInt(mu), pub);

  const res = await axios.get("http://localhost:3000/sum/user1/user1");
  const sumEnc = BigInt(res.data.encryptedSum);

  const decrypted = priv.decrypt(sumEnc);
  console.log(`Decrypted Sum: ${decrypted.toString()}`);
})();
