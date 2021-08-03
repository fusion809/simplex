/**
 * Add problem to numerical arrays.
 * 
 * @param cj            Objective function coefficient array.
 * @param x             Decision variable array.
 * @param elNLArr       Array of newline-separated elements of form element.
 * @param dualCheck     Boolean of whether dual variable radio button has been 
 * checked.
 * @param noOfEmptyRows Number of empty rows in the form.
 * @param noOfConstr    Number of constraints.
 * @param varNo         Number of decision variables (w/o slacks).
 * @param mn            varNo + noOfConstr
 * @return              [A, b, cj, x, xB]
 */
function addConstrToArr(cj, x, elNLArr, dualCheck, noOfEmptyRows, 
    noOfConstr, varNo, mn) {
    var j = 0;
    var countOfEq = 0;
    var A = new Array(noOfConstr);
    var b = new Array(noOfConstr);
    var xB = new Array(noOfConstr);

    while (j < noOfConstr) {
        // Relevant vars
        var constrLn = elNLArr[j+1+noOfEmptyRows-countOfEq];
        var isConstrEq = constrLn.match(/ =/);
        var isConstrLeq = constrLn.match(/<=/);
        var isConstrGeq = constrLn.match(/>=/);

        // Initialize relevant rows
        if (isConstrEq) {
            A[j+1] = new Array(mn);
        }
        A[j] = new Array(mn);

        // Add slack entries
        cj[j+varNo] = 0;

        // LHS of constraint
        var constrWoSp = constrLn.replace(/ /g, "");
        var constrLHS = constrWoSp.replace(/[<>]*=.*/, '');
        var constrRHS = constrWoSp.replace(/.*=/, '');

        // RHS of constraint
        var resc = fracToDecimal(constrRHS);

        // Detail what is being done before initial tableau is drawn
        if (isConstrEq) {
            equalConstrMsg(j, countOfEq);
            b[j] = resc;
            b[j+1] = -resc;
        } else if (isConstrLeq) {
            b[j] = resc;
        } else {
            geqConstrMsg(j, countOfEq);            
            b[j] = -resc;
        }

        // Loop over every variable, determine coefficient and add to A
        for (let i = 0; i < varNo; i++) {

            // Obtain coeff of x[i] for constraint j
            var varName = x[i];
            var regex = new RegExp(`[+-]*[0-9./]*${varName}`);
            if (constrLHS.match(regex)) {
                var coeff = constrLHS.match(regex).join("").replace(varName, "");
                if (!coeff.match(/[0-9]/)) {
                    coeff += "1";
                }
                coeff = fracToDecimal(coeff);
            } else {
                var coeff = 0;
            }

            // Add coeffs to A
            if (isConstrLeq) {
                A[j][i] = coeff;
            } else if (isConstrGeq) {
                A[j][i] = -coeff;
            } else if (isConstrEq) {
                A[j][i] = coeff;
                A[j+1][i] = -coeff;
            }
        }

        // Loop over slack variable columns
        for (let k = varNo ; k < mn; k++) {
            // Slack variable for constraint
            if (j == k - varNo) {
                A[j][k] = 1;
            } else {
                A[j][k] = 0;
            }

            // Add slack variables in extra row if constraint is an equality
            if (isConstrEq) {
                if (j+1 == k - varNo) {
                    A[j+1][k] = 1;
                } else {
                    A[j+1][k] = 0;
                }
            }
        }

        // Add slacks to x and xB
        var sj = "s" + (j+1) + dualDash(dualCheck);
        xB[j] = sj;
        x.push(sj);

        // If constraint is an equality, add additional entries to cj, x and
        // xB, increment j by 2 and countOfEq by 1. 
        // Otherwise just increment j by 2.
        if (isConstrEq) {
            // Second split constraint slack variable
            var sj1 = "s" + (j+2) + dualDash(dualCheck);
            xB[j+1] = sj1;
            x.push(sj1);
            cj[varNo+j+1] = 0;

            // Incrementing by 2 constraint counter
            j += 2;

            // Increment equality constraint count
            countOfEq++;
        } else {
            j++;
        }
    }

    return [A, b, cj, x, xB];
}

/**
 * Calculate number of empty rows.
 * 
 * @param elNLArr  Array of new line-separated components of the nonMatForm 
 * HTML element.
 * @return         noOfEmptyRows.
 */
