/**
 * Multiply square matrix by column vector
 * 
 * @param V        2d array representing a matrix.
 * @param b        1d/2d array.
 * @return         Matrix product between V and b
 */
function matMult(V, b) {
    // Initialize dimensionality variables
    var [m, mn, n] = getDims(A);

    // Initialize array that will store the matrix product
    var bUp = new Array(m);

    // Different algorithms for different dimensionalities
    if (n > 1) {
        // Loop over the rows of b
        for (let i = 0; i < m; i++) {
            bUp[i] = new Array(n);
            // Loop over the columns of b
            for (let j = 0 ; j < n; j++) {
                // Perform matrix product
                bUp[i][j] = 0;
                for (let k = 0; k < m; k++) {
                    bUp[i][j] += V[i][k] * b[k][j];
                }
            }
        }
    } else {
        // Loop over rows in b
        for (let i = 0; i < m; i++) {
            // Multiply matrices
            bUp[i] = 0;
            for (let j = 0; j < m; j++) {
                bUp[i] += V[i][j] * b[j];
            }
        }
    }
    return bUp;
}

/**
 * Transpose a 2d array.
 * 
 * @param A   Matrix to transpose.
 * @return    A^T
 */
function transpose(A) {
    // Dimensionality info
    var [m, mn, n] = getDims(A);

    // Create transpose matrix
    var AT = new Array(mn);

    for (let j = 0; j < mn; j++) {
        // Make it 2d
        AT[j] = new Array(m);

        // Populate AT with data
        for (let i = 0; i < m; i++) {
            AT[j][i] = A[i][j];
        }
    }

    return AT;
}