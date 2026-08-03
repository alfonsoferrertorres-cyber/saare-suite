import ctypes
import os

class SaareSDK:
    def __init__(self, dll_path="saare_runtime.dll"):
        if not os.path.exists(dll_path):
            raise FileNotFoundError(f"No se encontró la librería nativa en {dll_path}")
        self.lib = ctypes.CDLL(os.path.abspath(dll_path))
        self.lib.saare_verify_and_dispatch.argtypes = [ctypes.c_char_p, ctypes.c_char_p, ctypes.c_char_p]
        self.lib.saare_verify_and_dispatch.restype = ctypes.c_int32

    def dispatch(self, module: str, preset: str, license_token: str = "") -> int:
        return self.lib.saare_verify_and_dispatch(
            module.encode('utf-8'),
            preset.encode('utf-8'),
            license_token.encode('utf-8') if license_token else None
        )

if __name__ == "__main__":
    sdk = SaareSDK("../bin/saare_runtime.dll")
    result = sdk.dispatch("01_perimetershield", "banking-shield")
    print(f"[SDK PYTHON] Resultado de dispatch: {result} (0 = OK)")
