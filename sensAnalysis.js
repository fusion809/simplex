/**
 * Adding new variable
 * 
 * @params    None.
 * @return    [A, b, cj, x, xB, shouldDie]
 */
function addVariable() {
    // Read variables from globals
    var {A, b, cj, x, xB} = setToFinals();
    var {m, n} = getDims(A);

    // Collect new variables from the form
    var newACols = readA();
    var newACols2 = readA();
    var newcRows = readc();
    var newxRows = readx();

    // Correct new A columns using the final V matrix, so that they can be
    // added to the new tableau
    var newAColsCor = matMult(finalV, newACols);

    // Initialize the shouldDie Boolean
    var shouldDie = false;

    // Dimensionality tests
    if (newACols.length != m) {
        var msg = "The newly entered A does not have the same number of ";
        msg += "rows as the original A";
        console.error(msg);
        shouldDie = true;
        return [A, b, cj, x, xB, shouldDie];
    } else if (newcRows.length != newACols[0].length) {
        var msg = "The number of elements in the c field does not equal the ";
        msg += "number of columns in the A field.";
        console.error(msg);
        shouldDie = true;
        return [A, b, cj, x, xB, shouldDie];
    } else if (newcRows.length != newxRows.length) {
        var msg = "The number of elements in the c field does not equal the ";
        msg += "number of elements in the x field.";
        console.error(msg);
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
    // obtain pertain to columns of the original matrix.
    var AT = transpose(A);
    var finalAT = transpose(finalA);
    initialAT = transpose(initialA);
    
    // Gather dimensionality info
    var {m, mn} = getDims(A);
    var finm = getDims(finalA).m;
    var finmn = getDims(finalA).mn;
    
    // Obtain current arrays from the last iteration of simplex
    var {b, cj, x, xB} = setToFinals();
    console.log(b);
    console.log(xB);
    
    // Determine the location of basis variables within x
    var loc = basisIndex(x, xB);

    // Initialize shouldDie Boolean
    var shouldDie = false;

    // Dimensions of A in the form and finalA must match
    if ( (m != finm) || (mn != finmn) ) {
        shouldDie = true;
        var msg = "The dimensions of the new A do not match the dimensions";
        msg += " of A in the final tableau.";
        console.error(msg);
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
                    console.error(msg);
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
 * Change objective function coefficients.
 * 
 * @params    None.
 * @return    [A, b, cj, x, xB, shouldDie]
 */
function objectiveChange() {
    // Set globals to values from final iteration of simplex
    var {A, b, x, xB} = setToFinals();

    // Obtain new cj from form
    var cj = readc();

    // Initialize shouldDie Boolean
    var shouldDie = false;

    // The number of objective function coefficients should equal the number 
    // of decision variables
    if (cj.length != x.length) {
        shouldDie = true;
        console.error("c and x do not match in length!");
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
    var {A, cj, x, xB} = setToFinals();

    // Read new b from form
    var b = bUpdate(readb());

    // Initialize shouldDie Boolean
    var shouldDie = false;

    // New b array should have the same number of rows as A
    if (b.length != A.length) {
        shouldDie = true;
        console.error("A and b do not match in their row length!");
        return [A, b, cj, x, xB, shouldDie];
    }

    // Mentioning what's happened since previous iterations of simplex
    tempStr += "Resource value(s) changed. ";

    return [A, b, cj, x, xB, shouldDie];  
}

/**
 * Calculate b_{New}^{final} from finalV and b_{New}^{(0)}
 * 
 * @param b   Resource array.
 * @return    b_{New}^{final}
 */
function bUpdate(b) {
    // Find how b should be added to final tableau using the relationship:
    // b_{New}^{final} = V^{final} b_{New}^{(0)}
    return matMult(finalV, b); 
}

/**
 * Create parameter object containing all final arrays.
 * 
 * @return    That object.
 */
function setToFinals() {
    // Initialize parameter object
    var paramObj = {
        A: finalA,
        b: finalb,
        cj: finalcj,
        x: finalx,
        xB: finalxB,
    }

    return paramObj;
}