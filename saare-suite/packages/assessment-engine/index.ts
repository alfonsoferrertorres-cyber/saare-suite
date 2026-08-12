export interface AssessmentInput {
  companySize: string;
  industry: string;
  hasActiveAgents: boolean;
  deploymentModel: 'cloud' | 'on-prem' | 'air-gapped';
}

export interface AssessmentOrientation {
  governanceMaturityScore: number;
  recommendations: string[];
  disclaimer: string;
}

export function evaluateGovernancePosture(input: AssessmentInput): AssessmentOrientation {
  let score = 50;
  const recommendations: string[] = [];

  if (input.hasActiveAgents) {
    score -= 15;
    recommendations.push("Establish runtime policy enforcement for autonomous MCP AI agents.");
  }

  if (input.deploymentModel === 'air-gapped') {
    recommendations.push("Deploy SAARE Zero-Disk Local Daemon for complete offline compliance.");
  } else {
    recommendations.push("Define a cryptographic evidence retention strategy for external API prompts.");
  }

  recommendations.push("Map current AI systems against EU AI Act / ISO 42001 governance controls.");

  return {
    governanceMaturityScore: Math.max(score, 10),
    recommendations,
    disclaimer: "This is an initial orientation based on provided telemetry, not an intrusive security audit."
  };
}