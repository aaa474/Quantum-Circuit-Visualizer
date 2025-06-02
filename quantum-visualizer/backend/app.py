from flask import Flask, request, jsonify
from flask_cors import CORS
from quantum_logic import simulate_circuit
import base64

app = Flask(__name__)
CORS(app)

@app.route('/simulate', methods=['POST'])
def simulate():
    data = request.get_json()
    result = simulate_circuit(data)
    return jsonify(result)

if __name__ == '__main__':
    app.run(debug=True)

