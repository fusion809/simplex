// Initialize our only global variable
var tempStr = "";

/**
 * Create an array of where each element in x appears in xB. Useful for 
 * calculating cB later.
 * 
 * @param x      1d array of decision variable names.
 * @param xB     1d array of basis variable names.
 * @return       Array of size xB.length containing indices of where in x each 
 * component of xB appears. 
 */
function basisIndex(x, xB) {
    var loc = new Array(xB.length);
    for (let i = 0; i < xB.length; i++) {
        for (let j = 0; j < x.length; j++) {
            if (xB[i] == x[j]) {
                loc[i] = j;
                break;
            }
        }
    }
    return loc;
}

/**
 * Create a string representation of a specified number expressed 
 * as either an integer or fraction.
 * 
 * @param number Number to express.
 * @return       String integer/fraction representation of number.
 */
function fracHandler(number) {
    var numberFrac = math.fraction(number);
    if (numberFrac.d != 1) {
        return (numberFrac.s * numberFrac.n) + "/" + numberFrac.d;
    } else {
        return "" + (numberFrac.s * numberFrac.n);
    }
}

/**
 * Generate simplex tableau based on specified data.
 * 
 * @param A         Constraint coefficient in a 2d array.
 * @param b         RHS of the constraints in a 1d array.
 * @param cj        1d array of objective function coefficients.
 * @param x         1d array of decision variable names.
 * @param xB        1d array of basis variable names.
 * @param isFeas    Boolean indicating whether problem is feasible.
 * @param isOptim   Boolean indicating whether problem is 
 * optimized.
 * @param ratio     Ratio array used to decide entering/departing
 * variables.
 * @param pivotCol  Pivot column.
 * @param pivotEl   Pivot element.
 * @param pivotRIdx Pivot row index.
 * @param pivotCIdx Pivot column index.
 */
