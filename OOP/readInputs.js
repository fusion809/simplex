/**
 * Obtain and return parameters of the problem from the form.
 * 
 * @params    None.
 * @return    [A, b, cj, x, xB, shouldDie]
 */
function getParameters() {
    var shouldDie = false;

    // Change objective function coefficient(s)
    if (document.getElementById("changec").checked) {
        var [A, b, cj, x, xB, shouldDie] = objectiveChange();
        document.getElementById("changec").checked = false;
    }
    // Add new constraint
    else if (document.getElementById("newConstr").checked) {
        var [A, b, cj, x, xB, shouldDie] = newConstraint();
        uncheck("newConstr");
    }
    // Resource change (i.e. RHS of constraint)
    else if (document.getElementById("rscChg").checked) {
        var [A, b, cj, x, xB, shouldDie] = resourceChange();
        uncheck("rscChg");
    }
    // LHS constraint coefficient change
    else if (document.getElementById("LHSChg").checked) {
        var [A, b, cj, x, xB, shouldDie] = constrCoeffsChange();
        uncheck("LHSChg"); 
    }
    // New variable
    else if (document.getElementById("newVar").checked) {
        var [A, b, cj, x, xB, shouldDie] = addVariable();
        uncheck("newVar");
    }
    // Extract relevant values from form
    else {
        // Set globals
        [A, b, cj, x, xB] = readInputs();
    }

    // Update globals
    updateGlobals(A, b, xB, x, cj);

    // Uncheck buttons
    return [A, b, cj, x, xB, shouldDie];
}

/**
 * Read inputs from the form.
 * 
 * @params    None.
 * @return    [A, b, cj, x, xB]
 */
function readInputs() {
    var A = readA();
    var b = readb();
    var xB = readxB();
    var cj = readc();
    var x = readx();

    return [A, b, cj, x, xB];
}

/**
 * Set main variables to final values.
 * 
 * @params    None.
 * @return    [A, b, cj, x, xB]
 */
function setVarsToFinal() {
    // Initialize global variables
    var A = finalA;
    var b = finalb;
    var xB = finalxB;
    var cj = finalcj;
    var x = finalx;

    // Return
    return [A, b, cj, x, xB];
}

/**
 * Uncheck specified radio button if it is checked.
 * 
 * @param name     Name of the radio button's HTML element.
 * @return         Nothing.
 */
function uncheck(name) {
    if (document.getElementById(name).checked) {
        document.getElementById(name).checked = false;
    }
}