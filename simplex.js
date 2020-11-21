/**
 * Function that performs simplex row operations on A and b.
 * 
 * @param A          2d array of LHS constraint coefficients.
 * @param b          1d array of solution values.
 * @param x          1d decision variable array.
 * @param xB         1d basis variable array.
 * @param pivColIdx  Pivot column index.
 * @param pivRowIdx  Pivot row index.
 * @param pivEl    Pivot element.
 * @param pivCol   Pivot column.
 * @param mn         Number of columns in A.
 * @param m          Number of rows in A.
 * @return           Updated A, b, xB.
 */
function rowOps(A, b, x, xB, pivColIdx, pivRowIdx, pivEl, pivCol, mn, m) {
    // Divide pivot row by pivot element
    b[pivRowIdx] /= pivEl;

    // Replace pivot row basis variable with pivot column variable
    xB[pivRowIdx] = x[pivColIdx];

    // Loop over columns
    for (let i = 0; i < mn; i++) {
        // Divide pivot row by pivot element
        A[pivRowIdx][i] /= pivEl;

        // Loop over rows
        for (let j = 0; j < m; j++) {
            // b subtraction should only be done once per row
            if (j != pivRowIdx) {
                // Only one column in b
                if (i == 0) {
                    b[j] -= pivCol[j] * b[pivRowIdx];
                }

                // Subtract what multiple of the corrected pivot row is 
                // required to get zeros in all columns corresponding to
                // basis variables
                A[j][i] -= pivCol[j] * A[pivRowIdx][i];
            }
        }
    }

    // Return updated arrays
    return [A, b, xB];
}

/**
 * Performs a singe iteration of simplex and calls genTableau on the previous
 * iteration. All inputs pertain to the values from the previous iteration of
 * simplex.
 * 
 * @param A      2d array of constraint coefficients.
 * @param b      1d array of solution values.
 * @param cj     Objective function coefficients.
 * @param x      1d array of decision variable names.
 * @param xB     1d array of basis variable names.
 * @param zc     1d array of zj-cj row contents.
 * @return       [A, b, xB, isUnbounded, isPermInf]
 */
function simplex(A, b, cj, x, xB, zc) {
    // Initialize dimensionality variables
    var {m, mn} = getDims(A);

    // Initialize pivot variables
    var pivRowIdx;
    var pivColIdx;
    var pivEl;
    
    // Initialize Booleans
    var isPermInf = false;
    var isAltSol = false;
    var befAltSol = false;
    var {minIndex, isFeas, isOptim} = isOptAndFeas(b, zc);

    if (!isFeas) {
        [k, pivCol, ratio, pivEl, pivColIdx, pivRowIdx] = 
        findInfPivots(A, zc, minIndex, pivColIdx, m, mn);

        // If k is still 0 then no elements of A[minIndex] that were less than
        // 0 were found
        if (k == 0) {
            isPermInf = true;
        }

        // Infeasible problems by definition do not satisfy the criteria as is
        // for unboundedness
        var isUnbounded = false;

        // Generate the tableau before we apply simplex
        var bools = new Bools(isFeas, isOptim, isUnbounded, isPermInf,
            isAltSol, befAltSol);
        genTableau(A, b, cj, x, xB, bools, pivCol, ratio, pivEl, pivRowIdx,
            pivColIdx);

        // Time to exit function if permanently infeasible, as there's no way
        // to solve the problem
        if (isPermInf) {
            return [A, b, xB, isUnbounded, isPermInf];
        }

        // Update the basis, must be done after genTableau is run otherwise
        // genTableau will give an error as the way we check whether entering
        // and departing variables should be indicated is to see whether the
        // following as an equality holds.
        xB[pivRowIdx] = x[pivColIdx];

        // Scale pivot row
        for (let i = 0; i < mn; i++) {
            A[pivRowIdx][i] /= pivEl;
        }
        b[pivRowIdx] /= pivEl;

        // Update other rows
        for (let i = 0; i < m; i++) {
            if (i != pivRowIdx) {
                for (let j = 0; j < mn; j++) {
                    A[i][j] -= pivCol[i] * A[pivRowIdx][j];
                }
                b[i] -= pivCol[i] * b[pivRowIdx];
            }
        }
    } else if (!isOptim) {
        // Method for working with non-optimal, but feasible solutions
        // If the problem is feasible, it's not permanently infeasible
        isPermInf = false;

        // Obtain pivot information
        var arr = findPivots(A, b, zc);
        [pivEl, pivCol, pivColIdx, pivRowIdx, ratio, isUnbounded] = arr;

        // Tabulate previous iteration
        var bools = new Bools(isFeas, isOptim, isUnbounded, isPermInf,
            isAltSol, befAltSol);
        genTableau(A, b, cj, x, xB, bools, pivCol, ratio, pivEl, 
            pivRowIdx, pivColIdx);

        // Apply feasible problem simplex algorithm
        if (pivRowIdx != -1) {
            [A, b, xB] = rowOps(A, b, x, xB, pivColIdx, pivRowIdx, pivEl, 
               pivCol, mn, m);
        }
    }

    // If the solution is now optimal, tabulate it, otherwise proceed to next
    // iteration
    var {minIndex, isFeas, isOptim} = isOptAndFeas(b, zc);
    if (isOptim) {
        var bools = new Bools(isFeas, isOptim, isUnbounded, isPermInf,
            isAltSol, befAltSol);
        genTableau(A, b, cj, x, xB, bools, pivCol, ratio, pivEl, 
            pivRowIdx, pivColIdx);
    }

    // Return data needed by simplexIterator
    return [A, b, xB, isUnbounded, isPermInf];
}

