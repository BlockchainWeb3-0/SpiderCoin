import merkle from "merkle";
import Block from "./block";
import * as config from "../config";


export default class Blockchain {
	chain: Block[];

	constructor() {
		this.chain = [Block.getGenesisBlock()];
	}


	getLastBlock(): Block {    
		return this.chain[this.chain.length - 1];
	}

	addBlock(data: object[]) {
    const newBlock: Block = Block.mineNewBlock(
			this.chain[this.chain.length - 1],
			data
		);
		const lastBlock: Block = this.getLastBlock();
		if (Blockchain.isValidNewBlock(newBlock, lastBlock))
			this.chain.push(newBlock);
		return newBlock;
	}

	static isValidBlockStructure(block: Block) {
		return (
			typeof block.header.version === "string" &&
			typeof block.header.index === "number" &&
			typeof block.header.prevHash === "string" &&
			typeof block.header.merkleRoot === "string" &&
			typeof block.header.timestamp === "number" &&
			typeof block.header.difficulty === "number" &&
			typeof block.header.nonce === "number" &&
			typeof block.data === "object" &&
			typeof block.hash === "string" 
		);
	}

	static isValidNewBlock(newBlock: Block, lastBlock: Block): boolean {
		/**
		 * Validate
		 *  1. block structure
		 *  2. index
		 *  3. prevHash
		 *  4. merkleRoot
		 *  5. timestamp
		 *  6. difficulty
		 */
		if (!this.isValidBlockStructure(newBlock)) {
			console.log("Invalid Block structure");
			return false;
		} else if (newBlock.header.index !== lastBlock.header.index + 1) {
			console.log("Invalid index");
			return false;
		} else if (newBlock.header.prevHash !== lastBlock.hash) {
			console.log("Invalid prevHash");
			return false;
		} else if (
			(newBlock.data.length === 0 &&
				newBlock.header.merkleRoot !== "0".repeat(64)) ||
			(newBlock.data.length !== 0 &&
				newBlock.header.merkleRoot !==
					merkle("sha256").sync(newBlock.data).root())
		) {
      console.log(newBlock.header.merkleRoot);
			console.log("Invalid merkleRoot");
			return false;
		} else if (newBlock.header.timestamp < lastBlock.header.timestamp ){
			console.log("Invalid timestamp");
			return false;
    } else if (!newBlock.hash.startsWith("0".repeat(newBlock.header.difficulty))){      
			console.log("Invalid difficulty");
			return false;
    }
    console.log(newBlock.data);
    console.log(newBlock.header.merkleRoot);
    console.log(merkle("sha256").sync(newBlock.data).root());
    
		return true;
	}
  
	static isValidChain(blocks: Block[] ): boolean {
    if (JSON.stringify(blocks[0]) !== JSON.stringify(Block.getGenesisBlock())) {
      return false;
		}
		for (let i = 1; i < blocks.length; i++) {
      const currentBlock: Block = blocks[i];
			const prevBlock: Block = blocks[i - 1];
      console.log(currentBlock.data.length);
			if (!this.isValidNewBlock(currentBlock, prevBlock)) {
        console.log(1);
				return false;
			}
		}
		return true;
	}
}


// const blocks = new Blockchain()
// blocks.addBlock([])
// blocks.addBlock([])
// blocks.addBlock([])
// console.log(blocks);
// console.log(Blockchain.isValidChain(blocks.chain));