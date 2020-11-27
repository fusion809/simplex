/**
 * Create an array of where each element in x appears in xB. Useful for 
 * calculating cB later.
 * 
 * @param x      1d array of decision variable names.
 * @param xB     1d array of basis variable names.
 * @return       Array of size xB.length containing indices of where in x each 
 * component of xB appears. 
 */
function basisIndex(x, xB) {
    // Initialize array that will store the locations
    var loc = new Array(xB.length);

    // Loop over basis variables
    for (let i = 0; i < xB.length; i++) {

        // Loop over decision variables
        for (let j = 0; j < x.length; j++) {

            // Record where in x each entry in xB is found
            if (xB[i] == x[j]) {
                loc[i] = j;
                break;
            }
        }
    }

    // Return array of locations
    return loc;
}

/**
 * Calculate cB, z and zc from other data
 * 
 * @param A      Array of constraint coefficients.
 * @param b      RHS of the constraints.
 * @param cj     Objective function coefficients.
 * @param x      1d array of decision variable names.
 * @param xB     1d array of basis variable names.
 * @return       [cB, zj, zj-cj]
 */
function calcEntries(A, b, cj, x, xB) {
    // Initialize globals
    var {m, mn} = getDims(A);
    var loc = basisIndex(x, xB);
    var cB = new Array(m);
    var zj = new Array(mn);
    var zc = new Array(mn);

    // Input validation
    if (m != xB.length) {
        alert("Length of A does not match the length of xB in calcEntries.");
        return;
    }

    // Loop over columns of the tableau in which z appears
    for (let i = 0; i < mn + 1; i++) {
        // Initialize z at zero
        zj[i] = 0;

        // i = mn is the objective function value
        if (i != mn) {
            // Loop over rows calculating cB and adding up contributions to z
            for (let j = 0; j < m; j++) {
                cB[j] = cj[loc[j]];
                zj[i] += cB[j] * A[j][i];
            }

            // Calculate zj-cj row entries
            zc[i] = zj[i] - cj[i];

        } else {

            // Calculate objective function value
            for (let j = 0; j < m; j++) {
                zj[i] += cB[j] * b[j];
            }
        }
    }

    return {cB: cB, zj: zj, zc: zc};
}