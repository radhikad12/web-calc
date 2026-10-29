
const display = document.getElementById("display");
const buttons = document.querySelectorAll(".buttons button");

let expression = "";

function updateDisplay() {
    display.value = expression || "0";
}

function calculate() {
    // Only allow numbers, operators, decimals and brackets.
    if (!/^[0-9+\-*/().\s]+$/.test(expression) || !expression) {
        display.value = "Error";
        expression = "";
        return;
    }

    // Convert the expression into tokens.
    const tokens = expression.match(
        /(?:\d+\.?\d*|\.\d+)|[()+\-*/]/g
    );

    if (!tokens || tokens.join("") !== expression.replace(/\s/g, "")) {
        display.value = "Error";
        expression = "";
        return;
    }

    let position = 0;

    function factor() {
        const token = tokens[position++];

        if (token === "+") return factor();
        if (token === "-") return -factor();

        if (token === "(") {
            const value = addSubtract();

            if (tokens[position++] !== ")") {
                throw new Error("Missing bracket");
            }

            return value;
        }

        if (token !== undefined && !isNaN(Number(token))) {
            return Number(token);
        }

        throw new Error("Invalid number");
    }

    function multiplyDivide() {
        let value = factor();

        while (tokens[position] === "*" || tokens[position] === "/") {
            const operator = tokens[position++];
            const next = factor();

            if (operator === "/" && next === 0) {
                throw new Error("Cannot divide by zero");
            }

            value = operator === "*" ? value * next : value / next;
        }

        return value;
    }

    function addSubtract() {
        let value = multiplyDivide();

        while (tokens[position] === "+" || tokens[position] === "-") {
            const operator = tokens[position++];
            const next = multiplyDivide();

            value = operator === "+" ? value + next : value - next;
        }

        return value;
    }

    try {
        const answer = addSubtract();

        if (position !== tokens.length || !Number.isFinite(answer)) {
            throw new Error("Invalid expression");
        }

        expression = String(
            Math.round((answer + Number.EPSILON) * 1e10) / 1e10
        );

        updateDisplay();
    } catch (error) {
        expression = "";
        display.value = "Error";
    }
}

function handleInput(value) {
    if (value === "C") {
        expression = "";
        updateDisplay();
        return;
    }

    if (value === "DEL") {
        expression = expression.slice(0, -1);
        updateDisplay();
        return;
    }

    if (value === "=") {
        calculate();
        return;
    }

    if (display.value === "Error") {
        expression = "";
    }

    expression += value;
    updateDisplay();
}

// Mouse clicks
buttons.forEach(function (button) {
    button.addEventListener("click", function () {
        handleInput(button.dataset.value);
    });
});

// Keyboard input
document.addEventListener("keydown", function (event) {
    const key = event.key;

    if (/^[0-9.+\-*/()]$/.test(key)) {
        handleInput(key);
    } else if (key === "Enter" || key === "=") {
        handleInput("=");
    } else if (key === "Backspace") {
        handleInput("DEL");
    } else if (key === "Escape" || key === "Delete") {
        handleInput("C");
    } else {
        return;
    }

    event.preventDefault();
});

updateDisplay();
