#ifndef SAARE_SDK_H
#define SAARE_SDK_H

#include <stdint.h>

#ifdef __cplusplus
extern "C" {
#endif

/**
 * Valida la licencia en memoria y despacha el preset solicitado.
 * @param module_name Nombre del módulo (ej: "01_perimetershield")
 * @param preset_name Nombre del preset (ej: "banking-shield")
 * @param license_token Token criptográfico firmado
 * @return 0 = Éxito, 1 = Licencia Inválida, 2 = Parámetro Nulo
 */
int32_t saare_verify_and_dispatch(
    const char* module_name,
    const char* preset_name,
    const char* license_token
);

#ifdef __cplusplus
}
#endif

#endif // SAARE_SDK_H
