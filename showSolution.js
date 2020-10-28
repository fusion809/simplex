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