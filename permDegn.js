/**
 * Update tempStr to mention if problem is degenerate.
 * 
 * @param b   1d array of solution values for the final solution.
 * @param xB  1d array of basic variables as strings.
 * @return    Nothing, just adds to tempStr.
 */
function checkForDegn(b, xB) {
    // Formatting details for subscripts of degenerate basis variable.
    var format = {isBold: false, isRow: false, isLeftArrow: false, isDownArrow: false};
    var loc = zeroIndices(b);
    var noOfZeros = loc.length;
    if (noOfZeros > 0) {
        tempStr += "Solution is permanently degenerate in ";
    }

    // Loop through b, look for zero entry and print degeneracy message
    for (let i = 0 ; i < noOfZeros; i++) {
        var j = loc[i];
        tempStr += subscripts(xB[j], format);
        if (i == noOfZeros-2) {
            tempStr += " and ";
        } else if (i < noOfZeros-2) {
            tempStr += ", ";
        } else {
            tempStr += ". ";
        }
    }
}

/**
 * Return a 1d array of where in b zeros are found.
 * 
 * @param b   Array for which the location of zeros is to be determined.
 * @return    1d array of indices (integers).
 */
function zeroIndices(b) {
    var loc = [];
    for (let i = 0 ; i < b.length; i++) {
        if (floatCor(b[i]) == 0) {
            loc.push(i);
        }
    }
    return loc;
}