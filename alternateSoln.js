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
    // Counter of how many variables able to depart are found
    var arrOfPivIdxs = genArrPivIdxs(A, b, x, xB, zc, mn);
    var k = arrOfPivIdxs.length;

    // If k != 0, alternate solutions must exist.
    if (k != 0) {
        tempStr += "Alternate solution(s) exists. ";
        for (let i = 0; i < k; i++) {
            // Determine pivot indices
            var [pivColIdx, pivRowIdx] = arrOfPivIdxs[i];

            // Find ratios for b to pivot column
            var {pivCol, ratio} = findColRat(A, b, pivColIdx);

            // Determine the pivot element
            var pivEl = A[pivRowIdx][pivColIdx];

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
            genTableau(A, b, cj, x, xB, bools, pivCol, ratio, pivEl, 
                pivRowIdx, pivColIdx);

            // Show row operations
            rowOperations(pivRowIdx, pivCol, pivEl);
                
            // Perform row operations
            [A, b, xB] = rowOps(A, b, x, xB, pivColIdx, pivRowIdx, pivEl, 
                pivCol, mn, m);

            // Generate tableau of alternate solution
            bools.isAltSol = true;
            bools.befAltSol = false;
            genTableau(A, b, cj, x, xB, bools, pivCol, ratio, pivEl, 
                pivRowIdx, pivColIdx); 
            tempStr += "Which gives the solution: ";
            
            // Print alternate solution
            printSolution(b, xB, x, zc, zmn, mn, n, sign, objVarName, true);
            checkForDegn(b, xB);
        }
    } 
}

/**
 * Generate array of pivot indices for alternate solutions.
 * 
 * @param A   2d array of LHS coefficients.
 * @param b   1d array of solution values.
 * @param x   1d array of decision variables.
 * @param xB  1d array of basis variables.
 * @param zc  1d array of zj-cj values.
 * @param mn  Number of columns in A.
 * @return    Array of pivot indices (row nad column).
 */
function genArrPivIdxs(A, b, x, xB, zc, mn) {
    // Initialize array of pivot indices
    var arrOfPivIdxs = [];

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
            arrOfPivIdxs.push([i, pivRowIdx]);
        }
    }
    return arrOfPivIdxs;
}