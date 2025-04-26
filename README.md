```
cd ~/prototype/fabric-samples/test-network
./network.sh up createChannel -ca -s couchdb -c channela
```

```
./network.sh deployCC -ccn encrypted_cc -ccl javascript -ccp ../chaincode/encrypted_cc -c channela
```
```
npm run keygen
```

```
npm run importAdmin
```

```
npm run start
```