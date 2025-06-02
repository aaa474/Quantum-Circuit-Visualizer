let chart;
let gates = [];
let selectedGateIndex = null;

function renderCircuit() {
  const outputDiv = document.getElementById('circuitOutput');
  outputDiv.innerHTML = '';

  const visualDiv = document.getElementById('visualCircuit');
  visualDiv.innerHTML = '';

  const numQubits = parseInt(document.getElementById('numQubits').value);
  const numCols = Math.max(gates.length, 1);
  for (let t = 0; t < numCols; t++) {
  if (!gates[t]) gates[t] = [];
  }


  visualDiv.style.display = 'grid';
  visualDiv.style.gridTemplateColumns = `100px repeat(${numCols}, 80px)`;
  visualDiv.style.gap = '5px';
  visualDiv.style.alignItems = 'center';
  visualDiv.style.marginTop = '15px';
  visualDiv.style.border = '1px solid #ccc';
  visualDiv.style.padding = '10px';
  visualDiv.style.borderRadius = '5px';
  visualDiv.style.background = '#f9f9f9';
  visualDiv.style.position = 'relative';

  let tooltip = document.getElementById('tooltip');
  if (!tooltip) {
    tooltip = document.createElement('div');
    tooltip.id = 'tooltip';
    tooltip.style.position = 'absolute';
    tooltip.style.padding = '6px 10px';
    tooltip.style.background = 'rgba(0,0,0,0.85)';
    tooltip.style.color = 'white';
    tooltip.style.borderRadius = '4px';
    tooltip.style.fontSize = '12px';
    tooltip.style.pointerEvents = 'none';
    tooltip.classList.remove('show');
    tooltip.style.zIndex = '10';
    document.body.appendChild(tooltip);
  }

  let editForm = document.getElementById('editForm');
  if (!editForm) {
    editForm = document.createElement('div');
    editForm.id = 'editForm';
    editForm.style.position = 'absolute';
    editForm.style.background = 'white';
    editForm.style.border = '1px solid #ccc';
    editForm.style.padding = '10px';
    editForm.style.borderRadius = '5px';
    editForm.style.boxShadow = '0 2px 8px rgba(0,0,0,0.2)';
    editForm.style.zIndex = '20';
    editForm.style.display = 'none';
    editForm.innerHTML = `
      <label>Gate: <input id="editGateType" style="width:60px"></label><br>
      <label>Target: <input id="editTargetQubit" type="number" style="width:40px"></label><br>
      <label>Control: <input id="editControlQubit" type="number" style="width:40px"></label><br>
      <label>Theta: <input id="editTheta" type="number" step="0.01" style="width:60px"></label><br>
      <button id="saveEdit">Save</button>
      <button id="cancelEdit">Cancel</button>
    `;
    document.body.appendChild(editForm);
  }

  document.getElementById('cancelEdit').onclick = () => {
    editForm.style.display = 'none';
  };

  const headerEmpty = document.createElement('div');
  visualDiv.appendChild(headerEmpty);

  for (let i = 0; i < numCols; i++) {
    const step = document.createElement('div');
    step.textContent = `T${i}`;
    step.style.fontWeight = 'bold';
    step.style.textAlign = 'center';
    visualDiv.appendChild(step);
  }

  for (let q = 0; q < numQubits; q++) {
    const qubitLabel = document.createElement('div');
    qubitLabel.textContent = `Qubit ${q}`;
    qubitLabel.style.fontWeight = 'bold';
    qubitLabel.style.textAlign = 'right';
    visualDiv.appendChild(qubitLabel);

    for (let t = 0; t < numCols; t++) {
      const cell = document.createElement('div');
      cell.dataset.qubit = q;
      cell.dataset.timestep = t;
      cell.style.textAlign = 'center';
      cell.style.minHeight = '25px';
      visualDiv.appendChild(cell);

      const gatesAtTimestep = gates[t] || [];
      gatesAtTimestep.forEach((gate, gateIndex) => {
        if (gate.target === q || gate.control === q) {
          const gateDiv = document.createElement('div');
          gateDiv.textContent = `${gate.name.toUpperCase()} (${t})`;
          gateDiv.classList.add('gate', gate.name);
          gateDiv.dataset.gate = gate.name;  
          gateDiv.style.cursor = 'grab';
          gateDiv.setAttribute('draggable', 'true');
          gateDiv.dataset.index = `${t}-${gateIndex}`;

          gateDiv.addEventListener('dragstart', (e) => {
            selectedGateIndex = { t, gateIndex };
            e.dataTransfer.effectAllowed = 'move';
          });

          gateDiv.addEventListener('mouseover', (e) => {
            tooltip.textContent = `${gate.name.toUpperCase()} (Target: Q${gate.target}${gate.control !== undefined ? ', Control: Q' + gate.control : ''}${gate.theta !== undefined ? ', θ=' + gate.theta : ''})`;
            tooltip.style.left = `${e.pageX + 10}px`;
            tooltip.style.top = `${e.pageY + 10}px`;
            tooltip.classList.add('show');
          });
          gateDiv.addEventListener('mousemove', (e) => {
            tooltip.style.left = `${e.pageX + 10}px`;
            tooltip.style.top = `${e.pageY + 10}px`;
          });
          gateDiv.addEventListener('mouseout', () => {
            tooltip.classList.remove('show');
          });

          gateDiv.addEventListener('click', (e) => {
            e.stopPropagation();
            editForm.style.display = 'block';
            editForm.style.left = `${e.pageX + 10}px`;
            editForm.style.top = `${e.pageY + 10}px`;
            document.getElementById('editGateType').value = gate.name;
            document.getElementById('editTargetQubit').value = gate.target;
            document.getElementById('editControlQubit').value = gate.control ?? '';
            document.getElementById('editTheta').value = gate.theta ?? '';
            editForm.dataset.index = `${t}-${gateIndex}`;
          });

          cell.appendChild(gateDiv);
        }
      });
    }
  }

  let svg = document.getElementById('connectionLines');
  if (!svg) {
    svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute('id', 'connectionLines');
    svg.style.position = 'absolute';
    svg.style.top = '0';
    svg.style.left = '0';
    svg.style.width = '100%';
    svg.style.height = '100%';
    svg.style.pointerEvents = 'none';
    visualDiv.parentElement.appendChild(svg);
  }
  svg.innerHTML = '';

  const grid = visualDiv.getBoundingClientRect();
  gates.forEach((gateList, t) => {
    gateList.forEach((gate) => {
      if (gate.name === 'cx' || gate.name === 'cz') {
        const targetCell = visualDiv.querySelector(`div[data-qubit="${gate.target}"][data-timestep="${t}"] div.gate`);
        const controlCell = visualDiv.querySelector(`div[data-qubit="${gate.control}"][data-timestep="${t}"] div.gate`);
        if (targetCell && controlCell) {
          const targetRect = targetCell.getBoundingClientRect();
          const controlRect = controlCell.getBoundingClientRect();
          const x = (controlRect.left + controlRect.right) / 2 - grid.left;
          const y1 = controlRect.top + controlRect.height / 2 - grid.top;
          const y2 = targetRect.top + targetRect.height / 2 - grid.top;
          const midY = (y1 + y2) / 2;

          const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
          path.setAttribute("d", `M${x},${y1} C${x + 10},${midY} ${x - 10},${midY} ${x},${y2}`);
          path.setAttribute("fill", "none");
          path.setAttribute("stroke", gate.name === 'cx' ? 'red' : 'blue');
          path.setAttribute("stroke-width", "2");
          path.classList.add(gate.name);
          path.style.transition = "stroke-dashoffset 1s ease-out";
          path.style.strokeDasharray = "100";
          path.style.strokeDashoffset = "100";
          setTimeout(() => path.style.strokeDashoffset = "0", 50);
          svg.appendChild(path);
        }
      }
    });
  });

  outputDiv.textContent = '';
  gates.forEach((gateList, t) => {
    gateList.forEach((gate, gateIndex) => {
      const gateDiv = document.createElement('div');
      gateDiv.textContent = JSON.stringify(gate);
      const deleteButton = document.createElement('button');
      deleteButton.textContent = 'Delete';
      deleteButton.style.marginLeft = '10px';
      deleteButton.addEventListener('click', () => {
        gates[t].splice(gateIndex, 1);
        if (gates[t].length === 0) gates.splice(t, 1);
        renderCircuit();
      });
      gateDiv.appendChild(deleteButton);
      outputDiv.appendChild(gateDiv);
    });
  });

  document.getElementById('saveEdit').onclick = () => {
    const [t, gateIndex] = editForm.dataset.index.split('-').map(Number);
    const g = gates[t][gateIndex];
    const gateType = document.getElementById('editGateType').value.toLowerCase();
    if (!['h', 'x', 'y', 'z', 's', 't', 'rx', 'ry', 'rz', 'cx', 'cz'].includes(gateType)) {
      alert('Invalid gate type!');
      return;
    }
    g.name = gateType;
    g.target = parseInt(document.getElementById('editTargetQubit').value);
    g.control = (['cx', 'cz'].includes(g.name)) ? parseInt(document.getElementById('editControlQubit').value) : undefined;
    g.theta = (['rx', 'ry', 'rz'].includes(g.name)) ? parseFloat(document.getElementById('editTheta').value) : undefined;
    editForm.style.display = 'none';
    renderCircuit();
  };
}



