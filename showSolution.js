/**
 * Show the optimal solution for the problem.
 * 
 * @param A   Final A array.
 * @param b   Final b array.
 * @param x   Decision variable array.
 * @param xB  Final xB array.
 * @param zc  zj-cj value array.
 * @return    Nothing, just writes the solution to tempStr global.
 */
function showSolution(A, b, x, xB, z, zc) {
    tempStr += "Optimal solution is ";

    // Initialize dimensionality variables
    var [m, mn, n] = getDims(A);
    
    // Display values of non-basic variables and z
    printSolution(b, xB, x, z[mn], mn, n);

    // Check for permanent degeneracy
    checkForDegn(b, xB);

    // Determine and display whether an alternate solution exists
    checkForAltSol(A, b, x, xB, z[mn], zc);

    // New empty row
    tempStr += "<br/>";

    // Write to tableau element
    document.getElementById("tableau").innerHTML = tempStr;
}

function printSolution(b, xB, x, zmn, mn, n) {
    var k = 0;

    // Values of basis variables
    for (let i = 0 ; i < xB.length; i++) {
        tempStr += subscripts(xB[i], {isBold: false, isLeftArrow: false, 
            isDownArrow: false, notRow: true}) + " = " + decimalToFrac(b[i]) + ", ";
    }

    // Values of non-basic variables
    for (let i = 0 ; i < mn; i++) {
        if (!find(xB, x[i])) {
            if (k != 0) {
                tempStr += ", ";
            }
            tempStr += subscripts(x[i], {isBold: false, isLeftArrow: false, 
                isDownArrow: false, notRow: true}) + " = " + 0;               
            k++;
            if (k == n) {
                tempStr += " and " + katex.renderToString("z = ") + " ";
                tempStr += decimalToFrac(zmn) + ". ";
            }
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
    for (let i = 0 ; i < b.length; i++) {
        if (floatCor(b[i]) == 0) {
            tempStr += "Solution is permanently degenerate in " + subscripts(xB[i], format) + ". ";
        }
    }
}

/**
 * Check for alternate solutions and mention it in tempStr if there is.
 * 
 * @param A   2d array of LHS coefficients.
 * @param x   1d array of decision variables.
 * @param xB  1d array of basis variables.
 * @param zc  1d array of zj-cj values.
 */
function checkForAltSol(A, b, x, xB, zmn, zc) {
    var [m, mn, n] = getDims(A);
    var k = 0;
    var arrOfPivIdxs = [];

    // Loop over each element in zc looking for zc = 0 for a non-basis variable
    for (let i = 0; i < mn; i++) {
        // A correction to prevent floating-point errors from messing up 
        // following comparison
        var zcCor = floatCor(zc[i]);

        // zj-cj must equal zero for non-basis variable column and the column
        // must have a positive aij value.
        if (!find(xB, x[i]) && zcCor == 0 && AColNonNeg(A, b, i)[1]) {
            // Display message in HTML to indicate which variable can enter 
            // the basis.
            var pivRowIdx = AColNonNeg(A, b, i)[0];
            k++;
            arrOfPivIdxs.push([i, pivRowIdx]);
        }
    }

    // If k != 0, alternate solutions must exist.
    if (k != 0) {
        tempStr += "Alternate solution(s) exists. One is ";
        for (let i = 0; i < k; i++) {
            if ( i > 0 ) {
                tempStr += "Another is ";
            }
            
            // Determine pivot indices
            var [pivColIdx, pivRowIdx] = arrOfPivIdxs[i];

            // Find ratios for b to pivot column
            var [noOfInvRats, pivotCol, ratio] = findColRat(A, b, pivColIdx, pivotCol, 
                ratio, k);

            // Determine the pivot element
            var pivotEl = A[pivRowIdx][pivColIdx];

            // Perform row operations
            [A, b, xB] = rowOps(A, b, x, xB, pivColIdx, pivRowIdx, pivotEl, 
                pivotCol, mn, m);

            // Print alternate solution
            printSolution(b, xB, x, zmn, mn, n);
        }
    } 
}

/**
 * Check if any element in specified A column is non-negative.
 * 
 * @param A        2d LHS constraint array.
 * @param Idx    Column Idx.
 * @return         Boolean.
 */
function AColNonNeg(A, b, Idx) {
    var min = Number.POSITIVE_INFINITY;
    var k = -1;
    // Search through each row in A in the specified column for a positive
    // element.
    for (let i = 0; i < A.length; i++) {
        if (floatCor(A[i][Idx]) > 0 && b[i]/A[i][Idx] < min) {
            min = b[i]/A[i][Idx];
            k = i;
        }
    }

    if (k != -1) {
        return [k, true];
    }

    // If we reach here, no A[i][Idx] > 0
    return [k, false];
}