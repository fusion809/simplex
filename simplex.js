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
    var [m, mn, n] = getDims(A);

    // Initialize pivot variables
    var pivotRIdx;
    var pivColIdx;
    var pivotEl;
    
    // Initialize Booleans
    var isPermInf = false;
    var [minIndex, isFeas, isOptim] = isOptAndFeas(b, zc);

    // Initialize minRat for the below loop
    var minRat = Number.POSITIVE_INFINITY;

    // Initialize relevant arrays
    var pivotCol = new Array(m);
    var ratio = new Array(zc.length);

    if (!isFeas) {
        // The method for working with infeasible solutions
        pivotRIdx = minIndex;
        var k = 0;
        // Find minimum ratio, pivot element, pivot column index
        for (let j = 0; j < mn; j++) {
            // The following is to prevent floating-point arithmetic from
            // causing problems
            var pivotRowEl = math.fraction(A[minIndex][j]);
            pivotRowEl = pivotRowEl.s * pivotRowEl.n / pivotRowEl.d;
            if (pivotRowEl < 0) {
                ratio[j] = math.abs(zc[j] / pivotRowEl);
                if (ratio[j] < minRat) {
                    minRat = ratio[j];
                    pivColIdx = j;
                    pivotEl = A[minIndex][j];
                }
                k++;
            } else {
                ratio[j] = Number.POSITIVE_INFINITY;
            }
        }

        // If k is still 0 then no elements of A[minIndex] that were less than
        // 0 were found
        if (k == 0) {
            isPermInf = true;
        }

        // Create pivotCol for updating A
        for (let i = 0; i < m; i++) {
            pivotCol[i] = A[i][pivColIdx];
        }

        var isUnbounded = false;

        // Generate the tableau before we apply simplex
        genTableau(A, b, cj, x, xB, isFeas, isOptim, isUnbounded, isPermInf, 
            pivotCol, ratio, pivotEl, pivotRIdx, pivColIdx);

        // Time to exit function if permanently infeasible, as there's no way
        // to solve the problem
        if (isPermInf) {
            return [A, b, xB, isUnbounded, isPermInf];
        }

        // Update the basis, must be done after genTableau is run otherwise
        // genTableau will give an error as the way we check whether entering
        // and departing variables should be indicated is to see whether the
        // following as an equality holds.
        xB[pivotRIdx] = x[pivColIdx];

        // Scale pivot row
        for (let i = 0; i < mn; i++) {
            A[pivotRIdx][i] /= pivotEl;
        }
        b[pivotRIdx] /= pivotEl;

        // Update other rows
        for (let i = 0; i < m; i++) {
            if (i != pivotRIdx) {
                for (let j = 0; j < mn; j++) {
                    A[i][j] -= pivotCol[i] * A[pivotRIdx][j];
                }
                b[i] -= pivotCol[i] * b[pivotRIdx];
            }
        }
    } else if (!isOptim) {
        // Method for working with non-optimal, but feasible solutions
        // If the problem is feasible, it's not permanently infeasible
        isPermInf = false;
        // Obtain pivot information
        var arr = findPivots(A, b, zc);
        [pivotEl, pivotCol, pivColIdx, pivotRIdx, ratio, isUnbounded] = arr;
        // Tabulate previous iteration
        genTableau(A, b, cj, x, xB, isFeas, isOptim, isUnbounded, isPermInf,
            pivotCol, ratio, pivotEl, pivotRIdx, pivColIdx);
        
        // Apply feasible problem simplex algorithm
        [A, b, xB] = rowOps(A, b, x, xB, pivColIdx, pivotRIdx, pivotEl, pivotCol, mn, m);
    }

    // If the solution is now optimal, tabulate it, otherwise proceed to next
    // iteration
    var [minIndex, isFeas, isOptim] = isOptAndFeas(b, zc);
    if (isOptim) {
        genTableau(A, b, cj, x, xB, isFeas, isOptim, isUnbounded, isPermInf, 
            pivotCol, ratio, pivotEl, pivotRIdx, pivColIdx);
    }

    // Return data needed by simplexIterator
    return [A, b, xB, isUnbounded, isPermInf];
}

