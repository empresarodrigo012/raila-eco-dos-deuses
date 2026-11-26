# Raila e os Ecos dos Deuses

## Executar localmente
```bash
pip install -r requirements.txt
python app.py
```
Abra http://127.0.0.1:5000

## Publicar no Render
1. Envie esta pasta para um repositório GitHub.
2. No Render, escolha New + > Web Service e conecte o repositório.
3. Configure:
   - Runtime: Python
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `gunicorn app:app`
4. Clique em Deploy. O Render fornecerá um endereço HTTPS público.

O jogo não precisa de banco de dados para funcionar. A rota `/api/recorde` apenas recebe e confirma a pontuação da partida.
