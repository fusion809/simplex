/**
 * Determine whether specified number is an integer.
 * 
 * @param number   Number we're checking for whether it's an integer.
 * @return         A Boolean indicating whether the specified number is an 
 * integer.
 */
function isInt(number) {
    var numFrac = math.fraction(number);
    if ( numFrac.d == 1 ) {
        return true;
    } else {
        return false;
    }
}

/**
 * A new slack variable.
 * 
 * @param x   1d array of x variable strings.
 * @return    New slack variable name.
 */
function newSlackVariable(x) {
    var mn = x.length;
    var finalSlack = x[mn-1];
    var finalSlackLet = finalSlack.replace(/\d+/, '');
    var finalSlackNo = parseInt(finalSlack.replace(finalSlackLet, ''));
    return finalSlackLet + (finalSlackNo + 1);
}

/**
 * A number new slack variables whose name starts with the letter part of 
 * the final slack variable in x
 * @param x        1d x array that ends in the slack variables of the problem.
 * @param number   Number of new slack variables to be returned.
 * @return         1d array of new slack variables to be added.
 */
function newSlackVariables(x, number) {
    var newxBRows = [newSlackVariable(x)];
    for (let i = 0; i < number - 1; i++) {
        newxBRows.push(newSlackVariable(newxBRows));
    }
    return newxBRows;
}