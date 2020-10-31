/**
 * Adding new variable
 * 
 * @params    None.
 * @return    [A, b, cj, x, xB, shouldDie]
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
    var newACols2 = readA();
    var newcRows = readc();
    var newxRows = readx();
    var newAColsCor = matMult(finalV, newACols);
    var shouldDie = false;

    // Test dimensionality of newACols
    if (newACols.length != m) {
        var msg = "The newly entered A does not have the same number of ";
        msg += "rows as the original A";
        alert(msg);
        shouldDie = true;
        return [A, b, cj, x, xB, shouldDie];
    }

    if (newcRows.length != newACols[0].length) {
        var msg = "The number of elements in the c field does not equal the ";
        msg += "number of columns in the A field.";
        alert(msg);
        shouldDie = true;
        return [A, b, cj, x, xB, shouldDie];
    }

    if (newcRows.length != newxRows.length) {
        var msg = "The number of elements in the c field does not equal the ";
        msg += "number of elements in the x field.";
        alert(msg);
        shouldDie = true;
        return [A, b, cj, x, xB, shouldDie];
    }

    // Adds new columns to A just before the slack variables
    for (let i = 0; i < A.length; i++) {
        for (let j = 0; j < newACols[0].length; j++) {
            A[i].splice(n+j, 0, newAColsCor[i][j]);
            initialA[i].splice(n+j, 0, newACols2[i][j]);
        }
    }

    // Adds new elements to cj and x
    for (let j = 0; j < newcRows.length; j++) {
        cj.splice(n+j, 0, newcRows[j]);
        x.splice(n+j, 0, newxRows[j]);
    }

    // Print message letting the user know what is being computed
    tempStr += "Adding new variable(s). ";

    return [A, b, cj, x, xB, shouldDie];
}

/**
 * Change constraint coefficients.
 * 
 * @params    None. Gets all its data from globals and the form.
 * @return    [A, b, cj, x, xB, shouldDie]. shouldDie decides whether simplex 
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
    var shouldDie = false;
    initialAT = transpose(initialA);

    // Dimensions of A in the form and finalA must match
    if ( (A.length != finalA.length) || (A[0].length != finalA[0].length) ) {
        shouldDie = true;
        var msg = "The dimensions of the new A do not match the dimensions";
        msg += " of A in the final tableau.";
        alert(msg);
        return [A, b, cj, x, xB, shouldDie];
    }

    // Multiply non-basis elements of A by V from final simplex iteration
    for (let j = 0; j < mn; j++) {
        // V matrix to update non-basis variable coefficients in A
        if (!find(loc, j)) {
            finalAT[j] = matMult(finalV, AT[j]);
        } else {
            // Test for whether basis variable coeffs have changed
            for (let i = 0; i < m; i++) {
                if (AT[j][i] != initialAT[j][i]) {
                    // Return an error if elements of A corresponding to basis 
                    // variables have been modified
                    var msg = "If the coefficients of basic variables change,";
                    msg += " you must solve the problem from scratch again!";
                    alert(msg);
                    shouldDie = true;
                    return [A, b, cj, x, xB, shouldDie];
                }
            }
        }
    }
    var A = transpose(finalAT);

    // Mention what's changed since previous iterations of simplex
    tempStr += "Constraint coefficient(s) have changed. ";

    return [A, b, cj, x, xB, shouldDie];
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
 * @return    [A, b, cj, x, xB, shouldDie]
 */
