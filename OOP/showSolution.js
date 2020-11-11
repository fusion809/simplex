/**
 * Check if any element in specified A column is positve.
 * 
 * @param A        2d LHS constraint array (after simplex has been applied).
 * @param b        1d array of solution values.
 * @param Idx      Column Idx.
 * @return         Boolean.
 */
function AColPos(A, b, Idx) {
    var min = Number.POSITIVE_INFINITY;
    var k = -1;
    // Search through each row in A in the specified column for a positive
    // element.
    for (let i = 0; i < A.height; i++) {
        if ((floatCor(A.matrix[i][Idx]) > 0) && (AbRat(A, b, i, Idx) < min)) {
            min = AbRat(A, b, i, Idx);
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
 * Ratio between b.matrix[i] and A.matrix[i][Idx]
 * 
 * @param A   A matrix.
 * @param b   b matrix.
 * @param i   Row index.
 * @param Idx Column index for A.
 * @return    Ratio.
 */
function AbRat(A, b, i, Idx) {
    return b.matrix[i]/A.matrix[i][Idx];
}

/**
 * Check for alternate solutions and mention it in tempStr if there is.
 * 
 * @param A   2d array of LHS coefficients.
 * @param b   1d array of solution values.
 * @param cj  1d array of objective function coefficients.
 * @param x   1d array of decision variables.
 * @param xB  1d array of basis variables.
 * @param zmn Objective function value.
 * @param zc  1d array of zj-cj values.
 * @return    Nothing, writes to tempStr.
 */
function checkForAltSol(A, b, cj, x, xB, zmn, zc) {
    // Dimensions of the problem
    var m = A.height;
    var mn = A.width;
    var n = A.dimDiff;
    // Initialize array of pivot indices
    var arrOfPivIdxs = [];
    // Counter of how many variables able to depart are found
    var k = 0;

    // Loop over each element in zc looking for zc = 0 for a non-basis variable
    for (let i = 0; i < mn; i++) {
        // A correction to prevent floating-point errors from messing up 
        // following comparison
        var zcCor = floatCor(zc.matrix[i]);
        var AColPosn = AColPos(A, b, i);

        // zj-cj must equal zero for non-basis variable column and the column
        // must have a positive aij value.
        if (!xB.find(x.matrix[i]) && (zcCor == 0) && AColPosn[1]) {
            // Display message in HTML to indicate which variable can enter 
            // the basis.
            var pivRowIdx = AColPosn[0];
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
            var pivotEl = A.matrix[pivRowIdx][pivColIdx];

            // Define vars for genTableau
            var format = {isBold: false, isLeftArrow: false, 
                isDownArrow: false, notRow: true};
            var bools = {isFeas: true, isOptim: true, isUnbounded: false, 
                isPermInf: false, isAltSol: false, befAltSol: true};

            // Say let this var exit and the other var enter on a new line
            tempStr += "<br/>";    
            tempStr += "Let " + subscripts(xB.matrix[pivRowIdx], format) + " exit the basis and ";
            tempStr += subscripts(x.matrix[pivColIdx], format) + " enter it. ";  

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
            printSolution(b, xB, x, zmn, mn, n, true);
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
    var format = {isBold: false, isRow: false, isLeftArrow: false, isDownArrow: false};
    for (let i = 0 ; i < b.height; i++) {
        if (floatCor(b.matrix[i]) == 0) {
            tempStr += "Solution is permanently degenerate in " + subscripts(xB.matrix[i], format) + ". ";
        }
    }
}

/**
 * Print solution, including decision variables and if not an alternate 
 * solution, the objective function value.
 * 
 * @param b        1d of the basis variable values.
 * @param xB       1d array of basis variables.
 * @param x        1d array of decision variables.
 * @param zmn      Objective function value.
 * @param mn       Number of columns in A.
 * @param n        Number of decision variables not including slack variables.
 * @param isAlt    A Boolean that indicates whether the solution being 
 * displayed is an alternate solution.
 * @return         Nothing, adds to the tempStr.
 */
function printSolution(b, xB, x, zmn, mn, n, isAlt) {
    // Non-basic variable counter
    var k = 0;

    // Values of basis variables
    for (let i = 0 ; i < xB.height; i++) {
        tempStr += subscripts(xB.matrix[i], {isBold: false, 
            isLeftArrow: false, isDownArrow: false, notRow: true}) + " = " + 
            decimalToFrac(b.matrix[i]) + ", ";
    }

    // Values of non-basic variables
    for (let i = 0 ; i < mn; i++) {
        if (!xB.find(x.matrix[i])) {
            // Punctuation for the list of variables
            if (k != 0) { 
                if (!( ( k == n-1) && (isAlt))) {
                    tempStr += ", ";
                } else {
                    tempStr += " and ";
                }
            }

            // All non-basic variables are equal to 0
            tempStr += subscripts(x.matrix[i], {isBold: false, 
                isLeftArrow: false, isDownArrow: false, notRow: true}) + " = "
                + 0;               
            
            // k is our count of how many non-basic variables we've printed
            k++;

            // Final entry in sentence
            if (k == n) {
                // If this isn't an alternate solution that's being printed, 
                // show z value also. Otherwise just print full stop.
                if (!isAlt) {
                    tempStr += " and " + katex.renderToString("z = ") + " ";
                    tempStr += decimalToFrac(zmn) + ". ";
                } else {
                    tempStr += ". ";
                }
            }
        }
    }
}

/**
 * Show the optimal solution for the problem.
 * 
 * @param A   Final A array.
 * @param b   Final b array.
 * @param cj  Array of objective function coefficients.
 * @param x   Decision variable array.
 * @param xB  Final xB array.
 * @param z   zj value array.
 * @param zc  zj-cj value array.
 * @return    Nothing, just writes the solution to tempStr global.
 */
function showSolution(A, b, cj, x, xB, z, zc) {
    tempStr += "Optimal solution is ";

    // Initialize dimensionality variables
    var mn = A.width;
    var n = A.dimDiff;
    
    // Display values of non-basic variables and z
    printSolution(b, xB, x, z.matrix[mn], mn, n);

    // Check for permanent degeneracy
    checkForDegn(b, xB);

    // Determine and display whether an alternate solution exists
    checkForAltSol(A, b, cj, x, xB, z.matrix[mn], zc);

    // New empty row
    tempStr += "<br/>";
}