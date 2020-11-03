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
    // Determine column index by finding index of minimum
    // zj-cj entry.
    var pivColIdx = minEl(zc, false);

    // Find pivot
    var {noOfInvRats, pivotCol, ratio} = findColRat(A, b, pivColIdx);

    if (noOfInvRats == b.length) {
        var isUnbounded = true;
    } else {
        var isUnbounded = false;
    }

    var pivotRIdx = minEl(ratio, true);
    var pivotEl = pivotCol[pivotRIdx];

    return [pivotEl, pivotCol, pivColIdx, pivotRIdx, ratio, isUnbounded];
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

    var objOfReturns = {
        noOfInvRats: noOfInvRats,
        pivotCol: pivotCol,
        ratio: ratio
    };
    return objOfReturns;
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