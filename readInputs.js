/**
 * Obtain and return parameters of the problem from the form.
 * 
 * @params    None.
 * @return    [A, b, cj, x, xB, shouldDie]
 */
function getParameters() {
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
        if (document.getElementById("useNonMat").checked) {
            var [A, b, cj, x, xB, shouldDie, sign, objVarName] = readNonMatForm();
        } else {
            var [A, b, cj, x, xB] = readInputs();
        }
    }

    // Update globals
    updateGlobals(A, b, xB, x, cj);

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

/**
 * Read problem in non-matrix form.
 * 
 * @params    None, reads inputs from "nonMatForm" textarea.
 * @return    [A, b, cj, x, xB, shouldDie, sign, varName]
 */
function readNonMatForm() {
    // Element of the text area
    var element = document.getElementById("nonMatForm").value;
    var elSpArr = element.split(" ");
    var elNLArr = element.split("\n");
    var cj = [];

    // Type is = 1 if max problem, -1 otherwise
    var type = elSpArr[0];
    if (type.match(/[mM]ax[imize]*[imise]*/) ) {
        type = 1;
    } else if (type.match(/[mM]in[imize]*[imise]*/)) {
        type = -1;
        tempStr += "Multiplying objective function by -1 to get a max problem.<br/>";
    }

    // Name of the objective function (e.g. z)
    var objVarName = elSpArr[1].replace(/=/, '');
    var objRHS = elNLArr[0].replace(/.*=/, '').replace(/ /g, "");
    var signRHSArr = objRHS.match(/[+-]/g).join("");
    var x = objRHS.match(/[a-zA-Z][a-zA-Z]*[0-9]*/g).join(" ").split(" ");
    var varNo = x.length;
    var coeffsArr = objRHS.split(/[+-]/);

    if (element.match(/<=/g)) {
        var noOfLeq = element.match(/<=/g).join("").replace(/</g, "").length;
    } else {
        var noOfLeq = 0;
    }

    if (element.match(/>=/g)) {
        var noOfGeq = element.match(/>=/g).join("").replace(/>/g, "").length;
    } else {
        var noOfGeq = 0;
    }

    if (element.match(/ =/g)) {
        var noOfEq = 2*(element.match(/ =/g).join("").replace(/ /g, "").length-1);
    } else {
        var noOfEq = 0;
    }

    // For some reason the following calculation causes us to access a 
    // non-existent element of elNLArr below
    var noOfConstr = noOfLeq + noOfGeq + noOfEq;
    for (let i = 0; i < coeffsArr.length; i++) {
        if (coeffsArr[i] != "") {
            var coeffWOSign = coeffsArr[i].replace(/[a-zA-Z][a-zA-Z]*[0-9]*/, '');
            if ( (coeffsArr.length == signRHSArr.length +1) && (i == 0)) {
                var coeff = parseFloat(coeffWOSign);
            } else if (coeffsArr.length == signRHSArr.length +1) {
                var coeff = parseInt(signRHSArr[i-1] + "1")*parseFloat(coeffWOSign);
            } else {
                var coeff = parseInt(signRHSArr[i] + "1")*parseFloat(coeffWOSign);
            }
            cj.push(type*coeff);
        }
    }
    var A = new Array(noOfConstr);
    var xB = [];
    var mn = coeffsArr.length + noOfConstr;
    var b = new Array(noOfConstr);
    var j = 0;
    var countOfEq = 0;
    var noOfEmptyRows = 0;
    for (let i = 0 ; i < elNLArr.length; i++) {
        if (elNLArr[i].match(/^\s*$/) || elNLArr[i].match(/[Ss]ubject to/)) {
            noOfEmptyRows++;
        }
    }

    while (j < noOfConstr) {
        if (elNLArr[j + 1 + noOfEmptyRows-countOfEq].match(/ =/)) {
            A[j+1] = new Array(mn-1);
        }
        A[j] = new Array(mn-1);
        // Add slack entries
        cj.push(0);

        var constr = elNLArr[j + 1 + noOfEmptyRows-countOfEq].replace(/[<>]*=.*/, '').replace(/ /g, "");
        var resc = parseFloat(elNLArr[j + 1 + noOfEmptyRows-countOfEq].replace(/.*[<>]*=/, '').replace(/ /g, ""));
        if (elNLArr[j + 1 + noOfEmptyRows - countOfEq].match(/ =/)) {
            tempStr += "Splitting constraint ";
            tempStr += (j+1 - countOfEq);
            tempStr += " into <= and >= constraints.";
            tempStr += " >= constraints must be multiplied by -1 to get into";
            tempStr += " canonical form.<br/>"
            b[j] = -resc;
            b[j+1] = resc;
        } else if (elNLArr[j + 1 + noOfEmptyRows - countOfEq].match(/<=/)) {
            b[j] = resc;
        } else {
            tempStr += "Multiplying constraint ";
            tempStr += (j+1-countOfEq);
            tempStr += " by minus one to replace >= with <=, which can then";
            tempStr += " be converted into canonical form.<br/>";
            b[j] = -resc;
        }

        for (let i = 0; i < varNo; i++) {
            var varName = x[i];
            var regex = new RegExp(`[+-]*[0-9/]*${varName}`);
            if (constr.match(regex)) {
                var coeff = constr.match(regex).join("").replace(varName, "");
                coeff = fracToDecimal(coeff);
            } else {
                var coeff = 0;
            }
            if (elNLArr[j + 1 + noOfEmptyRows-countOfEq].match(/<=/)) {
                A[j][i] = coeff;
            } else if (elNLArr[j + 1 + noOfEmptyRows-countOfEq].match(/>=/)) {
                A[j][i] = -coeff;
            } else if (elNLArr[j + 1 + noOfEmptyRows-countOfEq].match(/ =/)) {
                A[j][i] = -coeff;
                A[j+1][i] = coeff;
            }
        }

        // Loop over slack variable columns
        for (let k = varNo ; k < varNo + noOfConstr; k++) {
            if (j == k - varNo) {
                A[j][k] = 1;
            } else {
                A[j][k] = 0;
            }
            if (elNLArr[j + 1 + noOfEmptyRows-countOfEq].match(/ =/)) {
                if (j+1 == k - varNo) {
                    A[j+1][k] = 1;
                } else {
                    A[j+1][k] = 0;
                }
            }
        }
        xB.push("s" + (j+1));
        x.push("s" + (j+1));
        if (elNLArr[j + 1 + noOfEmptyRows-countOfEq].match(/ =/)) {
            xB.push("s" + (j + 2));
            x.push("s" + (j + 2));
            cj.push(0);
            j += 2;
            countOfEq++;
        } else {
            j++;
        }
    }
    return [A, b, cj, x, xB, false, type, objVarName];
}