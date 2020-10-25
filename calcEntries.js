
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
    var loc = new Array(xB.length);
    for (let i = 0; i < xB.length; i++) {
        for (let j = 0; j < x.length; j++) {
            if (xB[i] == x[j]) {
                loc[i] = j;
                break;
            }
        }
    }
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
    var m = A.length;
    if (m != xB.length) {
        document.write("Length of A does not match the length of xB.");
        return;
    }
    var mn = A[0].length;
    var loc = basisIndex(x, xB);
    var cB = new Array(m);
    var z = new Array(mn);
    var zc = new Array(mn);

    for (let i = 0; i < mn + 1; i++) {
        z[i] = 0;
        if (i != mn) {
            for (let j = 0; j < m; j++) {
                cB[j] = cj[loc[j]];
                z[i] += cB[j] * A[j][i];
            }
            zc[i] = z[i] - cj[i];
        } else {
            for (let j = 0; j < m; j++) {
                z[i] += cB[j] * b[j];
            }
        }
    }

    return [cB, z, zc];
}
