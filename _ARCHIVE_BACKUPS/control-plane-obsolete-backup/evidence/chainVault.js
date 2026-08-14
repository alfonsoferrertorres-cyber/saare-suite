import crypto from "crypto";

export class ChainVault {
  constructor() {
    this.chain = [];
    this.genesisHash = "0000000000000000000000000000000000000000000000000000000000000000";
  }

  // Insertar evento en la cadena enlazada
  addEvidence(receipt) {
    const prevHash = this.chain.length === 0 
      ? this.genesisHash 
      : this.chain[this.chain.length - 1].sequenceHash;

    const sequenceIndex = this.chain.length;
    const payloadToHash = `${sequenceIndex}:${prevHash}:${receipt.contentHash}`;
    const sequenceHash = crypto.createHash("sha256").update(payloadToHash).digest("hex");

    const chainedReceipt = {
      ...receipt,
      sequenceIndex,
      prevHash,
      sequenceHash
    };

    this.chain.push(chainedReceipt);
    return chainedReceipt;
  }

  // Generar la Merkle Root de toda la cadena
  getMerkleRoot() {
    if (this.chain.length === 0) return null;
    let hashes = this.chain.map(item => item.sequenceHash);

    while (hashes.length > 1) {
      if (hashes.length % 2 !== 0) hashes.push(hashes[hashes.length - 1]);
      const nextLevel = [];
      for (let i = 0; i < hashes.length; i += 2) {
        const combined = crypto.createHash("sha256").update(hashes[i] + hashes[i + 1]).digest("hex");
        nextLevel.push(combined);
      }
      hashes = nextLevel;
    }
    return hashes[0];
  }

  // Validar la integridad completa de la cadena de custodia
  verifyChainIntegrity() {
    for (let i = 0; i < this.chain.length; i++) {
      const current = this.chain[i];
      const expectedPrevHash = i === 0 ? this.genesisHash : this.chain[i - 1].sequenceHash;

      if (current.prevHash !== expectedPrevHash) {
        return { ok: false, error: `Rotura de cadena en índice ${i}: prevHash no coincide.` };
      }

      const recalculatedSequenceHash = crypto.createHash("sha256")
        .update(`${i}:${expectedPrevHash}:${current.contentHash}`)
        .digest("hex");

      if (current.sequenceHash !== recalculatedSequenceHash) {
        return { ok: false, error: `Alteración detectada en el registro ${i}: sequenceHash alterado.` };
      }
    }

    return { 
      ok: true, 
      totalRecords: this.chain.length, 
      merkleRoot: this.getMerkleRoot(),
      status: "CHAIN_INTEGRITY_VERIFIED" 
    };
  }
}
