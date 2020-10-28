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
    // List basic variable values
    for (let i = 0 ; i < xB.length; i++) {
        tempStr += subscripts(xB[i], {isBold: false, isLeftArrow: false, 
            isDownArrow: false, notRow: true}) + " = " + decimalToFrac(b[i]) + ", ";
    }
    var k = 0;
    var m = A.length;
    var mn = A[0].length;
    var n = mn - m;
    // List values of non-basic variables
    for (let i = 0 ; i < x.length; i++) {
        if (!find(xB, x[i])) {
            if (k != 0) {
                tempStr += ", ";
            }
            tempStr += subscripts(x[i], {isBold: false, isLeftArrow: false, 
                isDownArrow: false, notRow: true}) + " = " + 0;               
            k++;
            if (k == n) {
                tempStr += " and " + katex.renderToString("z = ") + " " + decimalToFrac(z[mn]) + ".<br/>";
            }
        }
    }
    for (let i = 0; i < mn; i++) {
        // Checks if a variable is NOT in the basis and for it zj-cj=0 
        // (implying alternate solutions)
        if (!find(xB, x[i]) && zc[i] == 0) {
            tempStr += "Alternate solution exists. "
        }
    }
    document.getElementById("tableau").innerHTML = tempStr;
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
                    pivotCIdx = j;
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
            pivotCol[i] = A[i][pivotCIdx];
        }

        var isUnbounded = false;

        // Generate the tableau before we apply simplex
        genTableau(A, b, cj, x, xB, isFeas, isOptim, isUnbounded, isPermInf, 
            pivotCol, ratio, pivotEl, pivotRIdx, pivotCIdx);

        // Time to exit function if permanently infeasible, as there's no way
        // to solve the problem
        if (isPermInf) {
            return [A, b, xB, isUnbounded, isPermInf];
        }

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
        // If the problem is feasible, it's not permanently infeasible
        isPermInf = false;
        // Obtain pivot information
        var arr = findPivots(A, b, zc);
        [pivotEl, pivotCol, pivotCIdx, pivotRIdx, ratio, isUnbounded] = arr;
        // Tabulate previous iteration
        genTableau(A, b, cj, x, xB, isFeas, isOptim, isUnbounded, isPermInf,
            pivotCol, ratio, pivotEl, pivotRIdx, pivotCIdx);
        
        // Apply feasible problem simplex algorithm
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
    }

    // If the solution is now optimal, tabulate it, otherwise proceed to next
    // iteration
    var [minIndex, isFeas, isOptim] = isOptAndFeas(b, zc);
    if (isOptim) {
        genTableau(A, b, cj, x, xB, isFeas, isOptim, isUnbounded, isPermInf, 
            pivotCol, ratio, pivotEl, pivotRIdx, pivotCIdx);
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