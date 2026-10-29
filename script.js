
const display = document.getElementById("display");
const buttons = document.querySelector(".buttons");

let expression = "";
let finished = false;

// Update the calculator display
function updateDisplay() {
    display.value = expression;
}

// Clear everything
function clearCalculator() {
    expression = "";
    finished = false;
    updateDisplay();
}

// Delete the last character
function deleteLast() {
    expression = expression.slice(0, -1);
    finished = false;
    updateDisplay();
}

// Add a number or operator
function addValue(value) {
    if (finished) {
        if ("0123456789.(".includes(value)) {
            expression = "";
        }
        finished = false;
    }

    expression += value;
    updateDisplay();
}

// Calculate using a safe arithmetic parser
function calculate(expressionText) {
    const tokens = expressionText.replace(/\s/g, "").match(
        /(?:\d+\.?\d*|\.\d+)|[()+*/-]/g
    );

    if (!tokens || tokens.join("") !== expressionText.replace(/\s/g, "")) {
        throw new Error("Invalid expression");
    }

    let position = 0;

    function parseExpression() {
        let result = parseTerm();

        while (tokens[position] === "+" || tokens[position] === "-") {
            const operator = tokens[position++];
            const next = parseTerm();

            result = operator === "+"
                ? result + next
                : result - next;
        }

        return result;
    }

    function parseTerm() {
        let result = parseFactor();

        while (tokens[position] === "*" || tokens[position] === "/") {
            const operator = tokens[position++];
            const next = parseFactor();

            if (operator === "/" && next === 0) {
                throw new Error("Cannot divide by zero");
            }

            result = operator === "*"
                ? result * next
                : result / next;
        }

        return result;
    }

    function parseFactor() {
        const token = tokens[position];

        if (token === "+") {
            position++;
            return parseFactor();
        }

        if (token === "-") {
            position++;
            return -parseFactor();
        }

        if (token === "(") {
            position++;
            const result = parseExpression();

            if (tokens[position] !== ")") {
                throw new Error("Missing closing bracket");
            }

            position++;
            return result;
        }

        if (token !== undefined && /^\d*\.?\d+$|^\d+\.?$/.test(token)) {
            position++;
            return Number(token);
        }

        throw new Error("Invalid expression");
    }

    const result = parseExpression();

    if (position !== tokens.length || !Number.isFinite(result)) {
        throw new Error("Invalid calculation");
    }

    return Number(result.toPrecision(12)).toString();
}

// Calculate the answer
function showResult() {
    if (!expression.trim()) return;

    try {
        expression = calculate(expression);
        finished = true;
        updateDisplay();
    } catch (error) {
        display.value = error.message === "Cannot divide by zero"
            ? "Cannot divide by 0"
            : "Invalid expression";

        expression = "";
        finished = true;
    }
}

// Handle button clicks
buttons.addEventListener("click", function (event) {
    const button = event.target.closest("button");

    if (!button) return;

    if (button.dataset.action === "clear") {
        clearCalculator();
    } else if (button.dataset.action === "delete") {
        deleteLast();
    } else if (button.dataset.action === "calculate") {
        showResult();
    } else if (button.dataset.value !== undefined) {
        addValue(button.dataset.value);
    }
});

// Handle keyboard input
document.addEventListener("keydown", function (event) {
    const key = event.key;

    if (/^[0-9.]$/.test(key)) {
        addValue(key);
    } else if (["+", "-", "*", "/", "(", ")"].includes(key)) {
        addValue(key);
    } else if (key === "Enter" || key === "=") {
        event.preventDefault();
        showResult();
    } else if (key === "Backspace") {
        deleteLast();
    } else if (key === "Escape" || key === "Delete") {
        clearCalculator();
    }
});

// Start with an empty display
updateDisplay();
