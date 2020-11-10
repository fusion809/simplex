/**
 * Function that performs simplex row operations on A and b.
 * 
 * @param A          2d array of LHS constraint coefficients.
 * @param b          1d array of solution values.
 * @param x          1d decision variable array.
 * @param xB         1d basis variable array.
 * @param pivColIdx  Pivot column index.
 * @param pivRowIdx  Pivot row index.
 * @param pivotEl    Pivot element.
 * @param pivotCol   Pivot column.
 * @param mn         Number of columns in A.
 * @param m          Number of rows in A.
 * @return           Updated A, b, xB.
 */
function rowOps(A, b, x, xB, pivColIdx, pivRowIdx, pivotEl, pivotCol, mn, m) {
    // Divide pivot row by pivot element
    b.matrix[pivRowIdx] /= pivotEl;

    // Replace pivot row basis variable with pivot column variable
    xB.matrix[pivRowIdx] = x.matrix[pivColIdx];

    for (let i = 0; i < mn; i++) {
        // Divide pivot row by pivot element
        A.matrix[pivRowIdx][i] /= pivotEl;

        for (let j = 0; j < m; j++) {
            // b subtraction should only be done once per row
            if (j != pivRowIdx) {
                if (i == 0) {
                    b.matrix[j] -= pivotCol.matrix[j] * b.matrix[pivRowIdx];
                }
                // Subtract what multiple of the corrected pivot row is 
                // required to get zeros in all columns corresponding to
                // basis variables
                A.matrix[j][i] -= pivotCol.matrix[j] * A.matrix[pivRowIdx][i];
            }
        }
    }
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
    var m = A.height;
    var mn = A.width;

    // Initialize pivot variables
    var pivRowIdx;
    var pivColIdx;
    var pivotEl;
    
    // Initialize Booleans
    var isPermInf = false;
    var isAltSol = false;
    var befAltSol = false;
    var [minIndex, isFeas, isOptim] = isOptAndFeas(b, zc);

    // Initialize minRat for the below loop
    var minRat = Number.POSITIVE_INFINITY;

    // Initialize relevant arrays
    var pivotCol = new Array(m);
    var ratio = new Array(zc.height);

    if (!isFeas) {
        // The method for working with infeasible solutions
        pivRowIdx = minIndex;
        var k = 0;
        // Find minimum ratio, pivot element, pivot column index
        for (let j = 0; j < mn; j++) {
            // The following is to prevent floating-point arithmetic from
            // causing problems
            var pivotRowEl = math.fraction(A.matrix[minIndex][j]);
            pivotRowEl = pivotRowEl.s * pivotRowEl.n / pivotRowEl.d;
            if (pivotRowEl < 0) {
                ratio[j] = math.abs(zc.matrix[j] / pivotRowEl);
                if (ratio[j] < minRat) {
                    minRat = ratio[j];
                    pivColIdx = j;
                    pivotEl = A.matrix[minIndex][j];
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
            pivotCol[i] = A.matrix[i][pivColIdx];
        }

        pivotCol = new Matrix(pivotCol);

        var isUnbounded = false;

        // Generate the tableau before we apply simplex
        var bools = new Bools(isFeas, isOptim, isUnbounded, isPermInf,
            isAltSol, befAltSol);
        genTableau(A, b, cj, x, xB, bools, pivotCol, ratio, pivotEl, pivRowIdx,
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
        xB.matrix[pivRowIdx] = x.matrix[pivColIdx];

        // Scale pivot row
        for (let i = 0; i < mn; i++) {
            A.matrix[pivRowIdx][i] /= pivotEl;
        }
        b.matrix[pivRowIdx] /= pivotEl;

        // Update other rows
        for (let i = 0; i < m; i++) {
            if (i != pivRowIdx) {
                for (let j = 0; j < mn; j++) {
                    A.matrix[i][j] -= pivotCol.matrix[i] * A.matrix[pivRowIdx][j];
                }
                b.matrix[i] -= pivotCol.matrix[i] * b.matrix[pivRowIdx];
            }
        }
    } else if (!isOptim) {
        // Method for working with non-optimal, but feasible solutions
        // If the problem is feasible, it's not permanently infeasible
        isPermInf = false;

        // Obtain pivot information
        var arr = findPivots(A, b, zc);
        [pivotEl, pivotCol, pivColIdx, pivRowIdx, ratio, isUnbounded] = arr;

        // Tabulate previous iteration
        var bools = new Bools(isFeas, isOptim, isUnbounded, isPermInf,
            isAltSol, befAltSol);
        genTableau(A, b, cj, x, xB, bools, pivotCol, ratio, pivotEl, 
            pivRowIdx, pivColIdx);

        // Apply feasible problem simplex algorithm
        [A, b, xB] = rowOps(A, b, x, xB, pivColIdx, pivRowIdx, pivotEl, 
            pivotCol, mn, m);
    }

    // If the solution is now optimal, tabulate it, otherwise proceed to next
    // iteration
    var [minIndex, isFeas, isOptim] = isOptAndFeas(b, zc);
    if (isOptim) {
        var bools = new Bools(isFeas, isOptim, isUnbounded, isPermInf,
            isAltSol, befAltSol);
        genTableau(A, b, cj, x, xB, bools, pivotCol, ratio, pivotEl, 
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
 * @return              [A, b, cj, x, xB, z]
 */
function simplexIterator(A, b, cj, x, xB) {
    // Error messages
    if (b.height != xB.height ) {
        alert("The lengths of b and xB do not match!");
        return;
    } else if (A.height != b.height) {
        var msg = "The number of rows in A does not match the number of rows";
        msg += "in b!";
        alert(msg);
        return;
    } else if (A.width != x.height) {
        var msg = "A has a number of columns that exceeds the number of";
        msg += " elements in x!";
        alert(msg);
        return;
    } else if (A.height != xB.height) {
        var msg = "xB has a number of elements that exceeds the number of";
        msg += " elements in A!";
        alert(msg);
        return;
    } else if (cj.height != A.width) {
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
        genTableau(A, b, cj, x, xB, {isFeas: isFeas, isOptim: isOptim});
        showSolution(A, b, cj, x, xB, z, zc);
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
        } else if (isPermInf) {
            tempStr += "Problem is infeasible! ";
        } else if (isOptim) {
            [cB, z, zc] = calcEntries(A, b, cj, x, xB);

            // Update finals before showSolution, in case there's alt sol
            finalA = copyOnAss(A);
            finalb = copyOnAss(b);
            finalcj = copyOnAss(cj);
            finalx = copyOnAss(x);
            finalxB = copyOnAss(xB);
            finalz = copyOnAss(z);
            finalV = extractV(A);

            // Show solution
            showSolution(A, b, cj, x, xB, z, zc);
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
    // Obtain required problem parameters
    var [A, b, cj, x, xB, shouldDie] = getParameters();

    // Solve problem using simplex iterator
    if (!shouldDie) {
        [A, b, cj, x, xB, z] = simplexIterator(A, b, cj, x, xB);
    }

    // Write tempStr to tableau element
    document.getElementById("tableau").innerHTML = tempStr;
}