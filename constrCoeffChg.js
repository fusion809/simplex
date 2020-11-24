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
    
    // Determine the location of basis variables within x
    var loc = basisIndex(x, xB);

    // Initialize shouldDie Boolean
    var shouldDie = false;

    // Dimensions of A in the form and finalA must match
    constrCoeffsDimsChk(finm, finmn, m, mn);

    // Use t_{j, New}^{(final)} = V^{(final)} t_{j, New}^{(0)} iff user
    // didn't change coeffs for basis variables, otherwise throw error
    var A = updAAftCoeffChg(AT, finalAT, initialAT, loc, m, mn);

    // Mention what's changed since previous iterations of simplex
    constrCoeffsChgMsg();

    return [A, b, cj, x, xB, shouldDie];
}

/**
 * Add constraint coefficient change message to tempStr.
 * 
 * @params    None.
 * @return    Nothing.
 */
function constrCoeffsChgMsg() {
    tempStr += "Constraint coefficient(s) have changed.<br/>";
    tempStr += "Recalculating relevant entries of A using ";
    var texStr = "\\mathbf{t}_{j, \\mathrm{New}}^{(\\mathrm{final})} = V^{(\\mathrm{final})} \\mathbf{t}_{j, \\mathrm{New}}^{(0)}";
    tempStr += katex.renderToString(texStr);
    tempStr += ". ";
}

/**
 * Compare dimension variables for new A and finalA and throw an error if they
 * do not match.
 * 
 * @param finm     Number of rows in finalA.
 * @param finmn    Number of columns in finalA.
 * @param m        Number of rows in newly entered A.
 * @param mn       Number of columns in newly entered A.
 * @return         Nothing.
 */
function constrCoeffsDimsChk(finm, finmn, m, mn) {
    if ( (m != finm) || (mn != finmn) ) {
        var msg = "The dimensions of the new A do not match the dimensions";
        msg += " of A in the final tableau.";
        alert(msg);
        throw console.error(msg);
    }
}

/**
 * Check if basis variable constraint coefficients have changed.
 * 
 * @param AT            Transpose of A as it appears in the form.
 * @param finalAT       Transpose of A at last iteration of simplex.
 * @param initialAT     Transpose of A for the problem before solving.
 * @param loc           1d array of basis variable column indices.
 * @param m             Number of rows in A.
 * @param mn            Number of columns in A.
 * @return              Nothing.
 */
function updAAftCoeffChg(AT, finalAT, initialAT, loc, m, mn) {
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
                    throw console.error(msg);
                }
            }
        }
    }

    // Return transpose of corrected array
    return transpose(finalAT);
}