/**
 * Performs all the iterations of simplex required to find the
 * optimum solution.
 * 
 * @param A             2d array of constraint coefficients.
 * @param b             1d array of constraint RHS.
 * @param cj            1d array of objective function coefficients.
 * @param x             1d array of decision variable names.
 * @param xB            1d array of basis variable names.
 * @param sign          What the objective function has been multiplied by to
 * make it max, either 1 (max problem) or -1 (min problem).
 * @param objVarName    Name of the objective function (usually just a letter).
 * @return              [A, b, cj, x, xB, z]
 */
function simplexIterator(A, b, cj, x, xB, sign, objVarName) {
    // Error messages
    dimsCheck(A, b, cj, x, xB);

    // Initialize global variables
    var {zj, zc} = calcEntries(A, b, cj, x, xB);
    var {isFeas, isOptim} = isOptAndFeas(b, zc);
    var isUnbounded = false;
    var isPermInf = false;
    var arr;

    // If problem is already optimal, just tabulate the solution
    if (isOptim) {
        tempStr += "Solution is already optimal.";
        genTableau(A, b, cj, x, xB, {isFeas: isFeas, isOptim: isOptim});
        showSolution(A, b, cj, x, xB, zj, zc, sign, objVarName);
    }

    // Use simplex to solve the problem
    while ((!isOptim) && (!isUnbounded) && (!isPermInf)) {
        // Apply simplex
        var {zj, zc} = calcEntries(A, b, cj, x, xB);
        arr = simplex(A, b, cj, x, xB, zc);
        [A, b, xB, isUnbounded, isPermInf] = arr;
        
        // Determine whether problem is now optimal and feasible
        var {isFeas, isOptim} = isOptAndFeas(b, zc);

        // Show an appropriate message if the problem is infeasible or
        // unbounded
        if (isUnbounded) {
            tempStr += "Problem is unbounded! ";
        } else if (isPermInf) {
            tempStr += "Problem is infeasible! ";
            return [A, b, cj, x, xB, zj, false];
        } else if (isOptim) {
            var {zj, zc} = calcEntries(A, b, cj, x, xB);

            // Update finals before showSolution, in case there's alt sol
            updateFinals(A, b, cj, x, xB, zj, zc);

            // Show solution
            showSolution(A, b, cj, x, xB, zj, zc, sign, objVarName);
        }
    }

    // Update final values
    return [A, b, cj, x, xB, zj, zc, true];
}

/**
 * Apply simplexIterator() to arguments obtained from getParameters()
 * 
 * @params    None.
 * @return    Nothing.
 */
function solveProblem() {
    // Obtain required problem parameters
    var [A, b, cj, x, xB, shouldDie, sign, objVarName] = getParameters();
    var isFeas;

    // Solve problem using simplex iterator
    if (!shouldDie) {
        [A, b, cj, x, xB, zj, zc, isFeas] = simplexIterator(A, b, cj, x, xB, 
            sign, objVarName);
    }

    // Write tempStr to tableau element
    document.getElementById("tableau").innerHTML = tempStr;
}