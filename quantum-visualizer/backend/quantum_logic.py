from qiskit import QuantumCircuit
from qiskit_aer import Aer
from qiskit.visualization import plot_bloch_vector
from qiskit.quantum_info import Statevector
import numpy as np
import io
import base64

def get_bloch_sphere(statevector):
    bloch_coords = [
        np.real(2 * np.conj(statevector[0]) * statevector[1]),
        np.imag(2 * np.conj(statevector[0]) * statevector[1]),
        np.abs(statevector[0])**2 - np.abs(statevector[1])**2
    ]
    fig = plot_bloch_vector(bloch_coords)
    buf = io.BytesIO()
    fig.savefig(buf, format='png')
    buf.seek(0)
    encoded = base64.b64encode(buf.read()).decode('utf-8')
    return encoded

def simulate_circuit(data):
    gates = data.get("gates", [])
    num_qubits = data.get("num_qubits", 1)

    if not isinstance(num_qubits, int) or num_qubits < 1:
        raise ValueError("Invalid number of qubits.")

    qc = QuantumCircuit(num_qubits)
    
    
    for gate in gates:
        name = gate.get("name")
        target = gate.get("target")
        control = gate.get("control")
        theta = gate.get("theta")

        if target is None or target >= num_qubits:
            raise ValueError(f"Invalid target qubit: {target}")

        if name == "h":
            qc.h(target)
        elif name == "x":
            qc.x(target)
        elif name == "y":
            qc.y(target)
        elif name == "z":
            qc.z(target)
        elif name == "s":
            qc.s(target)
        elif name == "t":
            qc.t(target)
        elif name == "cx":
            if control is None or control >= num_qubits:
                raise ValueError(f"Invalid control qubit: {control}")
            qc.cx(control, target)
        elif name == "cz":
            if control is None or control >= num_qubits:
                raise ValueError(f"Invalid control qubit: {control}")
            qc.cz(control, target)
        elif name == "rx":
            if theta is None:
                raise ValueError("Theta value required for RX gate.")
            qc.rx(theta, target)
        elif name == "ry":
            if theta is None:
                raise ValueError("Theta value required for RY gate.")
            qc.ry(theta, target)
        elif name == "rz":
            if theta is None:
                raise ValueError("Theta value required for RZ gate.")
            qc.rz(theta, target)

    qc.measure_all()

    backend = Aer.get_backend("qasm_simulator")
    job = backend.run(qc, shots=1024)
    result = job.result()
    counts = result.get_counts()

    response = {"counts": counts}

    
    if num_qubits == 1:
        state = Statevector.from_instruction(qc.remove_final_measurements(inplace=False))
        response["bloch_sphere"] = get_bloch_sphere(state.data)

    return response
