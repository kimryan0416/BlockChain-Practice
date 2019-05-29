const SHA256 = require('crypto-js/sha256')

class Block {
	constructor(index, timestamp, data, previousHash = '') {
		this.index = index;
		this.timestamp = timestamp;
		this.data = data;
		this.previousHash = previousHash;
		this.hash = this.calculateHash();
		// When we mine a block, the data above will always produce the same hash value. Therfore, when we initiate
		// the While loop inside "mineBlock", the loop will go on endlessly.
		// In order to prevent this, we add a value "nonce" that doesn't really DO anything or MEAN anything, except
		// that it will change the hash value regardless. think of it like the telomeres of a DNA or something, conceptually.
		this.nonce = 0;
	}

	calculateHash() {
		return SHA256(this.index + this.previousHash + this.timestamp + JSON.stringify(this.data) + this.nonce).toString();
	}

	// In order to protect our blockchain, we need to be able to ensure that we have a valid block on our hands
	// One way to do this is via Proof of Work, or method that makes a machine perform some certain amount of work
	// to prove that it's a valid machine and that the block is valid. The more a machine has to work, the more valid
	// the block is, basically.
	mineBlock(difficulty = 5) {
		while(this.hash.substring(0,difficulty) !== Array(difficulty+1).join('0')) {
			this.nonce++
			this.hash = this.calculateHash();
		}
		console.log("Block mined: " + this.hash)
	}
}

class Blockchain {
	constructor() {
		this.chain = [this.createGenesisBlock()];
		this.difficulty = 6;
	}

	createGenesisBlock() {
		return new Block(0,"01/01/2019","Genesis Block", "0");
	}

	getLatestBlock() {
		return this.chain[this.chain.length - 1];
	}

	addBlock(newBlock) {
		newBlock.previousHash = this.getLatestBlock().hash;
		
		// In our original system, we just added the blocks without any kind of verification.
		// We've just added a Proof of Work via "mineBlock", which will add the block only under a certain condition is met
		// For now, we can implement it like so:
		newBlock.mineBlock(this.difficulty);
		// We don't have to create a new hash for "newBlock" like we did in our original version 
		// because the "mineBlock" already creates the hash for us anyways.

		this.chain.push(newBlock);
	}

	isChainValid() {
		// don't check genesis block - start from index 1
		for (let i = 1; i < this.chain.length; i++) {
			var currentBlock = this.chain[i];
			var prevBlock = this.chain[i-1];

			if (currentBlock.hash !== currentBlock.calculateHash()) {
				return false;
			}

			if (currentBlock.previousHash !== prevBlock.hash) {
				return false;
			}
		}

		return true;
	}
}

let myCoin = new Blockchain();

console.log('Mining Block 1...')
myCoin.addBlock(new Block(1, "05/29/2019", { amount: 4}));

console.log('Mining Block 2...');
myCoin.addBlock(new Block(2, "05/30/2019", { amount: 10}));



/*
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