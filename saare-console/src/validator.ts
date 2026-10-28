import { RuntimeControlConfig, DimensionSAARE, ActionOnTrigger } from './types/control';

const DIMENSIONES_VALIDAS: DimensionSAARE[] = [
  'DIM_01_IDENTITY',
  'DIM_02_ACTION',
  'DIM_03_CONTEXT',
  'DIM_04_RESOURCE',
  'DIM_05_DATA',
  'DIM_06_RISK',
  'DIM_07_POLICY',
];

const ACCIONES_VALIDAS: ActionOnTrigger[] = ['ALLOW', 'DENY', 'SANITIZE', 'REVIEW'];

export function validarRuntimeControl(data: unknown): { valido: boolean; error?: string } {
  if (typeof data !== 'object' || data === null) {
    return { valido: false, error: 'El payload debe ser un objeto JSON.' };
  }

  const ctrl = data as Partial<RuntimeControlConfig>;

  // Validar ID
  if (!ctrl.id || !/^CTL[-_][A-Z0-9_]{3,32}$/.test(ctrl.id)) {
    return { valido: false, error: 'El ID no cumple el patrón ^CTL[-_][A-Z0-9_]{3,32}$' };
  }

  // Validar Nombre
  if (!ctrl.name || ctrl.name.length < 3 || ctrl.name.length > 128) {
    return { valido: false, error: 'El nombre debe tener entre 3 y 128 caracteres.' };
  }

  // Validar Dimensión
  if (!ctrl.dimension || !DIMENSIONES_VALIDAS.includes(ctrl.dimension)) {
    return { valido: false, error: `Dimensión no válida: ${ctrl.dimension}` };
  }

  // Validar Acción en Disparo
  if (!ctrl.actionOnTrigger || !ACCIONES_VALIDAS.includes(ctrl.actionOnTrigger)) {
    return { valido: false, error: `Acción no válida: ${ctrl.actionOnTrigger}` };
  }

  // Validar Reglas
  if (!Array.isArray(ctrl.rules) || ctrl.rules.length === 0) {
    return { valido: false, error: 'El control debe incluir al menos una regla en "rules".' };
  }

  for (const rule of ctrl.rules) {
    if (!rule.condition || !rule.pattern) {
      return { valido: false, error: 'Cada regla debe contener "condition" y "pattern".' };
    }
  }

  return { valido: true };
}