function newConstraint() {
    // Set globals
    var [A, b, cj, x, xB] = setVarsToFinal();
    var shouldDie = false;
    var newARows = readA();
    var newARows2 = readA();
    var newbRows = readb();

    // If the number of rows to be added to A and b do not match, return an
    // error
    if (newARows.length != newbRows.length) {
        shouldDie = false;
        alert("An equal number of rows must be added to A and b!");
        return [A, b, cj, x, xB, shouldDie];
    }

    // Adds new column to existing A matrix
    for (let i = 0; i < A.length; i++) {
        for (let j = 0; j < newbRows.length; j++) {
            // Add coefficients for new slack variables to existing A and 
            // initialA rows
            A[i].push(0);
            initialA[i].push(0);
        }
    }

    // Determine column indices corresponding to basis variables
    var loc = basisIndex(x, xB);

    // Loop over each new A row
    for (let i = 0; i < newARows.length; i++) {
        // Define newARow for this iteration, add it uncorrected to initialA
        // then add corrected versions to A and corrected b values to the b
        // array
        var newARow = newARows[i];
        initialA.push(newARows2[i]);

        // Loop over basis variable columns, looking for a column in newARow 
        // that's for a basis variable and is non-zero. Correct newARow and 
        // newbRow accordingly.
        for (let j = 0; j < loc.length; j++) {
            var ARow = A[j];
            var basisCol = loc[j];
        
            // Entry in the basis column on ith row
            var basisEl = newARow[basisCol];

            // If basisEl is non-zero, make it zero using row operations
            if ( basisEl != 0) {
                // From newARow subtract ARow[j]*basisEl
                newARows[i] = correctionOp(newARow, ARow, basisEl);
                newbRows[i] -= basisEl*b[j];
             }
        }
    }

    // New constraint elements to A, b, xB, x and cj
    [A, b, cj, x, xB] = addConstr(A, b, cj, x, xB, newARows, newbRows);

    // Mention what's happening in output
    tempStr += "Adding new constraint(s). ";

    return [A, b, cj, x, xB, shouldDie];
}

/**
 * Add new constraint rows to A, b, cj, x and xB
 * 
 * @param A        2d array of constraint coefficients.
 * @param b        1d array of resource values (RHS of constraints).
 * @param cj       1d array of objective function coefficients.
 * @param x        1d array of decision variables.
 * @param xB       1d array of basis variables.
 * @param newARows 2d array of new rows to be added to A (corrected).
 * @param newbRows 1d array of new rows to be added to b (corrected).
 * @return         [A, b, cj, x, xB]
 */
function addConstr(A, b, cj, x, xB, newARows, newbRows) {
    // Add new constraints
    for (let i = 0; i < newARows.length; i++) {
        A.push(newARows[i]);
        b.push(newbRows[i]);
        // Slack variables have zero objective function coefficients
        cj.push(0);
        // Add new slack variables
        var newSlackVar = newSlackVariable(x);
        x.push(newSlackVar);
        xB.push(newSlackVar);
    }

    return [A, b, cj, x, xB];
}

/**
 * Change objective function coefficients.
 * 
 * @params    None.
 * @return    [A, b, cj, x, xB, shouldDie]
 */
function objectiveChange() {
    // Set globals
    var A = finalA;
    var b = finalb;
    var xB = finalxB;
    var cj = readc();
    var x = finalx;
    var shouldDie = false;

    // The number of objective function coefficients should equal the number 
    // of decision variables
    if (cj.length != x.length) {
        shouldDie = true;
        alert("c and x do not match in length!");
        return [A, b, cj, x, xB, shouldDie];        
    }

    // Mention what's happening in output
    tempStr += "Objective function coefficient(s) changed. ";

    return [A, b, cj, x, xB, shouldDie];
}

/**
 * Change RHS of constraints.
 * 
 * @params    None.
 * @return    [A, b, cj, x, xB, shouldDie]
 */
function resourceChange() {
    // Set globals
    var A = finalA;
    var b = readb();
    var xB = finalxB;
    var cj = finalcj;
    var x = finalx;
    var b = matMult(finalV, b);
    var shouldDie = false;

    // New b array should have the same number of rows as A
    if (b.length != A.length) {
        shouldDie = true;
        alert("A and b do not match in their row length!");
        return [A, b, cj, x, xB, shouldDie];
    }

    // Mentioning what's happened since previous iterations of simplex
    tempStr += "Resource value(s) changed. ";

    return [A, b, cj, x, xB, shouldDie];  
}