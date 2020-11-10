/**
 * Correct floating point numbers that are really integers/fractions
 * 
 * @param number   Number to be corrected.
 * @return         If the number of infinite or undefined, return that, 
 * otherwise return (hopefully) more accurate version of the number.
 */
function floatCor(number) {
    // If number cannot be converted to a fraction, leave as is
    if ( ( number == Number.POSITIVE_INFINITY ) || (number == Number.NEGATIVE_INFINITY) || (number == undefined)) {
        return number;
    } 
    // Otherwise convert to a fraction and then back to a floating point
    // useful for replacing very small positive or negative numbers to 0
    else {
        var bCor = math.fraction(number);
        return bCor.s * bCor.n / bCor.d;
    }
}

/**
 * Corrects output of minElIfLt0 to account for feasible, but non-optimal 
 * solutions.
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
        isOptim = !isZcNeg(zc);
    }

    // Return corrected isOptim and the other outputs of minElIfLt0
    return [minIndex, isFeas, isOptim];
}

/**
 * Determine whether any value in zc is negative.
 * 
 * @param zc  1d array of zj-cj values. 
 * @return    Boolean reflecting whether any zc entry is negative.
 */
function isZcNeg(zc) {
    for (let i = 0; i < zc.height; i++) {
        // Ensure that floating point errors do not stuff up determination 
        // of optimality
        if (floatCor(zc.matrix[i]) < 0) {
            return true;
        }
    }

    // If we get here no negative entries were found
    return false;
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
    for (let i = 0; i < b.height; i++) {
        // Ensure that floating point errors do not stuff up determination of
        // feasibility
        var bCor = floatCor(b.matrix[i]);
        if (bCor < 0) {
            if (bCor < min) {
                minIndex = i;
                min = bCor;
            }
            isFeas = false;
            isOptim = false;
        }
    }

    return [minIndex, isFeas, isOptim];
}