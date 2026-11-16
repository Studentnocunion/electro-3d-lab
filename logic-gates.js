
/* ======================================
   LOGIC GATES SIMULATOR
====================================== */

const gateSelect = document.getElementById("gate-select");

const inputAButton = document.getElementById("input-a");
const inputBButton = document.getElementById("input-b");

const inputBContainer = document.getElementById("input-b-container");

const outputDisplay = document.getElementById("gate-output");
const explanation = document.getElementById("gate-explanation");

const resetButton = document.getElementById("logic-reset");

let inputA = 0;
let inputB = 0;


// Toggle Input A
inputAButton.addEventListener("click", () => {

    inputA = inputA === 0 ? 1 : 0;

    updateSimulator();

});


// Toggle Input B
inputBButton.addEventListener("click", () => {

    inputB = inputB === 0 ? 1 : 0;

    updateSimulator();

});


// Calculate Logic Gate Output
function calculateOutput(gate, a, b) {

    switch (gate) {

        case "AND":
            return a && b ? 1 : 0;

        case "OR":
            return a || b ? 1 : 0;

        case "NOT":
            return a === 0 ? 1 : 0;

        case "NAND":
            return a && b ? 0 : 1;

        case "NOR":
            return a || b ? 0 : 1;

        case "XOR":
            return a !== b ? 1 : 0;

        case "XNOR":
            return a === b ? 1 : 0;

        default:
            return 0;
    }

}


// Update Simulator
function updateSimulator() {

    const selectedGate = gateSelect.value;

    inputAButton.textContent = inputA;
    inputBButton.textContent = inputB;

    inputBContainer.style.display =
        selectedGate === "NOT" ? "none" : "block";

    const output = calculateOutput(
        selectedGate,
        inputA,
        inputB
    );

    outputDisplay.textContent = output;

    explanation.textContent =
        output === 1
            ? "Output is HIGH (Logic 1)."
            : "Output is LOW (Logic 0).";

}


// Change Gate
gateSelect.addEventListener("change", updateSimulator);


// Reset Inputs
resetButton.addEventListener("click", () => {

    inputA = 0;
    inputB = 0;

    updateSimulator();

});


// Initial Setup
updateSimulator();

// ======================================
// LOGIC GATES KNOWLEDGE TEST
// ======================================

window.checkLogicQuiz = function () {

    const answers = {
        lq1: "b",
        lq2: "c",
        lq3: "a",
        lq4: "c",
        lq5: "b"
    };

    let score = 0;
    let attempted = 0;

    for (const question in answers) {

        const selected = document.querySelector(
            `input[name="${question}"]:checked`
        );

        if (selected) {

            attempted++;

            if (selected.value === answers[question]) {
                score++;
            }

        }

    }

    document.getElementById("logic-quiz-result").textContent =
        `You scored ${score}/5. Attempted: ${attempted}/5.`;

};


window.resetLogicQuiz = function () {

    document.getElementById("logic-quiz-result").textContent =
        "Your result will appear here.";

};
