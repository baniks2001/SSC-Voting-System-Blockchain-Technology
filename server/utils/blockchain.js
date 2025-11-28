import { ETHEREUM_CONFIG } from '../../config/ethereum.js';

export class BlockchainManager {
  constructor() {
    this.nodes = ETHEREUM_CONFIG.nodes;
    this.currentNode = 0;
  }

  async switchNode() {
    this.currentNode = (this.currentNode + 1) % this.nodes.length;
    console.log(`Switched to node: ${this.nodes[this.currentNode].name}`);
  }

  getCurrentNode() {
    return this.nodes[this.currentNode];
  }

  async executeWithFallback(operation) {
    for (let i = 0; i < this.nodes.length; i++) {
      try {
        const result = await operation(this.nodes[this.currentNode]);
        return result;
      } catch (error) {
        console.warn(`Operation failed on node ${this.nodes[this.currentNode].name}:`, error);
        await this.switchNode();
      }
    }
    throw new Error('All blockchain nodes failed');
  }
}

export const blockchainManager = new BlockchainManager();