function genTableau(A, b, cj, x, xB, isFeas, isOptim, pivotCol, pivotEl, 
    ratio, pivotRIdx, pivotCIdx, isUnbounded) {
    var m = A.length;
    if (m != xB.length) {
        document.getElementById("tableau").innerHTML = "";
        tempStr += "A and xB do no match in their dimensions. Remember";
        tempStr += " A must have the basic structure:<br/>";
        tempStr += "A = [[a11, a12, a13, ..., a1m+n], [a21, a22, a23,";
        tempStr += "..., a2m+n], [a31, a32, a33, ..., a3m+n], ..., ";
        tempStr += "[am1, am2, am3, ..., am(m+n)]]<br/>";
        tempStr += "Where there are m constraints to the problem."
        document.getElementById("tableau").innerHTML = tempStr;
        return;
    }
    var mn = A[0].length;
    var n = mn - m;
    var loc = basisIndex(x, xB);
    var [cB, z, zc] = calcEntries(A, b, cj, x, xB);

    // The following is to prevent departing/entering variable
    // indications from appearing in a final tableau
    if (xB[pivotRIdx] == x[pivotCIdx]) {
        pivotRIdx = NaN;
        pivotCIdx = NaN;
    }

    // Generate table
    document.getElementById("tableau").innerHTML = "";
    tempStr += "<table>";
    tempStr += "<tr>";
    tempStr += "<td></td>";
    tempStr += "<td>c<sub>j</sub></td>";
    for (let i = 0; i < cj.length; i++) {
        tempStr += "<td>" + fracHandler(cj[i]) + "</td>";
    }
    if (isFeas && !isOptim) {
        tempStr += "<td colspan='2'></td>";
    } else {
        tempStr += "<td></td>";
    }
    tempStr += "</tr>";
    tempStr += "<tr>";
    tempStr += "<td>c<sub><b>B</b></sub></td>";
    tempStr += "<td>x<sub><b>B</b></sub></td>";
    for (let i = 0; i < x.length; i++) {
        if (i != pivotCIdx) {
            tempStr += "<td>" + x[i] + "</td>";
        } else {
            tempStr += "<td><b>" + x[i] + "</b>&darr;</td>";
        }
    }
    tempStr += "<td><b>b</b></td>";
    if (isFeas && !isOptim) {
        tempStr += "<td>Ratio</td>";
    }
    tempStr += "</tr>";
    for (let i = 0; i < m; i++) {
        tempStr += "<tr>";
        tempStr += "<td>" + fracHandler(cj[loc[i]]) + "</td>";
        if (( pivotRIdx != i) || (isNaN(pivotCIdx)) ) {
            tempStr += "<td>" + xB[i] + "</td>";
        } else {
            tempStr += "<td>&larr;<b>" + xB[i] + "</b></td>";
        }
        for (let j = 0; j < mn; j++) {
            tempStr += "<td>" + fracHandler(A[i][j]) + "</td>";
        }
        tempStr += "<td>" + fracHandler(b[i]) + "</td>";
        if (isFeas && !isOptim) {
            if (ratio[i] != Number.POSITIVE_INFINITY && ratio[i] >= 0) {
                tempStr += "<td>" + fracHandler(ratio[i]) + "</td>";
            } else {
                tempStr += "<td>NA</td>";
            }
        }
        tempStr += "</tr>";
    }
    tempStr += "<tr>";
    tempStr += "<td rowspan='2'></td>";
    tempStr += "<td>z<sub>j</sub></td>";
    for (let i = 0; i < mn + 1; i++) {
        tempStr += "<td>" + fracHandler(z[i]) + "</td>";
    }
    tempStr += "</tr>";
    tempStr += "<tr>";
    tempStr += "<td>z<sub>j</sub>-c<sub>j</sub></td>";
    for (let i = 0; i < mn; i++) {
        let zci = math.fraction(zc[i]);
        tempStr += "<td>" + fracHandler(zc[i]) + "</td>";
    }
    tempStr += "</tr>";
    if (ratio != undefined && !isNaN(pivotEl)) {
        if (!isFeas) {
            tempStr += "<tr>";
            tempStr += "<td></td>";
            tempStr += "<td>Ratio</td>";
            for (let i = 0; i < mn; i++) {
                if (ratio[i] != Number.POSITIVE_INFINITY) {
                    tempStr += "<td>" + fracHandler(ratio[i]) + "</td>";
                } else {
                    tempStr += "<td></td>";
                }
            }
            tempStr += "</tr>";
        }
    }
    tempStr += "</table>";
    tempStr += "<br/>";
    if (!isOptim && !isUnbounded && !isNaN(pivotRIdx) && !isNaN(pivotEl)) {
        pivotRIdx++;
        for (let i = 0; i < m; i++) {
            if (pivotRIdx - 1 == i) {
                if (pivotEl != 1) {
                    tempStr += "<div>" + fracHandler(1 / pivotEl) + "R<sub>" + pivotRIdx + "</sub> &rarr; R<sub>" + pivotRIdx + "</sub><sup>'</sup>";
                } else {
                    tempStr += "<div>R<sub>" + pivotRIdx + "</sub> &rarr; R<sub>" + pivotRIdx + "</sub><sup>'</sup>";
                }
            } else {
                if (pivotCol[i] == -1) {
                    tempStr += "<div>R<sub>" + (i + 1) + "</sub> + " + "R<sub>" + pivotRIdx + "</sub><sup>'</sup> &rarr; R<sub>" + (i + 1) + "</sub><sup>'</sup>";
                } else if ( pivotCol[i] < 0) {
                    tempStr += "<div>R<sub>" + (i + 1) + "</sub> + " + (fracHandler(-pivotCol[i])) + "R<sub>" + pivotRIdx + "</sub><sup>'</sup> &rarr; R<sub>" + (i + 1) + "</sub><sup>'</sup>";
                } else if (pivotCol[i] == 0) {
                    tempStr += "<div>R<sub>" + (i + 1) + "</sub> &rarr; R<sub>" + (i + 1) + "</sub><sup>'</sup>";
                } else if (pivotCol[i] == 1) {
                    tempStr += "<div>R<sub>" + (i + 1) + "</sub> - " + "R<sub>" + pivotRIdx + "</sub><sup>'</sup> &rarr; R<sub>" + (i + 1) + "</sub><sup>'</sup>";
                } else {
                    tempStr += "<div>R<sub>" + (i + 1) + "</sub> - " + (fracHandler(pivotCol[i])) + "R<sub>" + pivotRIdx + "</sub><sup>'</sup> &rarr; R<sub>" + (i + 1) + "</sub><sup>'</sup>";
                }
            }
        }
    }
    document.getElementById("tableau").innerHTML = tempStr;
}

/**
 * Calculate cB, z and zc from other data
 * 
 * @param A      Array of constraint coefficients.
 * @param b      RHS of the constraints.
 * @param cj     Objective function coefficients.
 * @param x      1d array of decision variable names.
 * @param xB     1d array of basis variable names.
 * @return       [cB, zj, zj-cj]
 */
function calcEntries(A, b, cj, x, xB) {
    var m = A.length;
    if (m != xB.length) {
        document.write("Length of A does not match the length of xB.");
        return;
    }
    var mn = A[0].length;
    var loc = basisIndex(x, xB);
    var cB = new Array(m);
    var z = new Array(mn);
    var zc = new Array(mn);

    for (let i = 0; i < mn + 1; i++) {
        z[i] = 0;
        if (i != mn) {
            for (let j = 0; j < m; j++) {
                cB[j] = cj[loc[j]];
                z[i] += cB[j] * A[j][i];
            }
            zc[i] = z[i] - cj[i];
        } else {
            for (let j = 0; j < m; j++) {
                z[i] += cB[j] * b[j];
            }
        }
    }

    return [cB, z, zc];
}

/**
 * Find the index of the smallest element or smallest positive element in a 1d 
 * array.
 * 
 * @param vec       1d array to find the smallest element/positive element in.
 * @param isPosReq  A Boolean that decides whether the element must be 
 * positive.
 * @return          Index of the element with the smallest value/positive 
 * value.
 */
