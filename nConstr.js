/**
 * Add new constraint(s) to arrays of the final iteration of simplex.
 * 
 * @param A             Array of constraint coefficients in final tableau.
 * @param b             Array of resource values.
 * @param cj            Array of objective function coefficients.
 * @param x             Array of decision variables (including slack variables).
 * @param xB            Array of basis variables.
 * @param newARows      New constraint coefficient rows.
 * @param newbRows      Resource values for new constraints.
 * @param newcEnt       New objective function coefficients to be added. Only
 * used if newcEnt radio button has been clicked.
 * @param newARows2     Same as newARows, used to update initialA, optional.
 * @return              Updated [A, b, cj, x, xB]
 */
function addConstr(A, b, cj, x, xB, newARows, newbRows, newcEnt, newARows2) {
    // Adds new column(s) to existing A matrix for new slack(s)
    for (let i = 0; i < A.length; i++) {
        for (let j = 0; j < newbRows.length; j++) {
            // Add coefficients for new slack variables to existing A and 
            // initialA rows
            A[i].push(0);
            initialA[i].push(0);
        }
    }

    // Correct constraints
    [newARows, newbRows] = correctConstr(A, b, x, xB, newARows, newbRows, newARows2);

    // Add new constraint elements to A, b, cj, x and xB
    [A, b, cj, x, xB] = addToArrs(A, b, cj, x, xB, newARows, newbRows, newcEnt);

    return [A, b, cj, x, xB];
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
 * @param newcEnt  1d array of new elements to be added to c.
 * @return         [A, b, cj, x, xB]
 */
function addToArrs(A, b, cj, x, xB, newARows, newbRows, newcEnt) {
    // Add new constraints
    for (let i = 0; i < newARows.length; i++) {
        A.push(newARows[i]);
        b.push(newbRows[i]);

        // Slack variables have zero objective function coefficients
        if (document.getElementById("newcRows").checked) {
            cj.push(newcEnt[i]);
        } else {
            cj.push(0);
        }

        // Add new slack variables
        var newSlackVar = newSlackVariable(x);

        // Add to x and xB
        x.push(newSlackVar);
        xB.push(newSlackVar);
    }

    return [A, b, cj, x, xB];
}

/**
 * Correct constraints, making them able to be added to the final tableau.
 * 
 * @param A             Array of constraint coefficients in final tableau.
 * @param b             Array of resource values.
 * @param x             Array of decision variables (including slack variables).
 * @param xB            Array of basis variables.
 * @param newARows      New constraint coefficient rows.
 * @param newbRows      Resource values for new constraints.
 * @param newARows2     Same as newARows, used to update initialA, optional.
 * @return              [newARows, newbRows]
 */
function correctConstr(A, b, x, xB, newARows, newbRows, newARows2) {
    // Determine column indices corresponding to basis variables
    var loc = basisIndex(x, xB);

    // Loop over each new A row
    for (let i = 0; i < newARows.length; i++) {

        // Define newARow for this iteration, add it uncorrected to initialA
        // then add corrected versions to A and corrected b values to the b
        // array
        var newARow = newARows[i];
        var texStr = "R_{" + (A.length + i + 1) + "}";
        if (newARows2 != undefined) {
            initialA.push(newARows2[i]);
        }

        // Loop over basis variable columns looking for a column in newARow
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
                if (basisEl == 1) {
                    texStr += " - R_{" + (j+1) + "}";
                } else if (basisEl == -1) {
                    texStr += " + R_{" + (j+1) + "}";
                } else if (basisEl > 0) {
                    texStr += " - " + decimalToFrac(basisEl) + "R_{" + (j+1) 
                    + "}";
                } else if (basisEl < 0) {
                    texStr += " + " + decimalToFrac(-basisEl) + "R_{" + (j+1) 
                    + "}";
                }

                // Row corrections
                newARows[i] = correctionOp(newARow, ARow, basisEl);
                newbRows[i] -= basisEl*b[j];
             }
        }
        
        // Right arrow and RHS
        texStr += "\\rightarrow R_{" + (A.length + i + 1) + "}'"

        // Render
        tempStr += katex.renderToString(texStr);
        tempStr += "<br/>";
    }
    return [newARows, newbRows];
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
    var {A, b, cj, x, xB} = setToFinals();
    
    // Read new entries from form
    var newARows = readA();
    var newARows2 = readA();
    var newbRows = readb();
    var newcEnt = readc();

    // Initialize shouldDie Boolean
    var shouldDie = false;

    // If the number of rows to be added to A and b do not match, return an
    // error
    if (newARows.length != newbRows.length) {
        shouldDie = true;
        alert("An equal number of rows must be added to A and b!");
        return [A, b, cj, x, xB, shouldDie];
    }

    // Return an error if the number of elements in newcEnt does not match
    // the number of elements in newbRows and the newcEnt box is ticked
    if ( (newcEnt.length != newbRows.length ) && 
    document.getElementById("newcRows").checked) {
        shouldDie = true;
        var msg = "The number of new b rows and new entries in c must match!";
        alert(msg);
        return [A, b, cj, x, xB, shouldDie];
    }

    // Return an error if the columns in newARows does not match the number of
    // columns in A plus the number of rows in newARows
    if (newARows[0].length != A[0].length + newARows.length) {
        shouldDie = true;
        var msg = "Remember your new A rows must have a number of columns ";
        msg += "equal to that of the old A matrix plus the number of new ";
        msg += "constraints!";
        alert(msg);
        return [A, b, cj, x, xB, shouldDie];
    }

    // Mention what's happening in output
    tempStr += "<br/>Adding new constraint(s). First step is to correct newly ";
    tempStr += "rows using row operations so that they can be added to the ";
    tempStr += "final tableau.<br/>";

    // Add new row(s) to A and b and new elements to cj, x and xB
    [A, b, cj, x, xB] = addConstr(A, b, cj, x, xB, newARows, newbRows, 
        newcEnt, newARows2);

    return [A, b, cj, x, xB, shouldDie];
}