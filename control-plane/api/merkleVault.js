import crypto from 'node:crypto';

export class MerkleVault {
  constructor() {
    this.leaves = [];
  }

  hash(data) {
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  addEvidence(receipt) {
    const canonicalPayload = typeof receipt === 'string' ? receipt : JSON.stringify(receipt);
    const leafHash = this.hash(canonicalPayload);
    this.leaves.push(leafHash);
    return leafHash;
  }

  getRoot() {
    if (this.leaves.length === 0) return null;
    let currentLevel = [...this.leaves];

    while (currentLevel.length > 1) {
      const nextLevel = [];
      for (let i = 0; i < currentLevel.length; i += 2) {
        if (i + 1 < currentLevel.length) {
          nextLevel.push(this.hash(currentLevel[i] + currentLevel[i + 1]));
        } else {
          nextLevel.push(currentLevel[i]);
        }
      }
      currentLevel = nextLevel;
    }

    return currentLevel[0];
  }
}
