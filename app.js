const {Blockchain, Transaction} = require('./blockchain.js');
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

// The public key is our address, in public form. In other words, it's our wallet address.
// We can get the public key from our private key via the method below.
// Public: 040e90978c29e64f85fb15b19f958b54777796a0f9045bb64c507a6ce06921897b562cd22fe7a950388eebae800fe9dbef16d9436e2d2018db1ac0a8e5f483a221
// Below = private
const myKey = ec.keyFromPrivate('21f365f205ff3a8e3e4fb61742a89943e3f3eed0e93e91a4e4eea82ad98f6875');
const myWalletAddress = myKey.getPublic('hex');


let myCoin = new Blockchain();

const tx1 = new Transaction(myWalletAddress, 'Another public key goes here', 10);
tx1.signTransaction(myKey);
myCoin.createTransaction(tx1);

// UPDATE #3:
// We'll be removing this part below, since it's now deprecated - newTransaction has been replaced by createTransaction
/*
myCoin.newTransaction(new Transaction('address1','address2',100));
myCoin.newTransaction(new Transaction('address1', 'address2', 50));
*/

// UPDATE #3:
// We previously had the address sent to 'Ryan Address'. However, this is a technically nonexistent address
// This is becuase there is no keyvalue pair registered with that address.
// If we leave it at 'Ryan Address', we're effectively sending the mining reward to a place that can never be accessed
// Therefore, we repalced it with 'myWalletAddress' to ensure that it's being sent to the right wallet
console.log('\n Starting the miner...');
myCoin.minePendingTransactions(myWalletAddress);

console.log('\nBalance of Ryan Address: ' + myCoin.getBalanceOfAddress(myWalletAddress));

// We need to do another mine because the reward for the mining the first time is added to pending
// We need to move that transaction from the pending to the actual blockchain, so we call this again
console.log('\n Starting the miner again...');
myCoin.minePendingTransactions(myWalletAddress);

console.log('\nBalance of Ryan Address: ' + myCoin.getBalanceOfAddress(myWalletAddress));

myCoin.chain[1].transactions[0].amount = 1;
console.log("\nIs chain valid? " + myCoin.isChainValid());

/*
// UPDATE #2
// The code below was used to test of the Proof of Work would actually work. It is no longer necessary unless
// for testing purposes
console.log('Mining Block 1...')
myCoin.addBlock(new Block(1, "05/29/2019", { amount: 4}));

console.log('Mining Block 2...');
myCoin.addBlock(new Block(2, "05/30/2019", { amount: 10}));
*/



/*
// UPDATE #1
// The code below was used prior to the addition of the 'mineBlock' function inside the Block class.
// In other words, the code below was just to check if the blockchain could validate its blocks properly.

console.log("Is blockchain valid #1?\n"+myCoin.isChainValid());

myCoin.chain[1].data = { amount: 100 };
console.log("Is blockchain valid #2?\n"+myCoin.isChainValid());
// Because the block's recorded has his not the same as the recalculated hash...

myCoin.chain[1].hash = myCoin.chain[1].calculateHash();
console.log("Is blockchain valid #3?\n"+myCoin.isChainValid());
// Because the next block's recorded hash of the current block is not the same as the current block's recorded hash.

//console.log(JSON.stringify(myCoin, null, 4));
*/