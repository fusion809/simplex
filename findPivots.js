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
    var pivCol = new Array(b.length);
    var ratio = new Array(b.length);
    var noOfInvRats = 0; // Number of invalid ratios

    // Loop over every element of b
    for (let i = 0; i < b.length; i++) {
        // pivot column
        pivCol[i] = A[i][pivColIdx];

        // Following is to prevent floating point arithmetic errors from 
        // causing problems
        var pivColCor = floatCor(pivCol[i]);

        // Set ratio and count up number of invalid ratios
        if (pivColCor <= 0) {
            ratio[i] = Number.POSITIVE_INFINITY;
            noOfInvRats++;
        } else {
            ratio[i] = b[i] / pivCol[i];
        }
    }

    // Return object of values
    return {noOfInvRats: noOfInvRats, pivCol: pivCol, ratio: ratio};
}

/**
 * Find pivots for an infeasible problem.
 * 
 * @param A        2d array of constraint coefficients.
 * @param zc       1d array of zj-cj values.
 * @param minIndex Index of the minimum b value.
 * @param m        Number of rows in A.
 * @param mn       Number of columns in A.
 * @return         [k, pivCol, ratio, pivEl, pivColIdx, pivRowIdx]
 */
function findInfPivots(A, zc, minIndex, pivColIdx, m, mn) {
    // The method for working with infeasible solutions
    var pivRowIdx = minIndex;
    var k = 0;
    var minRat = Number.POSITIVE_INFINITY;
    var ratio = new Array(mn);
    var pivCol = new Array(m);
    var pivEl;

    // Find minimum ratio, pivot element, pivot column index
    for (let j = 0; j < mn; j++) {
        var pivRowEl = floatCor(A[minIndex][j]);

        // Pivot row element must be negative for it to be a potential 
        // pivot element
        if (pivRowEl < 0) {
            ratio[j] = math.abs(zc[j] / pivRowEl);

            // Find min zj-cj to pivot row element ratio, as it is the 
            // pivot element.
            if (ratio[j] < minRat) {
                minRat = ratio[j];
                pivColIdx = j;
                pivEl = A[minIndex][j];
            }

            // Increment k
            k++;
        } else {
            ratio[j] = Number.POSITIVE_INFINITY;
        }
    }

    // Create pivCol for updating A
    for (let i = 0; i < m; i++) {
        pivCol[i] = A[i][pivColIdx];
    }
    
    return [k, pivCol, ratio, pivEl, pivColIdx, pivRowIdx];
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
    // Pivot column is the one with the most negative entry of zj-cj
    var pivColIdx = minEl(zc, true, false);

    // Find pivot
    var {noOfInvRats, pivCol, ratio} = findColRat(A, b, pivColIdx);

    // If all ratios for pivot column are invalid, problem is unbounded
    if (noOfInvRats == b.length) {
        var isUnbounded = true;
    } else {
        var isUnbounded = false;
    }

    // Pivot row has the lowest non-negative ratio
    var pivRowIdx = minEl(ratio, false, true);
    var pivEl = pivCol[pivRowIdx];

    return [pivEl, pivCol, pivColIdx, pivRowIdx, ratio, isUnbounded];
}

/**
 * Find the index of the smallest element or smallest nonNegitive element in a 
 * 1d array.
 * 
 * @param vec       1d array to find the smallest element/nonNegitive element 
 * in.
 * @param isNeg     A Boolean that indicates whether the element must be 
 * negative.
 * @param isNonNeg  A Boolean that decides whether the element must be 
 * non-negative.
 * @return          Index of the element with the smallest value/non-negative 
 * value.
 */
function minEl(vec, isNeg, isNonNeg) {
    // Initialize vars
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