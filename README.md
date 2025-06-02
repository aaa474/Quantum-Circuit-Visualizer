**Quantum Circuit Visualizer:**

This project is a web-based quantum simulator that lets you build, edit, and simulate quantum circuits interactively. It combines classical frontend development with quantum computing concepts using Qiskit as the simulation backend.

**Features:**

-  Drag-and-drop interface for building quantum circuits
-  Support for single-qubit gates (H, X, Y, Z, S, T), rotation gates (RX, RY, RZ), and control gates (CX, CZ)
-  Backend integration with Flask + Qiskit for quantum state simulation
-  Measurement results displayed as bar charts
-  Bloch sphere visualization for single-qubit states
-  JSON download of circuit data
-  Responsive, modern UI with color-coded gates

**Layers:**          **Technology**

Frontend: HTML, CSS, Javascript (vanilla)

Backend: Flask, Python, Qiskit

Visualization: Chart.js (Bar chart), Qiskit (Bloch sphere)

Version Control: Git, Github

**Project Layout**

quantum-visualizer
- backend
  - app.py
  - quantum_logic.py
  - requirements.txt
  - test.json
- frontend
  - index.html
  - script.js
  - style.css
- README.md

**How to test:**
  Clone the repository: 
  ```bash
    git clone https://github.com/your-username/Quantum-Circuit-Visualizer.git
    cd Quantum-Circuit-Visualizer

  Set up the Python virtual environment:
    python -m venv venv
    source venv/bin/activate #for Windows, use venv\Scripts\activate

  Install Dependencies:
    pip install -r requirements.txt

  Run Flask:
    python app.py

**Try using an example circuit below:**

  H gate on Qubit 0
  CX gate with Qubit 0 as control, Qubit 1 as target
  RX gate on Qubit 1 with theta = 1.57


**NOTE:**

There is still a lot more stuff I want to add for this project in the future including better visuals, 3D models, and certain functions to make this website more efficient and user-friendly so they can use it to learn more about quantum computing. I'll update this README file with any new updates in an update log below moving forward!
