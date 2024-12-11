let processes = [];
let executionTimes = [];
let priorities = [];
let algorithm = "roundRobin";

function updateAlgorithmForm() {
  algorithm = document.getElementById("algorithmSelect").value;
  addProcesses();
}

function addProcesses() {
  const numProcesses = document.getElementById("numProcesses").value;
  processes = [];
  executionTimes = [];
  priorities = [];
  const processData = document.getElementById("processData");
  processData.innerHTML = "";

  for (let i = 0; i < numProcesses; i++) {
    processData.innerHTML += `
      <label>Nume proces ${i + 1}:</label>
      <input type="text" id="processName-${i}" placeholder="Introduceți numele procesului">
      <label>Timp de execuție:</label>
      <input type="number" id="processTime-${i}" placeholder="Introduceți timpul de execuție">
    `;
    if (algorithm === "priority") {
      processData.innerHTML += `
        <label>Prioritate (1-10):</label>
        <input type="number" id="processPriority-${i}" min="1" max="10" placeholder="Introduceți prioritatea">
      `;
    }
  }
}

function calculate() {
  const numProcesses = document.getElementById("numProcesses").value;
  processes = [];
  executionTimes = [];
  priorities = [];

  for (let i = 0; i < numProcesses; i++) {
    const processName = document.getElementById(`processName-${i}`).value;
    const processTime = document.getElementById(`processTime-${i}`).value;
    processes.push(processName);
    executionTimes.push(parseInt(processTime));
    if (algorithm === "priority") {
      const priority = document.getElementById(
        `processPriority-${i}`
      ).value;
      priorities.push(parseInt(priority));
    }
  }

  let result;
  if (algorithm === "roundRobin") {
    const quantum = parseInt(prompt("Introduceți cuantul de timp (K):"));
    result = roundRobin(processes, executionTimes, quantum);
  } else if (algorithm === "priority") {
    result = priorityScheduling(processes, executionTimes, priorities);
  }

  displayResults(result);
}

function roundRobin(processes, executionTimes, quantum) {
  let remainingTimes = [...executionTimes];
  let completionTimes = Array(processes.length).fill(0);
  let currentTime = 0;
  let executionOrder = [];
  let queue = Array.from(Array(processes.length).keys());

  while (remainingTimes.some((rt) => rt > 0)) {
    const processIndex = queue.shift();
    const execTime = Math.min(quantum, remainingTimes[processIndex]);
    currentTime += execTime;
    remainingTimes[processIndex] -= execTime;
    executionOrder.push({ process: processes[processIndex], execTime });

    if (remainingTimes[processIndex] > 0) {
      queue.push(processIndex);
    } else {
      completionTimes[processIndex] = currentTime;
    }
  }

  const averageResponseTime =
    executionTimes.reduce((a, b) => a + b, 0) / processes.length;
  const weightedTurnaroundTime =
    executionOrder.reduce(
      (sum, { execTime }, i) =>
        sum + (executionOrder.length - i) * execTime,
      0
    ) / executionOrder.length;

  return {
    executionOrder,
    completionTimes,
    averageResponseTime,
    weightedTurnaroundTime,
  };
}

function priorityScheduling(processes, executionTimes, priorities) {
  let sortedProcesses = sortedProcessesByPriority(
    processes,
    executionTimes,
    priorities
  );
  let executionOrder = [];
  let currentTime = 0;
  let weightedSum = 0;

  sortedProcesses.forEach(([process, execTime, priority], i) => {
    executionOrder.push({ process, execTime, priority });
    weightedSum += (sortedProcesses.length - i) * execTime;
  });

  const averageResponseTime =
    executionTimes.reduce((a, b) => a + b, 0) / processes.length;
  const averageTurnaroundTime = weightedSum / processes.length;

  return {
    executionOrder,
    averageResponseTime,
    averageTurnaroundTime,
  };
}

function sortedProcessesByPriority(
  processes,
  executionTimes,
  priorities
) {
  return processes
    .map((process, i) => [process, executionTimes[i], priorities[i]])
    .sort((a, b) => b[2] - a[2]);
}

function displayResults({
  executionOrder,
  completionTimes,
  averageResponseTime,
  weightedTurnaroundTime,
}) {
  const outputSection = document.getElementById("output-section");
  const executionOrderDiv = document.getElementById("execution-order");
  const completionTimesDiv = document.getElementById("completion-times");
  const averagesDiv = document.getElementById("averages");

  outputSection.style.display = "block";

  executionOrderDiv.innerHTML = "<h3>Ordinea de execuție:</h3>";
  executionOrder.forEach(({ process, execTime }) => {
    executionOrderDiv.innerHTML += `<p>${process}: ${execTime} unități</p>`;
  });

  if (completionTimes) {
    completionTimesDiv.innerHTML = "<h3>Timpii de finalizare:</h3>";
    processes.forEach((process, i) => {
      completionTimesDiv.innerHTML += `<p>${process}: ${completionTimes[i]} unități</p>`;
    });
  }

  averagesDiv.innerHTML = `
    <h3>Medii:</h3>
    <p>Timp mediu de răspuns: ${averageResponseTime.toFixed(
      2
    )} unități</p>
    ${
      weightedTurnaroundTime
        ? `<p>Timp mediu de rulare (Weighted Turnaround Time): ${weightedTurnaroundTime.toFixed(
            2
          )} unități</p>`
        : ""
    }
  `;
}
