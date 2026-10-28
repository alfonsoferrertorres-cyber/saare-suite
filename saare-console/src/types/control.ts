// saare-console/src/types/runtimeControl.ts — Especificación de Tipos y Validadores S.A.A.R.E.

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

// Patrones de validación sintáctica
export const CTL_ID_REGEX = /^CTL[-_][A-Z0-9_]{3,32}$/;
export const SEMVER_REGEX = /^\d+\.\d+\.\d+$/;

/**
 * Valida si un objeto RuntimeControlConfig cumple con las restricciones de formato sintáctico.
 * 
 * @param config Configuración del control en tiempo de ejecución.
 * @returns Objeto con estado de validez y lista de errores detectados.
 */
export function validateRuntimeControlConfig(config: RuntimeControlConfig): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!config || typeof config !== 'object') {
    return { isValid: false, errors: ['La configuración provista es inválida o nula.'] };
  }

  if (!config.id || !CTL_ID_REGEX.test(config.id)) {
    errors.push(`El ID '${config.id}' no cumple con el formato requerido (^CTL[-_][A-Z0-9_]{3,32}$).`);
  }

  if (config.version && !SEMVER_REGEX.test(config.version)) {
    errors.push(`La versión '${config.version}' no cumple con el formato semver (^\d+\.\d+\.\d+$).`);
  }

  if (!Array.isArray(config.rules)) {
    errors.push('El campo rules debe ser una lista de reglas válida.');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}