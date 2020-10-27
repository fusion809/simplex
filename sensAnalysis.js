/**
 * Change objective function coefficients.
 * 
 * @params    None.
 * @return    [A, b, xB, cj, x]
 */
function objectiveChange() {
    // Set globals
    var A = finalA;
    var b = finalb;
    var xB = finalxB;
    var cj = findc();
    var x = finalx;

    // Mention what's happening in output
    tempStr += "Objective function coefficient changed. ";

    return [A, b, xB, cj, x];
}

function subtractRow(row1, row2, scalarMult) {
    for (let i = 0 ; i < row1.length; i++) {
        row1[i] -= scalarMult*row2[i];
    }
    return row1;
}

function uncorrected(newARows, loc) {
    var coords = [];

    for (let i = 0 ; i < newARows.length; i++) {
        for (let j = 0 ; j < loc.length; j++) {
            var lloc = loc[j];
            if (newARows[i][lloc] != 0) {
                coords.push([i, j, newARows[i][lloc]]);
            }
        }
    }

    return coords;
}

// Part of attempt to allow unmodified constraints to be added
// var R1;
// var R2;
// var scal;
// var newAR;
// var NAInd;

/**
 * Add new constraint.
 * 
 * @params    None.
 * @return    [A, b, xB, cj, x]
 */
function newConstraint() {
    // Set globals
    var A = finalA;
    var b = finalb;
    var xB = finalxB;
    var cj = finalcj;
    var x = finalx;
    var newARows = findA();
    var newbRows = findb();
    var newcRows = findc();
    var newxBrows = findxB();

    // If the number of rows to be added to A and b do not match, return an
    // error
    if (newARows.length != newbRows.length) {
        alert("An equal number of rows must be added to A and b");
    }

    // Adds new column to existing A matrix
    for (let i = 0; i < A.length; i++) {
        for (let j = 0; j < newbRows.length; j++) {
            A[i].push(0);
        }
    }
    
    // Attempt at adding support for multiple new unmodified constraints
    // Failed as newARows for some reason was full of NaNs
    // newAR = newARows;
    // var loc = basisIndex(x, xB);
    // var coords = uncorrected(newARows, loc);
    // for (let i = 0 ; i < coords.length; i++) {
    //     var [newARowsIndex, ARowIndex, pivotElement] = coords[i];
    //     if (i == 0) {
    //         NAInd = newARowsIndex;
    //         R1 = newARows[newARowsIndex];
    //         R2 = A[ARowIndex];
    //         scal = pivotElement;
    //     }
    //     newARows[newARowsIndex] = subtractRow(newARows[newARowsIndex], 
    // A[ARowIndex], pivotElement);
    //     newbRows[newARowsIndex] -= pivotElement*b[ARowIndex];
    //     console.log(newARows[newARowsIndex]);
    // }

    // console.log(newARows);
    // console.log(newbRows);
    // New constraint elements to A, b, xB, x and cj
    for (let i = 0; i < newARows.length; i++) {
        A.push(newARows[i]);
        b.push(newbRows[i]);
        xB.push(newxBrows[i]);
        x.push(newxBrows[i]);
        cj.push(newcRows[i]);
    }

    // Mention what's happening in output
    tempStr += "Adding new constraint. ";

    return [A, b, xB, cj, x];
}

/**
 * Change RHS of constraints.
 * 
 * @params    None.
 * @return    [A, b, xB, cj, x]
 */
function resourceChange() {
    // Set globals
    var A = finalA;
    var b = findb();
    var xB = finalxB;
    var cj = finalcj;
    var x = finalx;
    var b = matMult(finalV, b);

    // Mentioning what's happened since previous iterations of simplex
    tempStr += "Resource value changed. ";

    return [A, b, xB, cj, x];
}

/**
 * Change constraint coefficients.
 * 
 * @params    None. Gets all its data from globals and the form.
 * @return    [A, b, xB, cj, x, shouldDie]. shouldDie decides whether simplex 
 * will exit.
 */
function constrCoeffsChange() {
    // Set globals
    var A = findA();
    // Easier to work with transposes, as the first and easiest elements to 
    // obtain pertain are columns of the original matrix.
    var AT = transpose(A);
    var finalAT = transpose(finalA);
    // Gather dimensionality info
    var m = A.length;
    var mn = A[0].length;
    // Obtain current arrays from the last iteration of simplex
    var b = finalb;
    var xB = finalxB;
    var cj = finalcj;
    var x = finalx;
    // Determine the location of basis variables within x
    var loc = basisIndex(x, xB);

    // Multiply non-basis elements of A by V from final simplex iteration
    for (let j = 0; j < mn; j++) {
        if (!find(loc, j)) {
            finalAT[j] = matMult(finalV, AT[j]);
        } else {
            for (let i = 0; i < m; i++) {
                if (AT[j][i] != initialAT[j][i]) {
                    // Return an error if elements of A corresponding to basis 
                    // variables have been modified
                    var msg = "If the coefficients of basic variables change, ";
                    msg += "you must solve the problem from scratch again!";
                    alert(msg);
                    return [A, b, cj, x, xB, true];
                }
            }
        }
    }
    var A = transpose(finalAT);

    // Mention what's changed since previous iterations of simplex
    tempStr += "Constraint coefficients have changed. ";

    return [A, b, xB, cj, x, false];
}

/**
 * Adding new variable
 * 
 * @params    None.
 * @return    [A, b, xB, cj, x]
 */
function addVariable() {
    // Set globals
    var A = finalA;
    var m = A.length;
    var mn = A[0].length;
    var n = mn - m;
    var b = finalb;
    var xB = finalxB;
    var cj = finalcj;
    var x = finalx;
    var newACols = findA();
    var newcCols = findc();
    var newxRows = findx();
    var newAColsCor = matMult(finalV, newACols);

    // Adds new columns to A just before the slack variables
    for (let i = 0; i < A.length; i++) {
        for (let j = 0; j < newACols[0].length; j++) {
            A[i].splice(n+j, 0, newAColsCor[i][j]);
        }
    }

    // Adds new elements to cj and x
    for (let j = 0; j < newcCols.length; j++) {
        cj.splice(n+j, 0, newcCols[j]);
        x.splice(n+j, 0, newxRows[j]);
    }

    // Print message letting the user know what is being computed
    tempStr += "Adding new variable. ";

    return [A, b, xB, cj, x];
}