document.querySelectorAll('.draggable-gate').forEach(button => {
  button.addEventListener('dragstart', (e) => {
    e.dataTransfer.setData('text/plain', button.dataset.gate);
  });
});


function makeCircuitDroppable() {
  const cells = document.querySelectorAll('#visualCircuit > div');

  cells.forEach(cell => {
    if (!cell.dataset.qubit) return; 

    cell.addEventListener('dragover', (e) => {
      e.preventDefault();
      cell.classList.add('drag-hover');
    });

    cell.addEventListener('dragleave', (e) => {
      e.preventDefault();
      cell.classList.remove('drag-hover');
    });

    cell.addEventListener('drop', (e) => {
      e.preventDefault();
      cell.classList.remove('drag-hover');

      const gateType = e.dataTransfer.getData('text/plain');
      const row = parseInt(cell.dataset.qubit);
      const col = parseInt(cell.dataset.timestep); 

      if (!isNaN(row) && !isNaN(col)) {
        if (selectedGateIndex !== null) {
          gates[selectedGateIndex].target = row;

          if (["cx", "cz"].includes(gates[selectedGateIndex].name)) {
            const control = prompt(`Enter control qubit for ${gates[selectedGateIndex].name.toUpperCase()} (default 0):`, row === 0 ? 1 : 0);
            gates[selectedGateIndex].control = parseInt(control) || 0;
          }

          selectedGateIndex = null;
        } else {
          let gate = { name: gateType, target: row };

          if (["cx", "cz"].includes(gateType)) {
            const control = prompt(`Enter control qubit for ${gateType.toUpperCase()} (default 0):`, row === 0 ? 1 : 0);
            gate.control = parseInt(control) || 0;
          }

          if (["rx", "ry", "rz"].includes(gateType)) {
            const theta = prompt(`Enter theta value for ${gateType.toUpperCase()}:`, "3.14");
            gate.theta = parseFloat(theta) || 0;
          }

          if (!gates[col]) gates[col] = [];
          gates[col].push(gate);
        }

        renderCircuit();
      }
    });
  });
}