function minEl(vec, isPosReq) {
    var min = Number.POSITIVE_INFINITY;
    var index = 0;
    for (let i = 0; i < vec.length; i++) {
        if (isPosReq) {
            if ((vec[i] < min) && (vec[i] >= 0)) {
                min = vec[i];
                index = i;
            }
        } else {
            if (vec[i] < min) {
                min = vec[i];
                index = i;
            }
        }
    }

    return index;
}

/**
 * Returns pivot element, column, column index, row index and an array of
 * adjusted ratios between b and pivot column entries.
 * 
 * @param A   2d array of constraint coefficients.
 * @param b   1d array of the RHS of constraints.
 * @param zc  zj-cj contained within 1d array.
 * @return    Pivot element, pivot column, pivot column index, pivot row index 
 * and 1d ratio array.
 */
function findPivots(A, b, zc) {
    // Initialize relevant arrays
    var pivotCol = new Array(b.length);
    var ratio = new Array(b.length);
    // Determine column index by finding index of minimum
    // zj-cj entry.
    var pivotCIdx = minEl(zc, false);
    var k = 0;

    // Find pivot
    for (let i = 0; i < b.length; i++) {
        pivotCol[i] = A[i][pivotCIdx];
        if (pivotCol[i] <= 0) {
            ratio[i] = Number.POSITIVE_INFINITY;
            k++;
        } else {
            ratio[i] = b[i] / pivotCol[i];
        }
    }

    if (k == b.length) {
        var isUnbounded = true;
    } else {
        var isUnbounded = false;
    }

    var pivotRIdx = minEl(ratio, true);
    var pivotEl = pivotCol[pivotRIdx];

    return [pivotEl, pivotCol, pivotCIdx, pivotRIdx, ratio, isUnbounded];
}

/**
 * Determine whether solution is feasible and hence optimum and if infeasible, 
 * determine minimum element of b and its row index.
 * 
 * @param b      1d array containing the RHS of the constraints.
 * @return       [minIndex, isFeas, isOptim]
 */
function minElIfLt0(b) {
    // Initialize variables
    var isFeas = true;
    var isOptim = true;
    var min = Number.POSITIVE_INFINITY;
    var minIndex;

    // Find minimum element if one such element is less than 0 and set isFeas
    // and isOptim to false if such an element is found.
    for (let i = 0; i < b.length; i++) {
        if (b[i] < 0) {
            if (b[i] < min) {
                minIndex = i;
                min = b[i];
            }
            isFeas = false;
            isOptim = false;
        }
    }

    return [minIndex, isFeas, isOptim];
}

/**
 * Essentially updates the output of minElIfLt0 to account for solutions that 
 * while feasible are not optimal.
 * 
 * @param b      Solution vector as 1d array.
 * @param zc     zj-cj row of tableau as 1d array.
 * @return       [minIndex, isFeas, isOptim]
 */
function isOptAndFeas(b, zc) {
    // Determine feasibility and relevant associated values is minElIfLt0
    var [minIndex, isFeas, isOptim] = minElIfLt0(b);

    // If zj-cj < 0 for any j and isOptim is set to true, set isOptim to false
    if (isOptim) {
        for (let j = 0; j < zc.length; j++) {
            if (zc[j] < 0) {
                isOptim = false;
                break;
            }
        }
    }

    // Return corrected isOptim and the other outputs of minElIfLt0
    return [minIndex, isFeas, isOptim];
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
 * @return       [A, b, xB, pivotCol, pivotEl, pivotRIdx]
 */
function simplex(A, b, cj, x, xB, cB, z, zc) {
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
    } else {
        // Method for working with non-optimal, but feasible solutions
        var [pivotEl, pivotCol, pivotCIdx, pivotRIdx, ratio, isUnbounded] = findPivots(A, b,
             zc);
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
    return [A, b, xB, pivotCol, pivotEl, pivotRIdx, isUnbounded, isPermInf];
}

/**
 * Performs all the iterations of simplex required to find the
 * optimum solution.
 * 
 * @param A      2d array of constraint coefficients.
 * @param b      1d array of constraint RHS.
 * @param cj     1d array of objective function coefficients.
 * @param x      1d array of decision variable names.
 * @param xB     1d array of basis variable names.
 */
function simplexIterator(A, b, cj, x, xB) {
    var m = A.length;
    var pivotRIdx;
    var pivotEl;
    var pivotCol = new Array(m);
    var [cB, z, zc] = calcEntries(A, b, cj, x, xB);
    var [minIndex, isFeas, isOptim] = isOptAndFeas(b, zc);
    var iter = 0;
    var isInitInfeas = false;
    var isUnbounded = false;
    while ((!isOptim) && (!isUnbounded)) {
        [cB, z, zc] = calcEntries(A, b, cj, x, xB);
        [A, b, xB, pivotCol, pivotEl, pivotRIdx, isUnbounded, isPermInf] = simplex(A, b, 
            cj, x, xB, cB, z, zc);
        [minIndex, isFeas, isOptim] = isOptAndFeas(b, zc);
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

    // Strangely, simplex shows the final tableau if the initial problem is 
    // feasible, but not if it is not.
    if (isInitInfeas && !isUnbounded && !isPermInf) {
        genTableau(A, b, cj, x, xB, isFeas, isOptim, pivotCol, pivotEl);
    }
}