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
    var loc = x.location(xB);
    var cB = new Array(A.height);
    var z = new Array(A.width + 1);
    var zc = new Array(A.width);

    // Input validation
    if (A.height != xB.height) {
        alert("Length of A does not match the length of xB in calcEntries.");
        return;
    }

    // Loop over columns of the tableau in which z appears
    for (let i = 0; i < A.width + 1; i++) {
        // Initialize z at zero
        z[i] = 0;

        // i = mn is the objective function value
        if (i != A.width) {
            // Loop over rows calculating cB and adding up contributions to z
            for (let j = 0; j < A.height; j++) {
                cB[j] = cj.matrix[loc.matrix[j]];
                z[i] += cB[j] * A.matrix[j][i];
            }

            // Calculate zj-cj row entries
            zc[i] = z[i] - cj.matrix[i];

        } else {

            // Calculate objective function value
            for (let j = 0; j < A.height; j++) {
                z[i] += cB[j] * b.matrix[j];
            }
        }
    }

    cB = new Matrix(cB);
    z = new Matrix(z);
    zc = new Matrix(zc);

    return [cB, z, zc];
}
