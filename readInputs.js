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
        var [A, b, xB, cj, x] = objectiveChange();
    }
    // Add new constraint
    else if (document.getElementById("newConstr").checked) {
        var [A, b, xB, cj, x] = newConstraint();
    }
    // Resource change (i.e. RHS of constraint)
    else if (document.getElementById("rscChg").checked) {
        var [A, b, xB, cj, x] = resourceChange();
    }
    // LHS constraint coefficient change
    else if (document.getElementById("LHSChg").checked) {
        var [A, b, xB, cj, x, shouldDie] = constrCoeffsChange();
    }
    else if (document.getElementById("newVar").checked) {
        var [A, b, xB, cj, x] = addVariable();
    }
    // Extract relevant values from form
    else {
        // Set globals
        var A = findA();
        var b = findb();
        var xB = findxB();
        var cj = findc();
        var x = findx();
    }

    // Update globals
    updateGlobals(A, b, xB, x, cj);

    // Uncheck buttons
    uncheckAll();
    return [A, b, cj, x, xB, shouldDie];
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

/**
 * Uncheck all radio buttons.
 * 
 * @params    None.
 * @return    Nothing.
 */
function uncheckAll() {
    document.getElementById("changec").checked = false;
    document.getElementById("newConstr").checked = false;
    document.getElementById("rscChg").checked = false;
    document.getElementById("LHSChg").checked = false;
}