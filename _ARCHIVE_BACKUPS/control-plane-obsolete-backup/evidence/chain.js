import crypto from 'crypto';

let lastChainHash = 'GENESIS_BLOCK_SAARE_2026';

export function buildEvidenceBlock(evidenceData) {
  const payloadToSign = `${lastChainHash}|${evidenceData.evidenceId}|${evidenceData.timestamp}|${evidenceData.verdict}`;
  const blockHash = crypto.createHash('sha256').update(payloadToSign).digest('hex').toUpperCase();
  
  lastChainHash = blockHash;
  
  return {
    ...evidenceData,
    previousBlockHash: lastChainHash,
    blockHash: blockHash
  };
}
