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
        alert(msg);
        shouldDie = true;
        return [A, b, cj, x, xB, shouldDie];
    } else if (newcRows.length != newACols[0].length) {
        var msg = "The number of elements in the c field does not equal the ";
        msg += "number of columns in the A field.";
        alert(msg);
        shouldDie = true;
        return [A, b, cj, x, xB, shouldDie];
    } else if (newcRows.length != newxRows.length) {
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
    tempStr += "Calculating new relevant entries of A using ";
    var texStr = "\\mathbf{t}_{j, \\mathrm{New}}^{(\\mathrm{final})} = V^{(\\mathrm{final})} \\mathbf{t}_{j, \\mathrm{New}}^{(0)}";
    tempStr += katex.renderToString(texStr);
    tempStr += ". ";

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
    var {A, cj, x, xB} = setToFinals();

    // Read new b from form
    var b = bUpdate(readb());

    // Initialize shouldDie Boolean
    var shouldDie = false;

    // New b array should have the same number of rows as A
    if (b.length != A.length) {
        shouldDie = true;
        alert("A and b do not match in their row length!");
        return [A, b, cj, x, xB, shouldDie];
    }

    // Mentioning what's happened since previous iterations of simplex
    tempStr += "Resource value(s) changed.<br/>";
    tempStr += "Updating the b column using the relationship: "
    texStr = "\\mathbf{b}^{(\\mathrm{final})}_{\\mathrm{New}} = ";
    texStr += "V^{(\\mathrm{final})}\\mathbf{b}_{\\mathrm{New}}^{(0)}";
    tempStr += katex.renderToString(texStr);
    tempStr += ". ";

    return [A, b, cj, x, xB, shouldDie];  
}