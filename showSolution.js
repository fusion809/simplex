/**
 * Check if any element in specified A column is positve.
 * 
 * @param A        2d LHS constraint array (after simplex has been applied).
 * @param b        1d array of solution values.
 * @param Idx      Column Idx.
 * @return         Row in A[][Idx] with lowest positive b/col ratio, Boolean 
 * indicating whether there's a positive, finite ratio.
 */
function AColPos(A, b, Idx) {
    // Initialize relevant variables
    var min = Number.POSITIVE_INFINITY;
    var k = -1;

    // Search through each row in A in the specified column for a positive
    // element.
    for (let i = 0; i < A.length; i++) {
        if ((floatCor(A[i][Idx]) > 0) && (b[i]/A[i][Idx] < min)) {
            min = b[i]/A[i][Idx];
            k = i;
        }
    }

    // k != -1 tests whether a positive ratio was found
    if (k != -1) {
        return [k, true];
    } else {
        return [k, false];
    }
}

/**
 * Check for alternate solutions and mention it in tempStr if there is.
 * 
 * @param A          2d array of LHS coefficients.
 * @param b          1d array of solution values.
 * @param cj         1d array of objective function coefficients.
 * @param x          1d array of decision variables.
 * @param xB         1d array of basis variables.
 * @param zmn        Objective function value.
 * @param zc         1d array of zj-cj values.
 * @param sign       What the objective function has been multiplied by to make
 * it a maximization problem.
 * @param objVarName Objective function name (e.g. z).
 * @return           Nothing, writes to tempStr.
 */
function checkForAltSol(A, b, cj, x, xB, zmn, zc, sign, objVarName) {
    // Dimensions of the problem
    var {m, mn, n} = getDims(A);
    // Initialize array of pivot indices
    var arrOfPivIdxs = [];
    // Counter of how many variables able to depart are found
    var k = 0;

    // Loop over each element in zc looking for zc = 0 for a non-basis variable
    for (let i = 0; i < mn; i++) {
        // A correction to prevent floating-point errors from messing up 
        // following comparison
        var zcCor = floatCor(zc[i]);

        // zj-cj must equal zero for non-basis variable column and the column
        // must have a positive aij value.
        if (!find(xB, x[i]) && (zcCor == 0) && AColPos(A, b, i)[1]) {
            // Display message in HTML to indicate which variable can enter 
            // the basis.
            var pivRowIdx = AColPos(A, b, i)[0];
            k++;
            arrOfPivIdxs.push([i, pivRowIdx]);
        }
    }

    // If k != 0, alternate solutions must exist.
    if (k != 0) {
        tempStr += "Alternate solution(s) exists. ";
        for (let i = 0; i < k; i++) {
            // Determine pivot indices
            var [pivColIdx, pivRowIdx] = arrOfPivIdxs[i];

            // Find ratios for b to pivot column
            var {pivotCol, ratio} = findColRat(A, b, pivColIdx);

            // Determine the pivot element
            var pivotEl = A[pivRowIdx][pivColIdx];

            // Define vars for genTableau
            var format = {isBold: false, isLeftArrow: false, 
                isDownArrow: false, notRow: true};
            var bools = {isFeas: true, isOptim: true, isUnbounded: false, 
                isPermInf: false, isAltSol: false, befAltSol: true};

            // Say let this var exit and the other var enter on a new line
            tempStr += "<br/>";    
            tempStr += "Let " + subscripts(xB[pivRowIdx], format) + " exit the basis and ";
            tempStr += subscripts(x[pivColIdx], format) + " enter it. ";  

            // Generate tableau showing the entering/leaving vars
            genTableau(A, b, cj, x, xB, bools, pivotCol, ratio, pivotEl, 
                pivRowIdx, pivColIdx);

            // Show row operations
            rowOperations(pivRowIdx, pivotCol, pivotEl);
                
            // Perform row operations
            [A, b, xB] = rowOps(A, b, x, xB, pivColIdx, pivRowIdx, pivotEl, 
                pivotCol, mn, m);

            // Generate tableau of alternate solution
            bools.isAltSol = true;
            bools.befAltSol = false;
            genTableau(A, b, cj, x, xB, bools, pivotCol, ratio, pivotEl, 
                pivRowIdx, pivColIdx); 
            tempStr += "Which gives the solution: ";
            
            // Print alternate solution
            printSolution(b, xB, x, zc, zmn, mn, n, sign, objVarName, true);
            checkForDegn(b, xB);
        }
    } 
}

/**
 * Update tempStr to mention if problem is degenerate.
 * 
 * @param b   1d array of solution values for the final solution.
 * @param xB  1d array of basic variables as strings.
 * @return    Nothing, just adds to tempStr.
 */
function checkForDegn(b, xB) {
    // Formatting details for subscripts of degenerate basis variable.
    var format = {isBold: false, isRow: false, isLeftArrow: false, isDownArrow: false};
    var loc = zeroIndices(b);
    var noOfZeros = loc.length;
    if (noOfZeros > 0) {
        tempStr += "Solution is permanently degenerate in ";
    }

    // Loop through b, look for zero entry and print degeneracy message
    for (let i = 0 ; i < noOfZeros; i++) {
        var j = loc[i];
        tempStr += subscripts(xB[j], format);
        if (i == noOfZeros-2) {
            tempStr += " and ";
        } else if (i < noOfZeros-2) {
            tempStr += ", ";
        } else {
            tempStr += ". ";
        }
    }
}

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
    for (let i = 0 ; i < xB.length; i++) {
        if (i == 0) {
            tempStr += "Dual variable #" + (i+1) + " = ";
        } else if (i < xB.length - 1) {
            tempStr += ", #" + (i+1) + " = ";
        } else {
            tempStr += " and #" + (i+1) + " = ";
        }
        tempStr += decimalToFrac(zc[n+i]);
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
        tempStr += subscripts(objVarName, 
            {isBold: false, isLeftArrow: false, isDownArrow: false, 
                notRow: true});
        tempStr += " ";
        tempStr += katex.renderToString(" = ") + " ";
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

/**
 * Return a 1d array of where in b zeros are found.
 * 
 * @param b   Array for which the location of zeros is to be determined.
 * @return    1d array of indices (integers).
 */
function zeroIndices(b) {
    var loc = [];
    for (let i = 0 ; i < b.length; i++) {
        if (floatCor(b[i]) == 0) {
            loc.push(i);
        }
    }
    return loc;
}