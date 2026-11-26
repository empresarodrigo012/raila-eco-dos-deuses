from flask import Flask, render_template, jsonify, request
import os

app = Flask(__name__)

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/api/recorde", methods=["POST"])
def recorde():
    data = request.get_json(silent=True) or {}
    nome = str(data.get("nome", "Raila"))[:24]
    pontos = max(0, min(int(data.get("pontos", 0)), 999999))
    # O jogo funciona sem banco de dados; esta rota confirma o resultado da partida.
    return jsonify({"ok": True, "mensagem": f"Que os deuses celebrem, {nome}!", "pontos": pontos})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
