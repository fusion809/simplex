/**
 * Print decision variable values.
 * 
 * @param b     1d array of solution values.
 * @param x     1d array of decision variables, including slacks.
 * @param xB    1d array of basis variables.
 * @param mn    Length of x.
 * @param isAlt Is this an alternate solution? (Boolean)
 * @return      Nothing.
 */
function printDecVarValues(b, x, xB, mn, isAlt) {
    for (let i = 0 ; i < mn; i++) {
        // Where in xB x[i] is, if it is in there
        var loc = basisIndex(xB, [x[i]]);

        // Print variable name = 
        tempStr += subscripts(x[i], {isBold: false, isLeftArrow: false, 
            isDownArrow: false, notRow: true});
        tempStr += " = ";
        
        // Value of the variable
        if (!find(xB, x[i])) {
            tempStr += 0; // Non-basic variables = 0
        } else {
            tempStr += decimalToFrac(b[loc[0]]);
        }

        // Punctuation
        if (isAlt && i == mn - 2) {
            tempStr += " and ";
        } else if (!isAlt || isAlt && i < mn - 2) {
            tempStr += ", ";
        } else if (isAlt && i == mn - 1) {
            tempStr += ". ";
        }
    }
}

/**
 * Print dual variables.
 * 
 * @param xB  Basis variable names in 1d array.
 * @param zc  1d array of zj-cj values.
 * @param n   Number of decision variables (excluding slacks).
 * @return    Nothing.
 */
function printDuals(xB, zc, n) {
    // For every basis variable there is a dual variable
    for (let i = 0 ; i < xB.length; i++) {
        // Adjust message to which iteration it is
        if (i == 0) {
            tempStr += "Dual variable #" + (i+1) + " = ";
        } else if (i < xB.length - 1) {
            tempStr += ", #" + (i+1) + " = ";
        } else {
            tempStr += " and #" + (i+1) + " = ";
        }

        // Value of dual
        tempStr += decimalToFrac(zc[n+i]);

        // Full stop at end
        if (i == xB.length-1) {
            tempStr += ". ";
        }
    }
}

/**
 * Print objective function.
 * 
 * @param objVarName  Objective variable name.
 * @param sign        -1 if originally entered as a min problem, 1 otherwise.
 * @param zmn         Objective function value.    
 * @param isAlt       Is this an alternate solution? (Boolean)
 * @return            Nothing.
 */
function printObjFn(objVarName, sign, zmn, isAlt) {
    if (!isAlt) {
        tempStr += " and ";

        // Format objective function variable so that if numbers appear in it
        // they will appear as subscripts
        tempStr += subscripts(objVarName, 
            {isBold: false, isLeftArrow: false, isDownArrow: false, 
                notRow: true});
        tempStr += " ";
        tempStr += katex.renderToString(" = ") + " ";

        // sign is used to correct the sign of the objective function
        tempStr += decimalToFrac(sign*zmn) + ". ";
    }    
}

/**
 * Print solution, including decision variables and if not an alternate 
 * solution, the objective function value.
 * 
 * @param b          1d of the basis variable values.
 * @param xB         1d array of basis variables.
 * @param x          1d array of decision variables.
 * @param zc         1d array of zj-cj values.
 * @param zmn        Objective function value.
 * @param mn         Number of columns in A.
 * @param n          Number of decision variables not including slack variables.
 * @param sign       What the objective function has been multiplied by to make
 * it a maximization problem.
 * @param objVarName Objective function name (e.g. z).
 * @param isAlt      A Boolean that indicates whether the solution being 
 * displayed is an alternate solution.
 * @return           Nothing, adds to the tempStr.
 */
function printSolution(b, xB, x, zc, zmn, mn, n, sign, objVarName, isAlt) {
    // Non-basic variable counter
    printDecVarValues(b, x, xB, mn, isAlt);

    // Objective function variable
    printObjFn(objVarName, sign, zmn, isAlt);

    // Dual variables
    printDuals(xB, zc, n);
}

/**
 * Show the optimal solution for the problem.
 * 
 * @param A          Final A array.
 * @param b          Final b array.
 * @param cj         Array of objective function coefficients.
 * @param x          Decision variable array.
 * @param xB         Final xB array.
 * @param z          zj value array.
 * @param zc         zj-cj value array.
 * @param sign       What the objective function has been multiplied by to make
 * it a maximization problem.
 * @param objVarName Objective function name (e.g. z).
 * @return           Nothing, just writes the solution to tempStr global.
 */
function showSolution(A, b, cj, x, xB, z, zc, sign, objVarName) {
    tempStr += "Optimal solution is ";

    // Initialize dimensionality variables
    var {mn, n} = getDims(A);
    
    // Display values of non-basic variables and z
    printSolution(b, xB, x, zc, z[mn], mn, n, sign, objVarName, false);

    // Check for permanent degeneracy
    checkForDegn(b, xB);

    // Determine and display whether an alternate solution exists
    checkForAltSol(A, b, cj, x, xB, z[mn], zc, sign, objVarName);

    // New empty row
    tempStr += "<br/>";
}