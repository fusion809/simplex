/**
 * Write A and b rows to tempStr.
 * 
 * @param A             Array of constraint coefficients.
 * @param b             Array containing solution column elements.
 * @param xB            Basis variable array.
 * @param cB            Array of cB column elements.
 * @param ratio         Ratio of b to pivot column elements.
 * @param pivotRIdx     Pivot row index.
 * @param pivotCIdx     Pivot column index.
 * @param bools         Object containing relevant Booleans.
 * @return              Nothing, writes data to tempStr.
 */
function AbRows(A, b, xB, cB, ratio, pivotRIdx, pivotCIdx, bools) {
    // Get required Booleans
    var {isFeas, isOptim, isPermInf, isUnbound, isAltSol, befAltSol} = bools;
    // Initialize dimensionality variables
    var [m, mn, n] = getDims(A);
    
    // Start row
    for (let i = 0; i < m; i++) {
        tempStr += "<tr>";
        tempStr += "<td>" + decimalToFrac(cB[i]) + "</td>";
        if (( pivotRIdx != i) || (isNaN(pivotCIdx)) || isPermInf || isUnbound 
        || isAltSol) {
            tempStr += subscripts(xB[i], {isBold: false, isLeftArrow: false, 
                isDownArrow: false, notRow: false});
        } else {
            tempStr += subscripts(xB[i], {isBold: true, isLeftArrow: true, 
                isDownArrow: false, notRow: false});
        }
        for (let j = 0; j < mn; j++) {
            tempStr += "<td>" + decimalToFrac(A[i][j]) + "</td>";
        }
        tempStr += "<td>" + decimalToFrac(b[i]) + "</td>";
        if (isFeas && !isOptim || befAltSol) {
            if (ratio[i] != Number.POSITIVE_INFINITY && ratio[i] >= 0) {
                tempStr += "<td>" + decimalToFrac(ratio[i]) + "</td>";
            } else {
                tempStr += "<td>NA</td>";
            }
        }
        tempStr += "</tr>";
    }
}

/**
 * Generate simplex tableau based on specified data.
 * 
 * @param A           Constraint coefficient in a 2d array.
 * @param b           RHS of the constraints in a 1d array.
 * @param cj          1d array of objective function coefficients.
 * @param x           1d array of decision variable names.
 * @param xB          1d array of basis variable names.
 * @param bools       Relevant Booleans that determine some of the 
 * characteristics of the tableau.
 * @param pivotCol    Pivot column.
 * @param ratio       Ratio array used to decide entering/departing variables.
 * @param pivotEl     Pivot element.
 * @param pivotRIdx   Pivot row index.
 * @param pivotCIdx   Pivot column index.
 * @return            Nothing, simply writes the tableaux to HTML.
 */
function genTableau(A, b, cj, x, xB, bools, pivotCol, ratio, pivotEl, pivotRIdx, pivotCIdx) {
    var [cB, z, zc] = calcEntries(A, b, cj, x, xB);
    var {isFeas, isOptim, isUnbound, isPermInf, isAltSol, befAltSol} = bools;

    // The following is to prevent departing/entering variable
    // indications from appearing in a final tableau
    if (xB[pivotRIdx] == x[pivotCIdx]) {
        pivotRIdx = NaN;
        pivotCIdx = NaN;
    }

    // Start tableau
    document.getElementById("tableau").innerHTML = "";
    tempStr += "<table>";

    // Objective function coefficient row
    objectiveRow(cj);

    // Header row
    headerRow(x, pivotCIdx, bools);

    // A & b rows
    AbRows(A, b, xB, cB, ratio, pivotRIdx, pivotCIdx, bools);

    // zj row
    zRow(pivotEl, isFeas, ratio, z);

    // zj-cj row
    zcRow(zc);

    // Ratio row
    ratRow(pivotEl, ratio, bools)

    // End tableau
    tempStr += "</table>";

    // Show row operations
    if (!isOptim && !isUnbound && !isNaN(pivotRIdx) && !isNaN(pivotEl) && 
    !isPermInf) {
        rowOperations(pivotRIdx, pivotCol, pivotEl);
    }
    writeTempStr();
}

/**
 * Write header row to tempStr.
 * 
 * @param x             x array containing decision variable names.
 * @param pivotCIdx     Pivot column index.
 * @param bools         Relevant Boolean values.
 * @return              Nothing, changes are written to the tempStr global.
 */
