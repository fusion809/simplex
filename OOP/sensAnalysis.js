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
 * @param newcRows 1d array of new elements to be added to c.
 * @return         [A, b, cj, x, xB]
 */
function addConstr(A, b, cj, x, xB, newARows, newbRows, newcRows) {
    // Add new constraints
    for (let i = 0; i < newARows.height; i++) {
        A.matrix.push(newARows.matrix[i]);
        b.matrix.push(newbRows.matrix[i]);
        // Slack variables have zero objective function coefficients
        if (document.getElementById("newcRows").checked) {
            cj.matrix.push(newcRows.matrix[i]);
        } else {
            cj.matrix.push(0);
        }
        // Add new slack variables
        var newSlackVar = newSlackVariable(x);
        x.matrix.push(newSlackVar);
        xB.matrix.push(newSlackVar);
    }

    return [A, b, cj, x, xB];
}

/**
 * Adding new variable
 * 
 * @params    None.
 * @return    [A, b, cj, x, xB, shouldDie]
 */
function addVariable() {
    // Read variables from globals
    var A = finalA;
    var m = A.height;
    var mn = A.width;
    var n = A.dimDiff;
    var b = finalb;
    var xB = finalxB;
    var cj = finalcj;
    var x = finalx;

    // Collect new variables from the form
    var newACols = readA();
    var newACols2 = readA();
    var newcRows = readc();
    var newxRows = readx();

    // Correct new A columns using the final V matrix, so that they can be
    // added to the new tableau
    var newAColsCor = finalV.mult(newACols);

    // Initialize the shouldDie Boolean
    var shouldDie = false;

    // Dimensionality tests
    if (newACols.height != m) {
        var msg = "The newly entered A does not have the same number of ";
        msg += "rows as the original A";
        alert(msg);
        shouldDie = true;
        return [A, b, cj, x, xB, shouldDie];
    } else if (newcRows.height != newACols.width) {
        var msg = "The number of elements in the c field does not equal the ";
        msg += "number of columns in the A field.";
        alert(msg);
        shouldDie = true;
        return [A, b, cj, x, xB, shouldDie];
    } else if (newcRows.height != newxRows.height) {
        var msg = "The number of elements in the c field does not equal the ";
        msg += "number of elements in the x field.";
        alert(msg);
        shouldDie = true;
        return [A, b, cj, x, xB, shouldDie];
    }

    // Adds new columns to A just before the slack variables
    for (let i = 0; i < A.height; i++) {
        for (let j = 0; j < newACols.width; j++) {
            A.matrix[i].splice(n+j, 0, newAColsCor.matrix[i][j]);
            initialA.matrix[i].splice(n+j, 0, newACols2.matrix[i][j]);
        }
    }

    // Adds new elements to cj and x
    for (let j = 0; j < newcRows.height; j++) {
        cj.matrix.splice(n+j, 0, newcRows.matrix[j]);
        x.matrix.splice(n+j, 0, newxRows.matrix[j]);
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
    // obtain pertain to columns of the original matrix.
    var AT = A.transpose();
    var finalAT = finalA.transpose();
    initialAT = initialA.transpose();
    
    // Gather dimensionality info
    var m = A.height;
    var mn = A.width;
    var finm = finalA.height;
    var finmn = finalA.width;
    
    // Obtain current arrays from the last iteration of simplex
    var b = finalb;
    var xB = finalxB;
    var cj = finalcj;
    var x = finalx;
    
    // Determine the location of basis variables within x
    var loc = x.location(xB);

    // Initialize shouldDie Boolean
    var shouldDie = false;

    // Dimensions of A in the form and finalA must match
    if ( (m != finm) || (mn != finmn) ) {
        shouldDie = true;
        var msg = "The dimensions of the new A do not match the dimensions";
        msg += " of A in the final tableau.";
        alert(msg);
        return [A, b, cj, x, xB, shouldDie];
    }

    // Multiply non-basis elements of A by V from final simplex iteration
    for (let j = 0; j < mn; j++) {
        // V matrix to update non-basis variable coefficients in A
        if (!loc.find(j)) {
            var ATj = new Matrix(AT.matrix[j]);
            finalAT.matrix[j] = (finalV.mult(ATj)).matrix;
        } else {
            // Test for whether basis variable coeffs have changed
            for (let i = 0; i < m; i++) {
                if (AT.matrix[j][i] != initialAT.matrix[j][i]) {
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
    var A = finalAT.transpose();

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
    
    // Read new entries from form
    var newARows = readA();
    var newARows2 = readA();
    var newbRows = readb();
    var newcRows = readc();

    // Initialize shouldDie Boolean
    var shouldDie = false;
    var isNewcRows = document.getElementById("newcRows").checked

    // If the number of rows to be added to A and b do not match, return an
    // error
    if (newARows.height != newbRows.height) {
        shouldDie = true;
        alert("An equal number of rows must be added to A and b!");
        return [A, b, cj, x, xB, shouldDie];
    }

    // Return an error if the number of elements in newcRows does not match
    // the number of elements in newbRows and the newcRows box is ticked
    if ( (newcRows.height != newbRows.height ) && isNewcRows) {
        shouldDie = true;
        alert("The number of new b rows and new entries in c must match!");
        return [A, b, cj, x, xB, shouldDie];
    }

    // Return an error if the columns in newARows does not match the number of
    // columns in A plus the number of rows in newARows
    if (newARows.width != A.width + newARows.height) {
        shouldDie = true;
        var msg = "Remember your new A rows must have a number of columns ";
        msg += "equal to that of the old A matrix plus the number of new ";
        msg += "constraints!";
        alert(msg);
        return [A, b, cj, x, xB, shouldDie];
    }

    // Adds new column to existing A matrix
    for (let i = 0; i < A.height; i++) {
        for (let j = 0; j < newbRows.height; j++) {
            // Add coefficients for new slack variables to existing A and 
            // initialA rows
            A.matrix[i].push(0);
            initialA.matrix[i].push(0);
        }
    }

    // Determine column indices corresponding to basis variables
    var loc = x.location(xB);

    // Loop over each new A row
    for (let i = 0; i < newARows.height; i++) {
        // Define newARow for this iteration, add it uncorrected to initialA
        // then add corrected versions to A and corrected b values to the b
        // array
        var newARow = newARows.matrix[i];
        initialA.matrix.push(newARows2.matrix[i]);

        // Loop over basis variable columns looking for a column in newARow
        // that's for a basis variable and is non-zero. Correct newARow and 
        // newbRow accordingly.
        for (let j = 0; j < loc.height; j++) {
            var ARow = A.matrix[j];
            var basisCol = loc.matrix[j];
        
            // Entry in the basis column on ith row
            var basisEl = newARow[basisCol];

            // If basisEl is non-zero, make it zero using row operations
            if ( basisEl != 0) {
                // From newARow subtract ARow[j]*basisEl
                newARows.matrix[i] = correctionOp(newARow, ARow, basisEl);
                newbRows.matrix[i] -= basisEl*b.matrix[j];
             }
        }
    }

    // New constraint elements to A, b, xB, x and cj
    [A, b, cj, x, xB] = addConstr(A, b, cj, x, xB, newARows, newbRows, newcRows);

    // Mention what's happening in output
    tempStr += "Adding new constraint(s). ";

    return [A, b, cj, x, xB, shouldDie];
}

/**
 * Change objective function coefficients.
 * 
 * @params    None.
 * @return    [A, b, cj, x, xB, shouldDie]
 */
function objectiveChange() {
    // Set globals to values from final iteration of simplex
    var A = finalA;
    var b = finalb;
    var xB = finalxB;
    var x = finalx;

    // Obtain new cj from form
    var cj = readc();

    // Initialize shouldDie Boolean
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
    // Set globals to values obtained from final iteration of simplex
    var A = finalA;
    var xB = finalxB;
    var cj = finalcj;
    var x = finalx;

    // Read new b from form
    var b = readb();

    // Find how b should be added to final tableau using the relationship:
    // b_{New}^{final} = V^{final} b_{New}^{(0)}
    var b = finalV.mult(b);

    // Initialize shouldDie Boolean
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