/**
 * Function that performs simplex row operations on A and b.
 * 
 * @param A          2d array of LHS constraint coefficients.
 * @param b          1d array of solution values.
 * @param x          1d decision variable array.
 * @param xB         1d basis variable array.
 * @param pivColIdx  Pivot column index.
 * @param pivotRIdx  Pivot row index.
 * @param pivotEl    Pivot element.
 * @param pivotCol   Pivot column.
 * @param mn         Number of columns in A.
 * @param m          Number of rows in A.
 * @return           Updated A, b, xB.
 */
function rowOps(A, b, x, xB, pivColIdx, pivotRIdx, pivotEl, pivotCol, mn, m) {
    b[pivotRIdx] /= pivotEl;
    xB[pivotRIdx] = x[pivColIdx];
    for (let i = 0; i < mn; i++) {
        A[pivotRIdx][i] /= pivotEl;

        for (let j = 0; j < m; j++) {
            // b subtraction should only be done once per row
            if (j != pivotRIdx) {
                if (i == 0) {
                    b[j] -= pivotCol[j] * b[pivotRIdx];
                }
                A[j][i] -= pivotCol[j] * A[pivotRIdx][i];
            }
        }
    }
    return [A, b, xB];
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
 * @return              [A, b, cj, x, xB, z]
 */
function simplexIterator(A, b, cj, x, xB) {
    // Error messages
    if (b.length != xB.length ) {
        alert("The lengths of b and xB do not match!");
        return;
    } else if (A.length != b.length) {
        var msg = "The number of rows in A does not match the number of rows";
        msg += "in b!";
        alert(msg);
        return;
    } else if (A[0].length != x.length) {
        var msg = "A has a number of columns that exceeds the number of";
        msg += " elements in x!";
        alert(msg);
        return;
    } else if (A.length != xB.length) {
        var msg = "xB has a number of elements that exceeds the number of";
        msg += " elements in A!";
        alert(msg);
        return;
    } else if (cj.length != A[0].length) {
        var msg = "A has a number of columns that exceeds the number of ";
        msg += "elements in c."
        alert(msg);
        return; 
    }

    // Initialize global variables
    var [cB, z, zc] = calcEntries(A, b, cj, x, xB);
    var [minIndex, isFeas, isOptim] = isOptAndFeas(b, zc);
    var isUnbounded = false;
    var isPermInf = false;
    var arr;

    // If problem is already optimal, just tabulate the solution
    if (isOptim) {
        tempStr += "Solution is already optimal.";
        genTableau(A, b, cj, x, xB, isFeas, isOptim);
        showSolution(A, b, x, xB, z, zc);
    }

    // Use simplex to solve the problem
    while ((!isOptim) && (!isUnbounded) && (!isPermInf)) {
        // Apply simplex
        [cB, z, zc] = calcEntries(A, b, cj, x, xB);
        arr = simplex(A, b, cj, x, xB, zc);
        [A, b, xB, isUnbounded, isPermInf] = arr;
        // Determine whether problem is now optimal and feasible
        [minIndex, isFeas, isOptim] = isOptAndFeas(b, zc);

        // Show an appropriate message if the problem is infeasible or
        // unbounded
        if (isUnbounded) {
            tempStr += "Problem is unbounded! ";
            document.getElementById("tableau").innerHTML = tempStr;
        } else if (isPermInf) {
            tempStr += "Problem is infeasible! ";
            document.getElementById("tableau").innerHTML = tempStr;
        } else if (isOptim) {
            [cB, z, zc] = calcEntries(A, b, cj, x, xB);
            showSolution(A, b, x, xB, z, zc);
        }
    }

    // Update final values
    return [A, b, cj, x, xB, z];
}

/**
 * Apply simplexIterator() to arguments obtained from getParameters()
 * 
 * @params    None.
 * @return    Nothing.
 */
function solveProblem() {
    var [A, b, cj, x, xB, shouldDie] = getParameters();

    if (!shouldDie) {
        [A, b, cj, x, xB, z] = simplexIterator(A, b, cj, x, xB);
    }

    finalA = A;
    finalb = b;
    finalcj = cj;
    finalx = x;
    finalxB = xB;
    finalz = z;
    finalV = extractV(A);
}