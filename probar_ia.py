import requests

# 1. La dirección de tu proxy S.A.A.R.E. que configuramos en Cloudflare
url = "https://api.saare.es/v1/chat/completions"

# 2. Tus datos de identificación corporativa para la auditoría
headers = {
    "Content-Type": "application/json",
    "x-saare-tenant": "ORGANISMO_DEMO_01",
    "x-saare-user": "alfonsoferrertorres@gmail.com"
}

# 3. El mensaje que quieres enviarle a la IA
prompt_usuario = input("Escribe tu pregunta para la IA: ")

payload = {
    "provider": "GEMINI",
    "model": "gemini-1.5-pro",
    "messages": [
        {"role": "user", "content": prompt_usuario}
    ]
}

print("\nEnviando mensaje a través del sistema S.A.A.R.E. (Capa 7)...")

try:
    # Hacemos la petición a tu Worker
    response = requests.post(url, json=payload, headers=headers)
    
    if response.status_code == 200:
        data = response.json()
        print("\n--- RESPUESTA DE LA IA ---")
        print(data["choices"][0]["message"]["content"])
        print("\n[✔] ¡Mensaje interceptado y registrado correctamente en tu consola!")
    else:
        print(f"\n[X] Error del servidor: {response.status_code}")
        print(response.text)

except Exception as e:
    print(f"\n[X] Error de conexión: {e}")