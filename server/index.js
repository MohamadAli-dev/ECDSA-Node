const express = require("express");
const app = express();
const cors = require("cors");
const secp = require("ethereum-cryptography/secp256k1");
const hashMessage = require("./scripts/hashMessage");
const port = 3042;
const { toHex } = require("ethereum-cryptography/utils");

app.use(cors());
app.use(express.json());

const balances = {
  "04cf8a40bf5e2a29c7431eae529a837dcead80a12deb1e3b5190a0986141b0ceba835881b5bc39bd8e0dc6af7ca7d1755bb25455ca67c179f21f95073ddb9f13b2": 100,
  "04ed7b08302023782b15e7060755534f327510bed89689fc63a17d866d8bd70e631bb19606be9a2cef2c57e47f96043f801871924f391c7638548619f79272258f": 50,
  "046a74b3a5fb3afc55ba4c46a93bcb5daa00e00062e89d68fc0766b97137c80d0d8ca7b73e26ef69567a3ecde37872c3a2f22565c3428c5e8b0fae9f756b98a565": 75,
};

app.get("/balance/:address", (req, res) => {
  const { address } = req.params;
  const balance = balances[address] || 0;
  res.send({ balance });
});

app.post("/send", (req, res) => {
  const { sender, recipient, amount, signedMessage, message, privateKey } = req.body;

  setInitialBalance(sender);
  setInitialBalance(recipient);

  const senderPublicKey = secp.getPublicKey(privateKey);
  console.log("Sender Public Key : ", senderPublicKey);
  console.log("Sender Private Key : ", privateKey);
  console.log("Sender Message : ", message);
  console.log("Signed Message : ", signedMessage[0]);

  const valid = secp.verify(signedMessage, hashMessage(message), senderPublicKey);
  console.log("Is valid transaction ? : ", valid);

  if (valid) {
    if (balances[sender] < amount) {
      res.status(400).send({ message: "Not enough funds!" });
    } else {
      balances[sender] -= amount;
      balances[recipient] += amount;
      res.send({ balance: balances[sender] });
    }
  } else {
    res.send("This operation is not allowed from your private key !!");
  }


});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});

function setInitialBalance(address) {
  if (!balances[address]) {
    balances[address] = 0;
  }
}