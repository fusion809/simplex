/**
 * Multiply square matrix by column vector
 * 
 * @param finalV   2d array representing a matrix.
 * @param b        1d array representing a column vector.
 * @return         Matrix product between finalV and b
 */
function matMult(finalV, b) {
    var bUp = new Array(b.length);
    for (let i = 0; i < b.length ; i++) {
        bUp[i] = 0;
        for (let j = 0 ; j < b.length; j++) {
            bUp[i] += finalV[i][j]*b[j];
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
    var m = A.length;
    var mn = A[0].length;
    var AA = new Array(mn);

    for (let i = 0 ; i < mn; i++) {
        AA[i] = new Array(m);
    }

    for (let i = 0 ; i < m; i++) {
        for (let j = 0 ; j < mn; j++) {
            AA[j][i] = A[i][j];
        }
    }

    return AA;
}

/**
 * Extract the V matrix from the A matrix.
 * 
 * @param A   Constraint decision variable coefficient matrix.
 * @return    V
 */
function findV(A) {
    var m = A.length;
    var V = new Array(m);

    for (let i = 0 ; i < m ; i++) {
        V[i] = new Array(m);
        for (let j = 0; j < m ; j++) {
            V[i][j] = A[i][m+j-1];
        }
    }

    return V;
}