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
            var [A, b, cj, x, xB, shouldDie, sign, objVarName] = 
            readNonMatForm();
            uncheck("useNonMat");
        } else {
            var [A, b, cj, x, xB] = readInputs();
        }
    }

    // Update globals
    updateGlobals(A, b, cj, x, xB);

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
        tempStr += "Multiplying objective function by -1 to get a ";
        tempStr += "maximization problem.<br/>";
    }

    // Name of the objective function (e.g. z)
    var objVarName = elSpArr[1].replace(/=/, '');

    // Right-hand side of objective function
    var objRHS = elNLArr[0].replace(/.*=/, '').replace(/ /g, "");
    
    // Array of signs for objective function coefficients
    var signRHSArr = objRHS.match(/[+-]/g).join("");

    // Extract all decision variables from objective function
    var x = objRHS.match(/[a-zA-Z][a-zA-Z]*[0-9]*/g).join(" ").split(" ");
    var varNo = x.length;

    // Array of coefficients (without sign) with variables they correspond to
    var coeffsArr = objRHS.split(/[+-]/);
    // Remove any empty elements from array
    var coeffsArr = coeffsArr.filter(function(el) {
        return el != "";
    });

    // Count up number of less than or equal to inequalities
    if (element.match(/<=/g)) {
        var noOfLeq = element.match(/<=/g).join("").replace(/</g, "").length;
    } else {
        var noOfLeq = 0;
    }

    // Count up number of greater than or equal to inequalities
    if (element.match(/>=/g)) {
        var noOfGeq = element.match(/>=/g).join("").replace(/>/g, "").length;
    } else {
        var noOfGeq = 0;
    }

    // Count up equalities
    if (element.match(/ =/g)) {
        var noOfEq = 2*(element.match(/ =/g).join("").replace(/ /g, "").length-1);
    } else {
        var noOfEq = 0;
    }

    // For some reason the following calculation causes us to access a 
    // non-existent element of elNLArr below
    var noOfConstr = noOfLeq + noOfGeq + noOfEq;

    // Loop over objective function coefficients array
    for (let i = 0; i < varNo; i++) {
        if (coeffsArr[i] != "") {
            var coeffWOSign = coeffsArr[i].replace(/[a-zA-Z][a-zA-Z]*[0-9]*/, '');

            // If number is omitted, the coeff = 1
            if (!coeffWOSign.match(/[0-9]/)) {
                coeffWOSign += "1";
            }

            // First element, if there's no sign is given
            if ( (varNo == signRHSArr.length + 1) && (i == 0)) {
                var coeff = fracToDecimal(coeffWOSign);
            } 
            // Other elements, if no sign is given for first element
            else if (varNo == signRHSArr.length + 1) {
                // This first line sets the sign of the coefficient
                var coeff = parseInt(signRHSArr[i-1] + "1");
                coeff *= fracToDecimal(coeffWOSign);
            } 
            // Elements for rows where every sign is explicity specified
            else {
                // This first line sets the sign of the coefficient
                var coeff = parseInt(signRHSArr[i] + "1");
                coeff *= fracToDecimal(coeffWOSign);
            }
            
            // Add to cj
            cj.push(type*coeff);
        }
    }

    // Initialize arrays
    var A = new Array(noOfConstr);
    var xB = [];
    var b = new Array(noOfConstr);

    // Number of columns in A
    var mn = varNo + noOfConstr;

    // Counter variables
    var j = 0;
    var countOfEq = 0;

    // Determine number of empty rows
    var noOfEmptyRows = 0;
    for (let i = 0 ; i < elNLArr.length; i++) {
        if (elNLArr[i].match(/^\s*$/) || elNLArr[i].match(/[Ss]ubject to/)) {
            noOfEmptyRows++;
        }
    }

    // Loop over constraints
    while (j < noOfConstr) {
        // Initialize relevant rows
        if (elNLArr[j + 1 + noOfEmptyRows-countOfEq].match(/ =/)) {
            A[j+1] = new Array(mn);
        }
        A[j] = new Array(mn);

        // Add slack entries
        cj.push(0);

        // LHS of constraint
        var constr = elNLArr[j + 1 + noOfEmptyRows-countOfEq].replace(/[<>]*=.*/, '').replace(/ /g, "");

        // RHS of constraint
        var resc = fracToDecimal(elNLArr[j + 1 + noOfEmptyRows-countOfEq].replace(/.*[<>]*=/, '').replace(/ /g, ""));

        // Detail what is being done before initial tableau is drawn
        if (elNLArr[j + 1 + noOfEmptyRows - countOfEq].match(/ =/)) {
            tempStr += "Splitting constraint ";
            tempStr += (j+1 - countOfEq);
            tempStr += " into &leq; and &geq; constraints. &geq; constraint ";
            tempStr += "must be multiplied by -1 to turn it into a &leq; ";
            tempStr += "constraint so it can then be converted to canonical ";
            tempStr += "form and added to the initial tableau."
            tempStr += "<br/><br/> ";
            b[j] = resc;
            b[j+1] = -resc;
        } else if (elNLArr[j + 1 + noOfEmptyRows - countOfEq].match(/<=/)) {
            b[j] = resc;
        } else {
            tempStr += "Multiplying constraint ";
            tempStr += (j+1-countOfEq);
            tempStr += " by minus one to replace &geq; with &leq;, which can ";
            tempStr += "then be converted to canonical form and added to the ";
            tempStr += "tableau.<br/><br/>";
            b[j] = -resc;
        }

        // Loop over every variable, determine coefficient and add to A
        for (let i = 0; i < varNo; i++) {
            var varName = x[i];
            var regex = new RegExp(`[+-]*[0-9/]*${varName}`);
            if (constr.match(regex)) {
                var coeff = constr.match(regex).join("").replace(varName, "");
                if (!coeff.match(/[0-9]/)) {
                    coeff += "1";
                }
                coeff = fracToDecimal(coeff);
            } else {
                var coeff = 0;
            }
            if (elNLArr[j + 1 + noOfEmptyRows-countOfEq].match(/<=/)) {
                A[j][i] = coeff;
            } else if (elNLArr[j + 1 + noOfEmptyRows-countOfEq].match(/>=/)) {
                A[j][i] = -coeff;
            } else if (elNLArr[j + 1 + noOfEmptyRows-countOfEq].match(/ =/)) {
                A[j][i] = coeff;
                A[j+1][i] = -coeff;
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

        // Add slacks to x and xB
        xB.push("s" + (j+1));
        x.push("s" + (j+1));

        // If constraint is an equality, add additional entries to cj, x and
        // xB, increment j by 2 and countOfEq by 1. Otherwise just increment j
        // by 2.
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

    // Return all data needed by getParameters()
    return [A, b, cj, x, xB, false, type, objVarName];
}