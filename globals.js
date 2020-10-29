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
var l = 0;

/**
 * Update global variables.
 * 
 * @param A   2d array of the LHS of constraint coefficients. 
 * @param b   1d array of the RHS of the constraints.
 * @param xB  1d array of basis variables as strings.
 * @param x   1d array of decision variables as strings.
 * @param cj  1d array of objective function coefficients.
 * @return    Nothing.
 */
function updateGlobals(A, b, xB, x, cj) {
    finalA = A;
    if (l == 0) {
        initialAT = transpose(A);
        initialA = transpose(initialAT);
    }
    l++;
    finalb = b;
    finalxB = xB;
    finalx = x;
    finalcj = cj;
}