renderCircuit = (function (originalRender) {
  return function () {
    originalRender.apply(this, arguments);
    makeCircuitDroppable();
  };
})(renderCircuit);

document.getElementById('addGate').addEventListener('click', () => {
  const gateType = document.getElementById('gateType').value;
  const targetQubit = document.getElementById('targetQubit').value;
  const controlQubit = document.getElementById('controlQubit').value;
  const thetaValue = document.getElementById('thetaValue').value;

  if (targetQubit === "") {
    alert("Please enter a target qubit!");
    return;
  }

  if ((gateType === "cx" || gateType === "cz") && controlQubit === "") {
    alert("Please enter a control qubit for " + gateType + " gate!");
    return;
  }

  if (["rx", "ry", "rz"].includes(gateType) && thetaValue === "") {
    alert("Please enter a theta value for " + gateType + " gate!");
    return;
  }

  let gate = { name: gateType, target: parseInt(targetQubit) };

  if (gateType === "cx" || gateType === "cz") {
    gate.control = parseInt(controlQubit);
  }

  if (["rx", "ry", "rz"].includes(gateType)) {
    gate.theta = parseFloat(thetaValue);
  }

  const timeStep = gates.length;  
  gates[timeStep] = gates[timeStep] || [];
  gates[timeStep].push(gate);

  renderCircuit();

  document.getElementById('targetQubit').value = '';
  document.getElementById('controlQubit').value = '';
  document.getElementById('thetaValue').value = '';
});

document.getElementById('resetCircuit').addEventListener('click', () => {
  gates = [];
  renderCircuit();
  if (chart) chart.destroy();
  document.getElementById('output').textContent = '';
});

document.getElementById('runSimulation').addEventListener('click', () => {
  const numQubits = parseInt(document.getElementById('numQubits').value);
  const flattenedGates = gates.flat();
  const circuitData = { num_qubits: numQubits, gates: flattenedGates };

  fetch('http://127.0.0.1:5000/simulate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(circuitData)
  })
  .then(response => response.json())
  .then(data => {
    document.getElementById('output').textContent = JSON.stringify(data, null, 2);

    const labels = Object.keys(data.counts);
    const values = Object.values(data.counts);

    if (chart) chart.destroy();
    const ctx = document.getElementById('resultChart').getContext('2d');
    chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Measurement Counts',
          data: values,
          backgroundColor: 'rgba(75, 192, 192, 0.5)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1
        }]
      },
      options: { scales: { y: { beginAtZero: true } } }
    });

    
    const blochContainer = document.getElementById('blochContainer') || document.createElement('div');
    blochContainer.id = 'blochContainer';
    blochContainer.innerHTML = ''; 

    if (data.bloch_sphere) {
      const blochImg = document.createElement('img');
      blochImg.src = `data:image/png;base64,${data.bloch_sphere}`;
      blochImg.alt = "Bloch Sphere";
      blochImg.style.marginTop = "10px";
      blochImg.style.maxWidth = "300px";
      blochImg.style.border = "1px solid #ccc";
      blochImg.style.borderRadius = "8px";
      blochContainer.appendChild(blochImg);
    }

    document.getElementById('output').appendChild(blochContainer);
  })
  .catch(error => console.error('Error:', error));
});

document.getElementById('downloadCircuit').addEventListener('click', () => {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(gates, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", "circuit.json");
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
});

document.getElementById('uploadCircuit').addEventListener('change', (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    gates = JSON.parse(e.target.result);
    renderCircuit();
  };
  reader.readAsText(file);
});

renderCircuit();
