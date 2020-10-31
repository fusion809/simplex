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
    
    // Initialize dimensionality variables
    var [m, mn, n] = getDims(A);
    
    // Initialize counter for basis variables displayed.
    var k = 0;

    // Display values of non-basic variables and z
    for (let i = 0 ; i < mn; i++) {
        if (!find(xB, x[i])) {
            if (k != 0) {
                tempStr += ", ";
            }
            tempStr += subscripts(x[i], {isBold: false, isLeftArrow: false, 
                isDownArrow: false, notRow: true}) + " = " + 0;               
            k++;
            if (k == n) {
                tempStr += " and " + katex.renderToString("z = ") + " ";
                tempStr += decimalToFrac(z[mn]) + ".<br/>";
            }
        }
    }

    // Determine and display whether an alternate solution exists
    checkForAltSol(A, x, xB, zc);

    // Write to tableau element
    document.getElementById("tableau").innerHTML = tempStr;
}

/**
 * Check for alternate solutions and mention it in tempStr if there is.
 * 
 * @param A   2d array of LHS coefficients.
 * @param x   1d array of decision variables.
 * @param xB  1d array of basis variables.
 * @param zc  1d array of zj-cj values.
 */
function checkForAltSol(A, x, xB, zc) {
    var mn = A[0].length;
    var k = 0;
    var arrOfEnterVars = [];

    // Loop over each element in zc looking for zc = 0 for a non-basis variable
    for (let i = 0; i < mn; i++) {
        // A correction to prevent floating-point errors from messing up 
        // following comparison
        var zcCor = floatCor(zc[i]);

        // zj-cj must equal zero for non-basis variable column and the column
        // must have a positive aij value.
        if (!find(xB, x[i]) && zcCor == 0 && AColNonNeg(A, i)) {
            // Display message in HTML to indicate which variable can enter the basis.
            var format = {isBold: false, isLeftArrow: false, 
                isDownArrow: false, notRow: true};
            k++;
            arrOfEnterVars.push(x[i]);
        }
    }

    // If k != 0, alternate solutions must exist.
    if (k != 0) {
        tempStr += "Alternate solution(s) exists, as ";
        for (let i = 0; i < k; i++) {
            tempStr += subscripts(arrOfEnterVars[i], format);
            if (i > 0 && i < k - 2) {
                tempStr += ", ";
            } else if (i == k - 2) {
                tempStr += " and ";
            }
        }
        tempStr += " can enter the basis.";
    } 
}

/**
 * Check if any element in specified A column is non-negative.
 * 
 * @param A        2d LHS constraint array.
 * @param index    Column index.
 * @return         Boolean.
 */
function AColNonNeg(A, index) {
    // Search through each row in A in the specified column for a positive
    // element.
    for (let i = 0; i < A.length; i++) {
        if (floatCor(A[i][index]) > 0) {
            return true;
        }
    }

    // If we reach here, no A[i][index] > 0
    return false;
}