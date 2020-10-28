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
    var cj = readc();
    var x = finalx;

    // Mention what's happening in output
    tempStr += "Objective function coefficient(s) changed. ";

    return [A, b, xB, cj, x];
}

/**
 * Subtract multiplier*ARow from newARow. 
 * 
 * @param newARow    New row to be added to A.
 * @param ARow       Row of A we are subtracting from newARow
 * @param multiplier What ARow is to be multiplied before it is subtracted 
 * from newARow.
 * @return           Corrected newARow.
 */
function correctionOp(newARow, ARow, multiplier) {
    // Correct newARow by subtracting ARow*multiplier from it
    for (let i = 0; i < newARow.length; i++) {
        newARow[i] -= ARow[i]*multiplier;
    }

    return newARow;
}

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
    var newARows = readA();
    var newbRows = readb();
    var newcRows = readc();
    var newxBrows = readxB();

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
    
    // Correct newARows and newbRows so that they can be added to the final 
    // tableau
    var loc = basisIndex(x, xB);
    for (let i = 0; i < newARows.length; i++) {
        var newARow = newARows[i];
        // Loop over loc, looking for a column in newARow that's for a basis 
        // variable and is non-zero. Correct newARow and newbRow accordingly.
        for (let j = 0; j < loc.length; j++) {
            var ARow = A[j];
            var basisCol = loc[j];
            // Entry in the basis column on ith row
            var basisEl = newARow[basisCol];
            if ( basisEl != 0) {
                // From newARow subtract ARow[j]*basisEl
                newARows[i] = correctionOp(newARow, ARow, basisEl);
                newbRows[i] -= basisEl*b[j];
             }
        }
    }

    // New constraint elements to A, b, xB, x and cj
    for (let i = 0; i < newARows.length; i++) {
        A.push(newARows[i]);
        b.push(newbRows[i]);
        xB.push(newxBrows[i]);
        x.push(newxBrows[i]);
        cj.push(newcRows[i]);
    }

    // Mention what's happening in output
    tempStr += "Adding new constraint(s). ";

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
    var b = readb();
    var xB = finalxB;
    var cj = finalcj;
    var x = finalx;
    var b = matMult(finalV, b);

    // Mentioning what's happened since previous iterations of simplex
    tempStr += "Resource value(s) changed. ";

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
    var A = readA();
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
                    var msg = "If the coefficients of basic variables change,";
                    msg += " you must solve the problem from scratch again!";
                    alert(msg);
                    return [A, b, cj, x, xB, true];
                }
            }
        }
    }
    var A = transpose(finalAT);

    // Mention what's changed since previous iterations of simplex
    tempStr += "Constraint coefficient(s) have changed. ";

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
    var newACols = readA();
    var newcCols = readc();
    var newxRows = readx();
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
    tempStr += "Adding new variable(s). ";

    return [A, b, xB, cj, x];
}
