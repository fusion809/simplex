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
            // Ensure that floating point errors do not stuff up determination 
            // of optimality
            var zcCor = math.fraction(zc[j]);
            zcCor = zcCor.s * zcCor.n / zcCor.d;
            if (zcCor < 0) {
                isOptim = false;
                break;
            }
        }
    }

    // Return corrected isOptim and the other outputs of minElIfLt0
    return [minIndex, isFeas, isOptim];
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
        // Ensure that floating point errors do not stuff up determination of
        // feasibility
        var bCor = math.fraction(b[i]);
        bCor = bCor.s * bCor.n / bCor.d;
        if (bCor < 0) {
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