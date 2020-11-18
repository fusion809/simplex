// Initialize globals
var tempStr = "";
var finalA = [[]];
var initialA = [[]];
var initialAT = [[]];
var initialb = [];
var finalb = [];
var finalxB = [];
var finalcj = [];
var finalV = [[]];
var finalzj = [];
var finalzc = [];
var dualCheck;
var l = 0;

/**
 * Create parameter object containing all final arrays.
 * 
 * @return    That object.
 */
function setToFinals() {
    // Initialize parameter object
    var paramObj = {
        A: finalA,
        b: finalb,
        cj: finalcj,
        x: finalx,
        xB: finalxB,
    }

    return paramObj;
}

/**
 * Update global variables.
 * 
 * @param A   2d array of the LHS of constraint coefficients. 
 * @param b   1d array of the RHS of the constraints.
 * @param cj  1d array of objective function coefficients.
 * @param x   1d array of decision variables as strings.
 * @param xB  1d array of basis variables as strings.
 * @param zj  1d array of zj values.
 * @param zc  1d array of zc values.
 * @return    Nothing.
 */
function updateGlobals(A, b, cj, x, xB, zj, zc) {
    finalA = A;
    if (l == 0) {
        initialAT = transpose(A);
        initialA = copyOnAss(A);
    }
    l++;
    finalb = b;
    finalxB = xB;
    finalx = x;
    finalcj = cj;
    finalzj = zj;
    finalzc = zc;
}