function calcNoOfEmptyRows(elNLArr) {
    // Initialize var
    var noOfEmptyRows = 0;

    // Count up number of empty or irrelevant rows
    for (let i = 0 ; i < elNLArr.length; i++) {
        var line = elNLArr[i];
        var isBlankLn = line.match(/^\s*$/);
        var isStLn = line.match(/[Ss](ubject to|t)/);

        // Class either blank lines or st. lines as empty rows
        if (isBlankLn || isStLn) {
            noOfEmptyRows++;
        }
    }

    // Return it
    return noOfEmptyRows;
}

/**
 * Prints equality constraint message (about what's being done to the 
 * constraint).
 * 
 * @param j          Uncorrect constraint number. 
 * @param countOfEq  Count of equalities in the original problem.
 * @return           Nothing.
 */
function equalConstrMsg(j, countOfEq) {
    tempStr += "Splitting constraint ";
    tempStr += (j+1 - countOfEq);
    tempStr += " into &leq; and &geq; constraints. &geq; constraint must be ";
    tempStr += "multiplied by -1 to turn it into a &leq; constraint so it ";
    tempStr += "can then be converted to canonical form and added to the ";
    tempStr += "initial tableau.<br/><br/> ";
}

/**
 * Prints greater than/equal to constraint message.
 * 
 * @param j          Uncorrect constraint number. 
 * @param countOfEq  Count of equalities in the original problem.
 */
function geqConstrMsg(j, countOfEq) {
    tempStr += "Multiplying constraint ";
    tempStr += (j+1-countOfEq);
    tempStr += " by -1 to replace &geq; with &leq;, which can then be";
    tempStr += " converted to canonical form and added to the initial";
    tempStr += " tableau.<br/><br/>";
}

/**
 * Print equation being solved.
 * 
 * @param element    HTML element in which equation has been entered.
 * @param midLnReg   Blank/subject to line regex.
 * @param NLReg      End of line regex.
 * @param dcnReg      Decision variable regex.
 * @param maxReg     Maximum problem regex.
 * @param minReg     Minimum problem regex.
 * @param x          Decision variable array.
 * @param varNo      Number of decision variables.
 * @param dualCheck  Whether the user has checked the radio button for that.
 * @return           Nothing.
 */
function printEqn(element, midLnReg, NLReg, dcnReg, maxReg, minReg, x, varNo,
    dualCheck) {
    // Type of objective function
    var maxStr = "&\\mathrm{Maximize\\hspace{0.1cm}}";
    var minStr = "&\\mathrm{Minimize\\hspace{0.1cm}}";

    // Create KaTeX string
    var texStr = "\\begin{aligned}\n";
    var stStr = "\\\\\n&\\mathrm{Subject\\hspace{0.1cm}to:}\\\\\n&";

    // Replace blank/subject to lines with "Subject to:" with TeX formatting
    texStr += element.replace(midLnReg, stStr);
    texStr = texStr.replace(NLReg, 
        (match, number) => number + "\\\\\n&");
    texStr = texStr.replace(dcnReg, 
        (match, letter, number) => `${letter}_${number}`);
    texStr = texStr.replace(/<=/g, "&&\\leq").replace(/>=/g, "&&\\geq");
    texStr = texStr.replace(/(?![<>])=/g, "&&=");
    texStr = texStr.replace(maxReg, maxStr);
    texStr = texStr.replace(minReg, minStr);
    // Non-negativity constraints
    texStr += "\\\\\n";
    texStr += "&";
    for (let i = 0; i < varNo; i++) {
        texStr += x[i].replace(/\d+/, function(x) {
            return "_{" + x + "}";
        });
        if (i < varNo - 1) {
            texStr += ",\\hspace{0.1cm}";
        } else {
            texStr += " &&\\geq 0."
        }
    }

    // End TeX string
    texStr += "\n\\end{aligned}";

    // Write texStr to tempStr
    if (dualCheck) {
        tempStr += "<br/>Solving the dual.<br/><br/>";
    }

    tempStr += "Problem is:<br/>"
    tempStr += "<span class=\"katex-display\">";
    tempStr += katex.renderToString(texStr);
    tempStr += "</span>";  
}

/**
 * Check LP type, writing appropriate messages to tempStr, print error
 * message if type does not seem properly defined.
 * 
 * @param maxReg      Maximization problem regex.
 * @param minReg      Minimization problem regex.
 * @param objVarName  Objective variable name.
 * @param type        What apepars before objVarName in problem statement.
 * @return            -1 for minimization problem, 1 for maximization problems.
 */
