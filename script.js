
$(document).ready(function () {

    let expression = "";

    // Update the calculator display
    function updateDisplay() {
        $("#display").val(expression || "0");
    }

    // Handle calculator button clicks
    $(".buttons button").click(function () {

        let value = $(this).data("value");

        // Clear everything
        if (value === "C") {
            expression = "";
            updateDisplay();
            return;
        }

        // Delete the last character
        if (value === "DEL") {
            expression = expression.slice(0, -1);
            updateDisplay();
            return;
        }

        // Calculate the answer
        if (value === "=") {
            try {
                // Allow only numbers and arithmetic symbols
                if (
                    expression === "" ||
                    !/^[0-9+\-*/().\s]+$/.test(expression)
                ) {
                    throw new Error("Invalid input");
                }

                // Evaluate the arithmetic expression
                let answer = Function(
                    '"use strict"; return (' + expression + ')'
                )();

                // Check for invalid results
                if (
                    typeof answer !== "number" ||
                    !Number.isFinite(answer)
                ) {
                    throw new Error("Invalid result");
                }

                // Round long decimal results
                answer = Math.round(
                    (answer + Number.EPSILON) * 10000000000
                ) / 10000000000;

                expression = String(answer);
                updateDisplay();

            } catch (error) {
                $("#display").val("Error");
                expression = "";
            }

            return;
        }

        // Start a new calculation after an error
        if ($("#display").val() === "Error") {
            expression = "";
        }

        // Add the clicked value
        expression += value;
        updateDisplay();
    });

    // Show the initial display
    updateDisplay();

});
