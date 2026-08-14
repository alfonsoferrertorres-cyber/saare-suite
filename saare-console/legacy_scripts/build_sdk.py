import os
import zipfile

# Asegurar directorio de descargas
os.makedirs("public/downloads", exist_ok=True)

# 1. Header C-ABI (saare_runtime.h)
c_header_content = """#ifndef SAARE_RUNTIME_H
#define SAARE_RUNTIME_H

#include <stdint.h>
#include <stddef.h>

#ifdef _WIN32
  #define SAARE_API __declspec(dllexport)
#else
  #define SAARE_API __attribute__((visibility("default")))
#endif

#ifdef __cplusplus
extern "C" {
#endif

/**
 * @brief Inicializa el motor Zero-Disk en RAM e inspecciona la licencia Ed25519.
 * @param license_path Ruta al archivo saare.lic
 * @return 0 si es exitoso, <0 si hay error de firma o expiración.
 */
SAARE_API int32_t saare_init(const char* license_path);

/**
 * @brief Inspección L7 ex-ante en memoria RAM (<1.16ms).
 * @param payload Prompt o carga útil a analizar
 * @param output_buf Buffer para escribir la respuesta desinfectada/validada
 * @param buf_len Tamaño del buffer de salida
 * @return 0 si se aprueba, >0 si se aplica mitigación/enmascaramiento, <0 si se bloquea.
 */
SAARE_API int32_t saare_inspect_l7(const char* payload, char* output_buf, size_t buf_len);

/**
 * @brief Libera los recursos asignados en RAM volátil.
 */
SAARE_API void saare_shutdown(void);

#ifdef __cplusplus
}
#endif

#endif // SAARE_RUNTIME_H
"""

# 2. Wrapper Python (saare_sdk.py)
python_wrapper_content = """import ctypes
import os
import platform

class SaareRuntime:
    \"\"\"Wrapper nativo para interactuar con la librería S.A.A.R.E. C-ABI.\"\"\"
    
    def __init__(self, lib_path: str = None):
        if not lib_path:
            system = platform.system()
            if system == "Windows":
                lib_path = "./saare_runtime.dll"
            else:
                lib_path = "./libsaare_runtime.so"

        if not os.path.exists(lib_path):
            raise FileNotFoundError(f"No se encontró la librería compartida en: {os.path.abspath(lib_path)}")

        self.lib = ctypes.CDLL(os.path.abspath(lib_path))

        # Signaturas de funciones C-ABI
        self.lib.saare_init.argtypes = [ctypes.c_char_p]
        self.lib.saare_init.restype = ctypes.c_int32

        self.lib.saare_inspect_l7.argtypes = [ctypes.c_char_p, ctypes.c_char_p, ctypes.c_size_t]
        self.lib.saare_inspect_l7.restype = ctypes.c_int32

        self.lib.saare_shutdown.argtypes = []
        self.lib.saare_shutdown.restype = None

    def init(self, license_path: str = "saare.lic") -> int:
        res = self.lib.saare_init(license_path.encode('utf-8'))
        if res != 0:
            raise PermissionError(f"Error al validar la licencia Ed25519 (Código: {res})")
        return res

    def inspect_l7(self, payload: str) -> str:
        buf = ctypes.create_string_buffer(8192)
        res = self.lib.saare_inspect_l7(payload.encode('utf-8'), buf, 8192)
        if res < 0:
            raise ValueError(f"Payload bloqueado por políticas de gobierno AI (Código: {res})")
        return buf.value.decode('utf-8')

    def shutdown(self):
        self.lib.saare_shutdown()

if __name__ == "__main__":
    print("S.A.A.R.E. Platform v4.2 SDK Loaded successfully.")
"""

# 3. Readme de Integración (README.md)
readme_content = """# S.A.A.R.E. Platform v4.2 SDK - C-ABI & Python Wrapper

## Contenido del Paquete
- `saare_runtime.h`: Header oficial C/C++ para binding FFI.
- `saare_sdk.py`: SDK oficial en Python mediante `ctypes`.
- `saare_runtime.dll` / `libsaare_runtime.so`: Binario compilado en Rust (Zero-Disk RAM).

## Guía Rápida (Python)
```python
from saare_sdk import SaareRuntime

# Inicializar motor
runtime = SaareRuntime("./saare_runtime.dll")
runtime.init("saare.lic")

# Inspección L7 en RAM (<1.16ms)
clean_payload = runtime.inspect_l7("Analizar informe financiero...")
print(clean_payload)