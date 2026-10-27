import requests

url = "https://api.saare.es/v1/chat/completions"
headers = {
    "Content-Type": "application/json",
    "x-saare-tenant": "ORGANISMO_DEMO_01",
    "x-saare-user": "alfonsoferrertorres@gmail.com"
}

print("==================================================")
print("🛡️ CHAT SEGURO S.A.A.R.E. (Conectado a tu Consola)")
print("Escribe 'salir' para terminar la conversación.")
print("==================================================\n")

while True:
    prompt_usuario = input("Tú: ")
    if prompt_usuario.lower() == "salir":
        print("Cerrando sesión de chat seguro...")
        break
    
    payload = {
        "provider": "GEMINI",
        "model": "gemini-1.5-pro",
        "messages": [
            {"role": "user", "content": prompt_usuario}
        ]
    }

    try:
        response = requests.post(url, json=payload, headers=headers)
        
        if response.status_code == 200:
            data = response.json()
            respuesta_ia = data["choices"][0]["message"]["content"]
            print(f"\nIA: {respuesta_ia}")
            print("[✔ Registrado en console.saare.es]\n")
        else:
            print(f"\n[X] Error de interceptación L7: {response.status_code}\n")

    except Exception as e:
        print(f"\n[X] Error de red: {e}\n")