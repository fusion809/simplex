/**
 * Check the dimensions of specified arrays to ensure they match.
 * 
 * @param A   2d array of constraint coefficients.
 * @param b   1d array of constraint RHS.
 * @param cj  1d array of objective function coefficients.
 * @param x   1d array of decision variables as strings (including slacks).
 * @param xB  1d array of basis variables as they appear in the tableau.
 * @return    Nothing.
 */
function dimsCheck(A, b, cj, x, xB) {
    if (b.length != xB.length ) {
        alert("The lengths of b and xB do not match!");
        return;
    } else if (A.length != b.length) {
        var msg = "The number of rows in A does not match the number of rows";
        msg += "in b!";
        alert(msg);
        return;
    } else if (A.length != xB.length) {
        var msg = "xB has a number of elements that exceeds the number of";
        msg += " elements in A!";
        alert(msg);
        return;
    } else if (A[0].length != x.length) {
        var msg = "A has a number of columns that exceeds the number of";
        msg += " elements in x!";
        alert(msg);
        return;
    } else if (A[0].length != cj.length) {
        var msg = "A has a number of columns that exceeds the number of ";
        msg += "elements in c."
        alert(msg);
        return; 
    }
}

/**
 * Determines the dimensions of the problem being solved.
 * 
 * @param A   Constraint coefficient matrix as 2d array.
 * @return    Object containing height of A, width of A and difference 
 * between them.
 */
function getDims(A) {
    // Determine dimensions
    var m = A.length;
    var mn = A[0].length;
    var n = mn - m;

    // Return them
    return {m: m, mn: mn, n: n};
}

/**
 * Multiply square matrix by column this.matrixtor
 * 
 * @param V        2d array representing a matrix.
 * @param b        1d/2d array.
 * @return         Matrix product between V and b
 */
function matMult(V, b) {
    // Initialize dimensionality variables
    var m = getDims(V).m;
    var n = b[0].length;

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

    // Return matrix product
    return bUp;
}

/**
 * Convert array into matrix object.
 * 
 * @param arr      Array.
 * @return         Matrix object with attributes matrix, height and width.
 */
function Matrix(arr) {
    // Variable declarations
    this.matrix = arr;
    this.height = arr.length;
    if (arr[0].length == undefined) {
        this.width = 1;
    } else {
        this.width = arr[0].length;
    }
    // Difference between width and height of matrix, equal to the number of 
    // decision variables
    this.dimDiff = this.width - this.height;

    // Find where target is found within matrix
    this.find = function(target) {
        for (let i = 0; i < this.height; i++) {
            if (this.matrix[i] == target) {
                return true;
            }
        }
        return false;
    }

    // Location of where arr2 elements are found in current matrix object
    this.location = function(arr2) {
        var loc = new Array(arr2.height);

        // Loop over basis variables
        for (let i = 0; i < this.height; i++) {
            // Loop over decision variables
            for (let j = 0; j < arr2.height; j++) {    
                // Record where in x each entry in xB is found
                if (this.matrix[i] == arr2.matrix[j]) {
                    loc[j] = i;
                    break;
                }
            }
        }

        // Return array of locations
        return new Matrix(loc);
    }

    // Index of minimum element in array; isNonNeg specifies if element must be
    // positive
    this.minEl = function(isNonNeg) {
        var index = 0;
        var min = Number.POSITIVE_INFINITY;
        for (let i = 0; i < this.height; i++) {
            if ((this.matrix[i] < min) && (!isNonNeg || this.matrix[i] >= 0)) {
                min = this.matrix[i];
                index = i;
            }
        }
        return index;
    }

    // Right-multiply matrix with arr2
    this.mult = function(arr2) {
        var result = new Array(this.height);

        for (let i = 0; i < this.height; i++) {
            // Use a different algorithm for 2d arr2
            if (arr2.width > 1) {
                result[i] = new Array(arr2.width);
                for (let j = 0 ; j < arr2.width; j++) {
                    result[i][j] = 0;
                    for (let k = 0; k < this.width; k++) {
                        result[i][j] += this.matrix[i][k] * arr2.matrix[k][j];
                    }
                }
            } else {
                result[i] = 0;
                for (let k = 0; k < this.width; k++) {
                    result[i] += this.matrix[i][k] * arr2.matrix[k];
                }
            }
        }
        return new Matrix(result);
    }

    // Transpose matrix
    this.transpose = function() {
        var trans = new Array(this.width);
        for (let i = 0; i < this.width; i++) {
            trans[i] = new Array(this.height);
            for (let j = 0; j < this.height; j++) {
                trans[i][j] = arr[j][i];
            }
        }
        return new Matrix(trans);
    }
}

/**
 * Transpose a 2d array.
 * 
 * @param A   Matrix to transpose.
 * @return    A^T
 */
function transpose(A) {
    // Dimensionality info
    var {m, mn} = getDims(A);

    // Create transpose matrix
    var AT = new Array(mn);

    // Loop over columns in A
    for (let j = 0; j < mn; j++) {
        // Make it 2d
        AT[j] = new Array(m);

        // Loop over rows in A, make them columns in AT
        for (let i = 0; i < m; i++) {
            AT[j][i] = A[i][j];
        }
    }

    // Return transpose
    return AT;
}