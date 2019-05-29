const SHA256 = require('crypto-js/sha256');
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

//#UPDATE 2
class Transaction {
	constructor(fromAddress, toAddress, amount) {
		this.fromAddress = fromAddress;
		this.toAddress = toAddress;
		this.amount = amount;
		this.timestamp = new Date();
	}

	calculateHash() {
		return SHA256(this.fromAddress + this.toAddress + this.amount + this.timestamp).toString()
	}

	// #UPDATE 3:
	// We need a way to prove that a transaction is legit.
	signTransaction(signingKey) {
		// signingKey = the genKeyPair result, located in "keygenerator.js"

		if (signingKey.getPublic('hex') !== this.fromAddress) {
			throw new Error('You cannot sign transactions for other wallets.');
		}

		const hashTx = this.calculateHash();
		const sig = signingKey.sign(hashTx, 'base64');
		this.signature = sig.toDER('hex');
	}

	isValid() {
		// There is a special type of transaction that we must watch for: mining rewards
		// These transactions are technically valid even though they don't have a fromAddress
		// This is the only case when we automatically detect it to be true
		if (this.fromAddress == null) return true;

		if (!this.signature || this.signature.length == 0) {
			throw new Error('No signature detected in this transaction');
		}

		const publicKey = ec.keyFromPublic(this.fromAddress, 'hex');
		return publicKey.verify(this.calculateHash(), this.signature);

	}
}

class Block {

	constructor(timestamp, transactions, previousHash = '') {
		this.timestamp = timestamp;
		this.transactions = transactions;
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

	// UPDATE #1
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

	hasValidTransactions() {
		for(const tx of this.transactions) {
			if (!tx.isValid()) {
				return false;
			}
		}
		return true;
	}

}

class Blockchain {
	constructor() {
		this.chain = [this.createGenesisBlock()];
		// UPDATE #1
		// difficulty is used for controlling how many blocks are added into the blockchain
		// This is done via increasing the mining time required for blocks to be added
		this.difficulty = 2;
		// UPDATE #2
		// since blocks are only added at certain intervals, multiple transactions can be added to a block
		// In order to keep track of which transactions are waiting to be added, we need to keep them somewhere...
		this.pendingTransactions = [];
		// UPDATE #2
		// You have introduce coins into the system somehow. Every time a new block is added to the blockchain,
		// a reward is given to the miner.
		this.miningReward = 100;
	}

	createGenesisBlock() {
		return new Block("01/01/2019","Genesis Block", "0");
	}

	getLatestBlock() {
		return this.chain[this.chain.length - 1];
	}

	// UPDATE #2
	// Now that we've implemented a pending transactions list, we can't just add blocks anymore
	// Instead, we need a new function "minePendingTransactions", which sends the mininReward to the individual who
	// has successfully mined a new address
	/*
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
	*/

	minePendingTransactions(miningRewardAddress) {
		// Under normal, real-world situations, you wouldn't be able to add ALL the pending transactions into
		// one block because there are just too many to count.
		// Additionally, we need to worry about the possibility of Double Spending
		// Miners usually are allowed to choose which transactions to add and which to remove
		let block = new Block(new Date(), this.pendingTransactions);
		block.mineBlock(this.difficulty);

		console.log("Block successfully mined");
		this.chain.push(block);

		// It might be concerning that an individual may change this function to give them more reward...
		// However, since this is a network, such attempts at fooling the network are ignored or easily rectified
		this.pendingTransactions = [
			new Transaction(null, miningRewardAddress, this.miningReward)
		];
	}

	createTransaction(transaction) {
		if (!transaction.fromAddress || !transaction.toAddress) {
			throw new Error('Transaction must include from and to address');
		}

		if (!transaction.isValid()) {
			throw new Error('Cannot add invalid transactions to the chain');
		}
		this.pendingTransactions.push(transaction);
	}

	getBalanceOfAddress(address) {
		let balance = 0;
		for (const block of this.chain) {
			for(const trans of block.transactions) {
				if (trans.fromAddress == address) {
					balance -= trans.amount;
				}
				if (trans.toAddress == address) {
					balance += trans.amount;
				}
			}
		}

		return balance;
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

			if (!currentBlock.hasValidTransactions()) {
				return false
			}
		}

		return true;
	}
}

module.exports.Blockchain = Blockchain;
module.exports.Block = Block;
module.exports.Transaction = Transaction;