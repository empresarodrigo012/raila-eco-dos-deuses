# Princesinha Raila: O Segredo da Coroa

Jogo de plataforma em Flask, HTML, CSS e JavaScript. Ajude a Princesinha Raila a atravessar as ruínas de Roma e recuperar a coroa no Templo Antigo.

## Estrutura

- `app.py`
- `requirements.txt`
- `templates/index.html`
- `static/style.css`
- `static/game.js`

## Executar localmente

```bash
pip install -r requirements.txt
python app.py
```

Abra `http://127.0.0.1:5000` no navegador.

## Publicar no Render

- Build Command: `pip install -r requirements.txt`
- Start Command: `gunicorn app:app --bind 0.0.0.0:$PORT`

No celular, jogue com a tela na horizontal. Use os botões ◀ e ▶ para andar e segure PULAR para saltar.
