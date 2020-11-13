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
    // Pivot column is the one with the most negative entry of zj-cj
    var pivColIdx = minEl(zc, true, false);

    // Find pivot
    var {noOfInvRats, pivotCol, ratio} = findColRat(A, b, pivColIdx);

    // If all ratios for pivot column are invalid, problem is unbounded
    if (noOfInvRats == b.length) {
        var isUnbounded = true;
    } else {
        var isUnbounded = false;
    }

    // Pivot row has the lowest non-negative ratio
    var pivRowIdx = minEl(ratio, false, true);
    var pivotEl = pivotCol[pivRowIdx];

    return [pivotEl, pivotCol, pivColIdx, pivRowIdx, ratio, isUnbounded];
}

/**
 * Calculate column of ratios between b and the pivot column entries.
 * 
 * @param A             2d LHS constraint coefficients array.
 * @param b             1d solution array (b column of the tableau).
 * @param pivColIdx     Pivot column index.
 * @return              number of invalid ratios, pivot column and ratios in
 * an object.
 */
function findColRat(A, b, pivColIdx) {
    // Initialize globals
    var pivotCol = new Array(b.length);
    var ratio = new Array(b.length);
    var noOfInvRats = 0; // Number of invalid ratios

    // Loop over every element of b
    for (let i = 0; i < b.length; i++) {
        pivotCol[i] = A[i][pivColIdx];
        // Following is to prevent floating point arithmetic errors from 
        // causing problems
        var pivotColCor = floatCor(pivotCol[i]);
        if (pivotColCor <= 0) {
            ratio[i] = Number.POSITIVE_INFINITY;
            noOfInvRats++;
        } else {
            ratio[i] = b[i] / pivotCol[i];
        }
    }

    // Store values in object
    var objOfReturns = {
        noOfInvRats: noOfInvRats,
        pivotCol: pivotCol,
        ratio: ratio
    };
    return objOfReturns;
}

/**
 * Find the index of the smallest element or smallest nonNegitive element in a 1d 
 * array.
 * 
 * @param vec       1d array to find the smallest element/nonNegitive element in.
 * @param isNeg     A Boolean that indicates whether the element must be 
 * negative.
 * @param isNonNeg  A Boolean that decides whether the element must be 
 * non-negative.
 * @return          Index of the element with the smallest value/non-negative 
 * value.
 */
function minEl(vec, isNeg, isNonNeg) {
    var min = Number.POSITIVE_INFINITY;
    var index = -1;

    // Loop over elements of vec
    for (let i = 0; i < vec.length; i++) {
        // Conditions for following test
        var nonNegReq = (!isNonNeg || vec[i] >= 0);
        var negReq = (!isNeg || vec[i] < 0);
        var isLt = (vec[i] < min);

        // Test whether min and index should be set for this element of vec
        if (isLt && nonNegReq && negReq) {
            min = vec[i];
            index = i;
        }
    }

    return index;
}