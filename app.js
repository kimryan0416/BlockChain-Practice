const SHA256 = require('crypto-js/sha256')

class Block {
	constructor(index, timestamp, data, previousHash = '') {
		this.index = index;
		this.timestamp = timestamp;
		this.data = data;
		this.previousHash = previousHash;
		this.hash = this.calculateHash();
	}

	calculateHash() {
		return SHA256(this.index + this.previousHash + this.timestamp + JSON.stringify(this.data)).toString();
	}
}

class Blockchain {
	constructor() {
		this.chain = [this.createGenesisBlock()];
	}

	createGenesisBlock() {
		return new Block(0,"01/01/2019","Genesis Block", "0");
	}

	getLatestBlock() {
		return this.chain[this.chain.length - 1];
	}

	addBlock(newBlock) {
		newBlock.previousHash = this.getLatestBlock().hash;
		newBlock.hash = newBlock.calculateHash();
		// Usually need more checks to add a block, but this is enough for our purposes
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
myCoin.addBlock(new Block(1, "05/29/2019", { amount: 4}));
myCoin.addBlock(new Block(2, "05/30/2019", { amount: 10}));

console.log("Is blockchain valid #1?\n"+myCoin.isChainValid());

myCoin.chain[1].data = { amount: 100 };
console.log("Is blockchain valid #2?\n"+myCoin.isChainValid());

myCoin.chain[1].hash = myCoin.chain[1].calculateHash();
console.log("Is blockchain valid #3?\n"+myCoin.isChainValid());

//console.log(JSON.stringify(myCoin, null, 4));