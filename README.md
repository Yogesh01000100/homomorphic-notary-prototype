cd ~/prototype/fabric-samples/test-network
./network.sh up createChannel -ca -s couchdb -c channela


./network.sh deployCC -ccn encrypted_cc -ccl javascript -ccp ../chaincode/encrypted_cc -c channela


"keygen": "node keygen.js",
    "importAdmin": "node importAdmin.js",
copy connection profile


    "start": "node notary-server.js"