function headerRow(x, pivotCIdx, bools) {
    var {isFeas, isOptim, isPermInf, isAltSol, befAltSol} = bools;
    tempStr += "<tr>";
    tempStr += katexRow("c_{\\mathbf{B}}");
    tempStr += katexRow("x_{\\mathbf{B}}");
    for (let i = 0; i < x.length; i++) {
        if (i != pivotCIdx || isPermInf || isAltSol) {
            tempStr += subscripts(x[i], {isBold: false, isLeftArrow: false, 
                isDownArrow: false, notRow: false});
        } else {
            tempStr += subscripts(x[i], {isBold: true, isLeftArrow: false, 
                isDownArrow: true, notRow: false});
        }
    }
    tempStr += katexRow("\\mathbf{b}");
    if (isFeas && !isOptim || befAltSol) {
        tempStr += "<td>" + katex.renderToString("\\mathrm{Ratio}") + "</td>";
    }
    tempStr += "</tr>";
}

/**
 * Generate a row with the input string rendered with KaTeX.
 * 
 * @param str      String to render.
 * @return         Row HTML with KaTeX-rendered string.
 */
function katexRow(str) {
    return "<td>" + katex.renderToString(str) + "</td>";
}

/**
 * Write objective function row to tempStr.
 * 
 * @param cj  c array.
 * @return    Nothing. Writes objective function row to tempStr.
 */
function objectiveRow(cj) {
    tempStr += "<tr>";
    tempStr += "<td></td>";
    tempStr += katexRow("c_j");
    for (let i = 0; i < cj.length; i++) {
        tempStr += "<td>" + decimalToFrac(cj[i]) + "</td>";
    }
    tempStr += "</tr>";
}

/**
 * Adds ratio row to tempStr.
 * 
 * @param pivotEl       Pivot element.
 * @param ratio         Ratio of zj-cj to the elements of the pivot row.
 * @param bools         Object containing relevant Booleans.
 * @return              Nothing, the row is just written to tempStr.
 */
function ratRow(pivotEl, ratio, bools) {
    var {isFeas, isPermInf} = bools;
    if (ratio != undefined && !isNaN(pivotEl) && !isFeas && !isPermInf) {
        // Gathering dimensionality data
        var mn = ratio.length;

        // Start row
        tempStr += "<tr>";
        tempStr += "<td>" + katex.renderToString("\\mathrm{Ratio}") + "</td>";
        for (let i = 0; i < mn; i++) {
            if (ratio[i] != Number.POSITIVE_INFINITY) {
                tempStr += "<td>" + decimalToFrac(ratio[i]) + "</td>";
            } else {
                tempStr += "<td></td>";
            }
        }
        tempStr += "</tr>";
    }
}

/**
 * Remove simplex tableaux
 * @params    None.
 * @return    Nothing.
 */
function removeTableaux() {
    document.getElementById("tableau").innerHTML = "";
    tempStr = "";
}

/**
 * Show row operations.
 * 
 * @param pivotRIdx Pivot row index.
 * @param pivotCol  Pivot column.
 * @param pivotEl   Pivot element.
 * @return          Nothing, adds the row operations to tempStr.
 */
function rowOperations(pivotRIdx, pivotCol, pivotEl) {
    // Row numbers start at 1 not 0
    pivotRIdx++;

    // Initialize dimensionality variable
    var m = pivotCol.length;

    // Loop over rows and write the operations to be performed to them to 
    // tempStr
    for (let i = 0; i < m; i++) {
        // Pivot row operation
        if (pivotRIdx - 1 == i) {
            if (pivotEl == 1) {
                tempStr += "<div style='padding: 7px;'>" + katex.renderToString("R_{" + pivotRIdx +
                 "} \\rightarrow R_{" + pivotRIdx + "}^{'}") + "</div>";
            } else if (pivotEl == -1) {
                tempStr += "<div style='padding: 7px;'>" + katex.renderToString("-R_{" + pivotRIdx + 
                "} \\rightarrow R_{" + pivotRIdx + "}^{'}") + "</div>";
            } else {
                var fraction = math.fraction(1/pivotEl);
                if (fraction.d != 1) {
                    tempStr += "<div style='padding: 7px;'>" + katex.renderToString(sign(fraction.s) 
                    + "\\dfrac{" + fraction.n + "}{" + fraction.d + "}" + 
                    " R_{" + pivotRIdx + "} \\rightarrow R_{" + pivotRIdx + 
                    "}^{'}") + "</div>";
                } else {
                    tempStr += "<div style='padding: 7px;'>" + katex.renderToString(sign(fraction.s) 
                    + fraction.n + " R_{" + pivotRIdx + "} \\rightarrow R_{" 
                    + pivotRIdx + "}^{'}") + "</div>";
                }
            }
        } 
        // Row operations for non-pivot rows
        else {
            if (pivotCol[i] == -1) {
                tempStr += "<div style='padding: 7px;'>" + katex.renderToString("R_{" + (i + 1) + 
                "} + " + "R_{" + pivotRIdx + "}^{'} \\rightarrow R_{" + 
                (i + 1) + "}^{'}") + "</div>";
            } else if ( pivotCol[i] < 0) {
                var fraction = math.fraction(-pivotCol[i]);
                if (fraction.d != 1) {
                    tempStr += "<div style='padding: 7px;'>" + katex.renderToString("R_{" + (i + 1) +
                     "} + \\dfrac{" + fraction.n + "}{" + fraction.d + "} R_{" 
                     + pivotRIdx + "}^{'} \\rightarrow R_{" + (i + 1) + 
                     "}^{'}") + "</div>";
                } else {
                    tempStr += "<div style='padding: 7px;'>" + katex.renderToString("R_{" + (i + 1) + 
                    "} + " + fraction.n + "R_{" + pivotRIdx + 
                    "}^{'} \\rightarrow R_{" + (i + 1) + "}^{'}") + "</div>";
                }
            } else if (pivotCol[i] == 0) {
                tempStr += "<div style='padding: 7px;'>" + katex.renderToString("R_{" + (i + 1) + 
                "} \\rightarrow R_{" + (i + 1) + "}^{'}") + "</div>";
            } else if (pivotCol[i] == 1) {
                tempStr += "<div style='padding: 7px;'>" + katex.renderToString("R_{" + (i + 1) + 
                "} - " + "R_{" + pivotRIdx + "}^{'} \\rightarrow R_{" + 
                (i + 1) + "}^{'}") + "</div>";
            }
            // pivotCol[i] > 0 and not equal to 1
            else {
                var fraction = math.fraction(pivotCol[i]);
                if (fraction.d != 1) {
                    tempStr += "<div style='padding: 7px;'>" + katex.renderToString("R_{" + (i + 1)
                     + "} - \\dfrac{" + fraction.n + "}{" + fraction.d + 
                     "}R_{" + pivotRIdx + "}^{'} \\rightarrow R_{" + (i + 1) + 
                     "}^{'}") + "</div>";
                } else {
                    tempStr += "<div style='padding: 7px;'>" + katex.renderToString("R_{" + (i + 1)
                     + "} - " + fraction.n + "R_{" + pivotRIdx + 
                     "}^{'} \\rightarrow R_{" + (i + 1) + "}^{'}") + "</div>";
                }
            }
        }
    }
}

