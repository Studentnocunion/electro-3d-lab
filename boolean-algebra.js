
function simplifyBooleanExpression() {

    const expression = document.getElementById("boolean-expression").value;

    const result = document.getElementById("boolean-result");
    const law = document.getElementById("boolean-law");

    const solutions = {
        "1": ["A", "Idempotent Law"],
        "2": ["A", "Idempotent Law"],
        "3": ["A", "Identity Law"],
        "4": ["A", "Identity Law"],
        "5": ["1", "Complement Law"],
        "6": ["0", "Complement Law"],
        "7": ["A", "Absorption Law"],
        "8": ["A̅ + B̅", "De Morgan's First Theorem"],
        "9": ["A̅ · B̅", "De Morgan's Second Theorem"]
    };

    if (expression === "") {
        result.textContent = "Please select an expression first.";
        law.textContent = "";
        return;
    }

    result.textContent = solutions[expression][0];
    law.textContent = "Law Applied: " + solutions[expression][1];
}

// ======================================
// BOOLEAN ALGEBRA KNOWLEDGE TEST
// ======================================

window.checkBooleanQuiz = function () {

    const answers = {
        bq1: "a",
        bq2: "b",
        bq3: "c",
        bq4: "c",
        bq5: "b"
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

    document.getElementById("boolean-quiz-result").textContent =
        `You scored ${score}/5. Attempted: ${attempted}/5.`;
};


window.resetBooleanQuiz = function () {

    document.getElementById("boolean-quiz").reset();

    document.getElementById("boolean-quiz-result").textContent =
        "Your result will appear here.";
};
