/**
 * For dual variables return an apostrophe.
 * 
 * @param isDual   A Boolean representing whether the problem is a dual.
 * @return         Empty string if isDual = false, string containing an 
 * apostrophe otherwise.
 */
function dualDash(isDual) {
    if (isDual) {
        return "'";
    } else {
        return "";
    }
}

/**
 * Obtain and return parameters of the problem from the form.
 * 
 * @params    None.
 * @return    [A, b, cj, x, xB, shouldDie]
 */
function getParameters() {
    // Initialize globals
    var shouldDie = false;
    var objVarName = "z";
    var sign = +1;

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
        dualCheck = document.getElementById("isDual").checked;
        if (document.getElementById("useNonMat").checked || dualCheck) {
            var [A, b, cj, x, xB, shouldDie, sign, objVarName] = 
            readNonMatForm();
            uncheck("useNonMat");
            uncheck("isDual");
        } else {
            var [A, b, cj, x, xB] = readInputs();
        }
    }

    // Update globals
    updateAInitials(A);

    // Uncheck buttons
    return [A, b, cj, x, xB, shouldDie, sign, objVarName];
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