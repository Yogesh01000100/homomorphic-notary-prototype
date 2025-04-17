import express from "express";
import bodyParser from "body-parser";
import { PublicKey } from "paillier-bigint";
import fs from "fs";

const app = express();
app.use(bodyParser.json());

const db = {};

const keyData = JSON.parse(fs.readFileSync("./keys/public.json", "utf-8"));
const publicKey = new PublicKey(BigInt(keyData.n), BigInt(keyData.g));

app.post("/store", (req, res) => {
  const { key, encrypted } = req.body;
  db[key] = BigInt(encrypted);
  return res.send({ status: "stored", key });
});

app.get("/sum/:k1/:k2", (req, res) => {
  const e1 = db[req.params.k1];
  const e2 = db[req.params.k2];
  if (e1 === undefined || e2 === undefined) {
    return res.status(404).send({ error: "Key not found" });
  }
  const sumEnc = publicKey.addition(e1, e2);
  return res.send({ encryptedSum: sumEnc.toString() });
});

app.get("/read/:key", (req, res) => {
  const enc = db[req.params.key];
  if (enc === undefined) {
    return res.status(404).send({ error: "Key not found" });
  }
  res.send({ encrypted: enc.toString() });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Notary server running on http://localhost:${PORT}`);
});