/**
 * Place numbers in specified decision variable in a subscript.
 * 
 * @param decVar   Decision variable to be formatted.
 * @param format   An object containing formatting-related Booleans.
 * @return         decVar in a row with numbers as subscripts and specified 
 * formatting.
 */
function subscripts(decVar, format) {
    // Move numbers in variables with a subscript
    var corrected = decVar.replace(/\d+/, function(x) {
        return "_{" + x + "}";
    });

    // Gather Booleans from format
    var {isBold, isLeftArrow, isDownArrow, notRow} = format;

    // Adjust formatting according to value of Booleans.
    if (isBold) {
        if (isLeftArrow) {
            return katexRow("\\leftarrow \\mathbf{" + corrected + "}");
        } else if (isDownArrow) {
            return katexRow("\\mathbf{" + corrected + "} \\downarrow");
        } else {
            return katexRow("\\mathbf{" + corrected + "}");
        }
    } else if (notRow) {
        return katex.renderToString(corrected);
    } else {
        return katexRow(corrected);
    }
}

/**
 * Write tempStr to tableau HTML element.
 * 
 * @params    None.
 * @return    Nothing.
 */
function writeTempStr() {
    document.getElementById("tableau").innerHTML = tempStr;
}

/**
 * Write zj-cj row to tempStr.
 * 
 * @param zc  Array containing zj-cj data.
 * @return    Nothing, just modifies the tempStr global.
 */
function zcRow(zc) {
    // Initialize dimensionality variables
    var mn = zc.length;

    // Add row
    tempStr += "<tr>";
    tempStr += katexRow("z_j - c_j");
    for (let i = 0; i < mn; i++) {
        tempStr += "<td>" + decimalToFrac(zc[i]) + "</td>";
    }
    tempStr += "</tr>";
}

/**
 * Write zj row to tempStr.
 * 
 * @param pivotEl  Pivot element.
 * @param isFeas   Boolean indicating whether the problem is feasible.
 * @param ratio    Array of the ratio of b to the pivot column.
 * @param z        Array of zj values.
 * @return         Nothing, simply writes the row to the tempStr global.
 */
function zRow(pivotEl, isFeas, ratio, z) {
    // Calculate mn from z
    var mn = z.length - 1;

    // Start row
    tempStr += "<tr>";
    if (ratio != undefined && !isNaN(pivotEl) && !isFeas) {
        tempStr += "<td rowspan='3'></td>";
    } else {
        tempStr += "<td rowspan='2'></td>";
    }
    tempStr += katexRow("z_j");
    for (let i = 0; i < mn; i++) {
        tempStr += "<td>" + decimalToFrac(z[i]) + "</td>";
    }

    // Objective function value
    tempStr += "<td rowspan='2'>" + decimalToFrac(z[mn]) + "</td>";
    tempStr += "</tr>";
}