function probTypeCheck(maxReg, minReg, objVarName, type) {
    if (type.match(maxReg) ) {
        type = 1;
    } else if (type.match(minReg)) {
        type = -1;
        tempStr += "Multiplying ";
        tempStr += objVarName;
        tempStr += " by -1 to get a maximization problem.<br/><br/>";
    } else {
        var msg = "Odd, your problem doesn't seem to be either a maximization";
        msg += " or minimization problem";
        alert(msg);
    }
    return type;
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
    element = element.replace(/≥/g, ">=").replace(/≤/g, "<=");

    // Regular expressions
    var NLReg = new RegExp(/(\d)\s*(\n)/gi);
    var dcnReg = new RegExp(/([a-zA-Z])(\d+)/gi);
    var maxReg = new RegExp(/[mM]ax[imize]*[imise]*/);
    var minReg = new RegExp(/[mM]in[imize]*[imise]*/);
    var midLnReg = new RegExp(/\n[a-zA-Z .:]*\n/);
    var decVarRegg = new RegExp(/[a-zA-Z][a-zA-Z]*[0-9]*/g);
    var nonNegReg = new RegExp(/\n\s*[a-zA-Z]\d+,[ ][a-zA-Z]\d+.*(>=|≥)[ ]0.*$/);

    // Remove non-negativity constraints
    element = element.replace(nonNegReg, "");

    // Deal with &geq; and &leq; chars
    var elSpArr = element.split(" ");
    var elNLArr = element.split("\n");

    // Type is = 1 if max problem, -1 otherwise
    var type = elSpArr[0];

    // Right-hand side of objective function
    var objRHS = elNLArr[0].replace(/.*=/, '').replace(/ /g, "");

    // Extract all decision variables from objective function
    var x = objRHS.match(decVarRegg).join(" ").split(" ");
    var varNo = x.length;

    // TeX eqn
    printEqn(element, midLnReg, NLReg, dcnReg, maxReg, minReg, x, varNo, 
        dualCheck);

    // Name of the objective function (e.g. z)
    var objVarName = elSpArr[1].replace(/=/, '');

    // Check the type of the constraint
    type = probTypeCheck(maxReg, minReg, objVarName, type);

    // Array of signs for objective function coefficients
    var signRHSArr = objRHS.match(/[+-]/g).join("");

    // Array of coefficients (w/o sign) with variables they correspond to
    var coeffsArr = objRHS.split(/[+-]/);
    // Remove any empty elements from array
    var coeffsArr = coeffsArr.filter(function(el) {
        return el != "";
    });

    // Count up number of less than or equal to inequalities
    var elMLeq = element.match(/<=/g);
    if (elMLeq) {
        var noOfLeq = elMLeq.join("").replace(/</g, "").length;
    } else {
        var noOfLeq = 0;
    }

    // Count up number of greater than or equal to inequalities
    var elMGeq = element.match(/>=/g);
    if (elMGeq) {
        var noOfGeq = elMGeq.join("").replace(/>/g, "").length;
    } else {
        var noOfGeq = 0;
    }

    // Count up equalities
    var elMEq = element.match(/ =/g);
    if (elMEq) {
        var noOfEq = 2*(elMEq.join("").replace(/ /g, "").length-1);
    } else {
        var noOfEq = 0;
    }

    // For some reason the following calculation causes us to access a 
    // non-existent element of elNLArr below
    var noOfConstr = noOfLeq + noOfGeq + noOfEq;
    // Number of columns in A
    var mn = varNo + noOfConstr;
    var cj = new Array(mn);

    // Loop over objective function coefficients and add them to cj array
    for (let i = 0; i < varNo; i++) {
        if (coeffsArr[i] != "") {
            var coeffWOSign = coeffsArr[i].replace(decVarRegg, '');

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
            cj[i] = type*coeff;
        }
    }

    // Determine number of empty rows
    var noOfEmptyRows = calcNoOfEmptyRows(elNLArr);

    // Loop over constraints
    [A, b, cj, x, xB] = addConstrToArr(cj, x, elNLArr, dualCheck, 
        noOfEmptyRows, noOfConstr, varNo, mn);

    // Return all data needed by getParameters()
    return [A, b, cj, x, xB, false, type, objVarName];
}