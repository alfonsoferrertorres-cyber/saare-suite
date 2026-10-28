export type DimensionSAARE =
  | 'DIM_01_IDENTITY'
  | 'DIM_02_ACTION'
  | 'DIM_03_CONTEXT'
  | 'DIM_04_RESOURCE'
  | 'DIM_05_DATA'
  | 'DIM_06_RISK'
  | 'DIM_07_POLICY';

export type ActionOnTrigger = 'ALLOW' | 'DENY' | 'SANITIZE' | 'REVIEW';

export interface RuntimeControlRule {
  condition: string;
  pattern: string;
  description?: string;
}

export interface RuntimeControlConfig {
  id: string; // Formato ^CTL[-_][A-Z0-9_]{3,32}$
  name: string;
  description?: string;
  version?: string; // Formato semver: ^\d+\.\d+\.\d+$
  enabled?: boolean;
  dimension: DimensionSAARE;
  actionOnTrigger: ActionOnTrigger;
  rules: RuntimeControlRule[];
}