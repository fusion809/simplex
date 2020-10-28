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
    var m = A.length;
    var mn = A[0].length;
    var n = mn - m;
    
    // Initialize counter for basis variables displayed.
    var k = 0;

    // Display values of non-basic variables and z
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

    // Determine and display whether an alternate solution exists
    for (let i = 0; i < mn; i++) {
        // Checks whether for a non-basic variable the zj-cj element = 0, which
        // suggests alternate solutions exist
        var zcCor = math.fraction(zc[i]);
        zcCor = zcCor.s * zcCor.n / zcCor.d;
        if (!find(xB, x[i]) && zcCor == 0) {
            tempStr += "Alternate solution(s) exists. "
        }
    }

    // Write to tableau element
    document.getElementById("tableau").innerHTML = tempStr;
}