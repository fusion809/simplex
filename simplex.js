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
 * @param cB     1d array of basis variable objective function coefficients. 
 * @param z      1d array of zj row contents.
 * @param zc     1d array of zj-cj row contents.
 * @return       [A, b, xB, pivotCol, pivotEl, pivotRIdx, isUnbounded, 
 * isPermInf]
 */
function simplex(A, b, cj, x, xB, zc) {
    // Initialize required variables
    var m = A.length;
    var mn = A[0].length;
    var pivotRIdx;
    var pivotCIdx;
    var pivotEl;
    var pivotCol = new Array(m);
    var minRat = Number.POSITIVE_INFINITY;
    var ratio = new Array(zc.length);
    var isPermInf = false;
    var [minIndex, isFeas, isOptim] = isOptAndFeas(b, zc);

    if (!isFeas) {
        // The method for working with infeasible solutions
        pivotRIdx = minIndex;
        var k = 0;
        // Find minRat and pivotCol
        for (let j = 0; j < mn; j++) {
            if (A[minIndex][j] < 0) {
                ratio[j] = math.abs(zc[j] / A[minIndex][j]);
                if (ratio[j] < minRat) {
                    minRat = ratio[j];
                    pivotCIdx = j;
                    pivotEl = A[minIndex][j];
                }
                k++;
            } else {
                ratio[j] = Number.POSITIVE_INFINITY;
            }
        }
        if (k == 0) {
            isPermInf = true;
        }

        // Create pivotCol for updating A
        for (let i = 0; i < m; i++) {
            pivotCol[i] = A[i][pivotCIdx];
        }

        var isUnbounded = false;

        // Generate the tableau before we apply simplex
        genTableau(A, b, cj, x, xB, isFeas, isOptim, pivotCol, pivotEl, ratio, 
            pivotRIdx, pivotCIdx, isUnbounded, isPermInf);

        // Update the basis, must be done after genTableau is run otherwise
        // genTableau will give an error as the way we check whether entering
        // and departing variables should be indicated is to see whether the
        // following as an equality holds.
        xB[pivotRIdx] = x[pivotCIdx];

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
        var arr = findPivots(A, b,
             zc);
        [pivotEl, pivotCol, pivotCIdx, pivotRIdx, ratio, isUnbounded] = arr;
        genTableau(A, b, cj, x, xB, isFeas, isOptim, pivotCol, pivotEl, ratio,
            pivotRIdx, pivotCIdx, isUnbounded);
        b[pivotRIdx] /= pivotEl;
        xB[pivotRIdx] = x[pivotCIdx];
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
        isPermInf = false;
    }

    var [minIndex, isFeas, isOptim] = isOptAndFeas(b, zc);

    if (isOptim) {
        genTableau(A, b, cj, x, xB, isFeas, isOptim, pivotCol, pivotEl, ratio, pivotRIdx, pivotCIdx, isUnbounded);
    }
    return [A, b, xB, pivotCol, pivotEl, pivotRIdx, isUnbounded, isPermInf];
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
 * @return              Nothing.
 */
function simplexIterator(A, b, cj, x, xB) {
    if (b.length != xB.length ) {
        alert("The lengths of b and xB do not match!");
        return;
    }
    if (A.length != b.length) {
        var msg1 = "The number of rows in A does not match the number of rows"; 
        msg1 += "in b!";
        alert(msg1);
        return;
    }
    if (A[0].length != x.length) {
        var msg2 = "A has a number of columns that exceeds the number of";
        msg2 += " elements in x!";
        alert(msg2);
    }
    var m = A.length;
    var pivotRIdx;
    var pivotEl;
    var pivotCol = new Array(m);
    var [cB, z, zc] = calcEntries(A, b, cj, x, xB);
    var [minIndex, isFeas, isOptim] = isOptAndFeas(b, zc);
    var iter = 0;
    var isInitInfeas = false;
    var isUnbounded = false;
    var isPermInf = false;
    var arr;

    // If problem is already optimal, just tabulate the solution
    if (isOptim) {
        tempStr += "Solution is already optimal.";
        genTableau(A, b, cj, x, xB, isFeas, isOptim);
    }

    // Use simplex to solve the problem
    while ((!isOptim) && (!isUnbounded) && (!isPermInf)) {
        // Apply simplex
        [cB, z, zc] = calcEntries(A, b, cj, x, xB);
        arr = simplex(A, b, cj, x, xB, zc);
        [A, b, xB, pivotCol, pivotEl, pivotRIdx, isUnbounded, isPermInf] = arr;
        // Determine whether problem is now optimal and feasible
        [minIndex, isFeas, isOptim] = isOptAndFeas(b, zc);
        // Problems that start infeasible for some reason do not have the final
        // tableau displayed
        if ((iter == 0) && (!isFeas)) {
            isInitInfeas = true;
        }
        iter++;

        // Show an appropriate message if the problem is infeasible or
        // unbounded
        if (isUnbounded) {
            tempStr += "Problem is unbounded!";
            document.getElementById("tableau").innerHTML = tempStr;
        } else if (isPermInf) {
            tempStr += "Problem is infeasible!";
            document.getElementById("tableau").innerHTML = tempStr;
        }
    }

    // Update final values
    finalA = A;
    finalb = b;
    finalxB = xB;
    finalcj = cj;
    finalx = x;
    finalV = findV(A);
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
        simplexIterator(A, b, cj, x, xB);
    }
}