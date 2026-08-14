from openai import OpenAI

# Redirige la llamada al proxy local de SAARE (puerto 3002)
client = OpenAI(
    base_url="http://localhost:3002/v1",
    api_key="sk-saare-test-token"
)

try:
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {"role": "user", "content": "PROMPT DE PRUEBA DESDE SDK PYTHON OPENAI"}
        ]
    )
except Exception as e:
    print("Interceptado por SAARE:", e)
