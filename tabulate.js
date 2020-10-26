/**
 * Place numbers in specified decision variable in a subscript.
 * 
 * @param decVar   Decision variable whose numerical components are to be 
 * turned into a subscript.
 * @return         decVar with numbers in subscript.
 */
function subscripts(decVar) {
    var corrected = decVar.replace(/\d+/, function(x) {
        return "<sub>" + x + "</sub>";
    });

    return corrected;
}

/**
 * Generate simplex tableau based on specified data.
 * 
 * @param A         Constraint coefficient in a 2d array.
 * @param b         RHS of the constraints in a 1d array.
 * @param cj        1d array of objective function coefficients.
 * @param x         1d array of decision variable names.
 * @param xB        1d array of basis variable names.
 * @param isFeas    Boolean indicating whether problem is feasible.
 * @param isOptim   Boolean indicating whether problem is 
 * optimized.
 * @param ratio     Ratio array used to decide entering/departing
 * variables.
 * @param pivotCol  Pivot column.
 * @param pivotEl   Pivot element.
 * @param pivotRIdx Pivot row index.
 * @param pivotCIdx Pivot column index.
 */
function genTableau(A, b, cj, x, xB, isFeas, isOptim, pivotCol, pivotEl, 
    ratio, pivotRIdx, pivotCIdx, isUnbounded) {
    var m = A.length;
    if (m != xB.length) {
        document.getElementById("tableau").innerHTML = "";
        tempStr += "A and xB do no match in their dimensions. Remember";
        tempStr += " A must have the basic structure:<br/>";
        tempStr += "A = [[a11, a12, a13, ..., a1m+n], [a21, a22, a23,";
        tempStr += "..., a2m+n], [a31, a32, a33, ..., a3m+n], ..., ";
        tempStr += "[am1, am2, am3, ..., am(m+n)]]<br/>";
        tempStr += "Where there are m constraints to the problem."
        document.getElementById("tableau").innerHTML = tempStr;
        return;
    }
    var mn = A[0].length;
    var [cB, z, zc] = calcEntries(A, b, cj, x, xB);

    // The following is to prevent departing/entering variable
    // indications from appearing in a final tableau
    if (xB[pivotRIdx] == x[pivotCIdx]) {
        pivotRIdx = NaN;
        pivotCIdx = NaN;
    }

    // Generate table
    document.getElementById("tableau").innerHTML = "";
    tempStr += "<table>";

    // Objective function coefficient row
    tempStr += "<tr>";
    tempStr += "<td></td>";
    tempStr += "<td>c<sub>j</sub></td>";
    for (let i = 0; i < cj.length; i++) {
        tempStr += "<td>" + decimalToFrac(cj[i]) + "</td>";
    }
    tempStr += "</tr>";

    // Header row
    tempStr += "<tr>";
    tempStr += "<td>c<sub><b>B</b></sub></td>";
    tempStr += "<td>x<sub><b>B</b></sub></td>";
    for (let i = 0; i < x.length; i++) {
        if (i != pivotCIdx) {
            tempStr += "<td>" + subscripts(x[i]) + "</td>";
        } else {
            tempStr += "<td><b>" + subscripts(x[i]) + "</b>&darr;</td>";
        }
    }
    tempStr += "<td><b>b</b></td>";
    if (isFeas && !isOptim) {
        tempStr += "<td>Ratio</td>";
    }

    // A & b rows
    tempStr += "</tr>";
    for (let i = 0; i < m; i++) {
        tempStr += "<tr>";
        tempStr += "<td>" + decimalToFrac(cB[i]) + "</td>";
        if (( pivotRIdx != i) || (isNaN(pivotCIdx)) ) {
            tempStr += "<td>" + subscripts(xB[i]) + "</td>";
        } else {
            tempStr += "<td>&larr;<b>" + subscripts(xB[i]) + "</b></td>";
        }
        for (let j = 0; j < mn; j++) {
            tempStr += "<td>" + decimalToFrac(A[i][j]) + "</td>";
        }
        tempStr += "<td>" + decimalToFrac(b[i]) + "</td>";
        if (isFeas && !isOptim) {
            if (ratio[i] != Number.POSITIVE_INFINITY && ratio[i] >= 0) {
                tempStr += "<td>" + decimalToFrac(ratio[i]) + "</td>";
            } else {
                tempStr += "<td>NA</td>";
            }
        }
        tempStr += "</tr>";
    }

    // zj row
    tempStr += "<tr>";
    if (ratio != undefined && !isNaN(pivotEl) && !isFeas) {
        tempStr += "<td rowspan='3'></td>";
    } else {
        tempStr += "<td rowspan='2'></td>";
    }
    tempStr += "<td>z<sub>j</sub></td>";
    for (let i = 0; i < mn; i++) {
        tempStr += "<td>" + decimalToFrac(z[i]) + "</td>";
    }

    // Objective function value
    tempStr += "<td rowspan='2'>" + decimalToFrac(z[mn]) + "</td>";
    tempStr += "</tr>";

    // zj-cj row
    tempStr += "<tr>";
    tempStr += "<td>z<sub>j</sub>-c<sub>j</sub></td>";
    for (let i = 0; i < mn; i++) {
        tempStr += "<td>" + decimalToFrac(zc[i]) + "</td>";
    }
    tempStr += "</tr>";

    // Ratio row
    if (ratio != undefined && !isNaN(pivotEl)) {
        if (!isFeas) {
            tempStr += "<tr>";
            tempStr += "<td>Ratio</td>";
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
    tempStr += "</table>";
    tempStr += "<br/>";

    // Show row operations
    if (!isOptim && !isUnbounded && !isNaN(pivotRIdx) && !isNaN(pivotEl)) {
        pivotRIdx++;
        for (let i = 0; i < m; i++) {
            if (pivotRIdx - 1 == i) {
                if (pivotEl == 1) {
                    tempStr += "<div>R<sub>" + pivotRIdx + "</sub> &rarr; R<sub>" + pivotRIdx + "</sub><sup>'</sup>";
                } else if (pivotEl == -1) {
                    tempStr += "<div>-R<sub>" + pivotRIdx + "</sub> &rarr; R<sub>" + pivotRIdx + "</sub><sup>'</sup>";
                } else {
                    tempStr += "<div>" + decimalToFrac(1 / pivotEl) + "R<sub>" + pivotRIdx + "</sub> &rarr; R<sub>" + pivotRIdx + "</sub><sup>'</sup>";
                }
            } else {
                if (pivotCol[i] == -1) {
                    tempStr += "<div>R<sub>" + (i + 1) + "</sub> + " + "R<sub>" + pivotRIdx + "</sub><sup>'</sup> &rarr; R<sub>" + (i + 1) + "</sub><sup>'</sup>";
                } else if ( pivotCol[i] < 0) {
                    tempStr += "<div>R<sub>" + (i + 1) + "</sub> + " + (decimalToFrac(-pivotCol[i])) + "R<sub>" + pivotRIdx + "</sub><sup>'</sup> &rarr; R<sub>" + (i + 1) + "</sub><sup>'</sup>";
                } else if (pivotCol[i] == 0) {
                    tempStr += "<div>R<sub>" + (i + 1) + "</sub> &rarr; R<sub>" + (i + 1) + "</sub><sup>'</sup>";
                } else if (pivotCol[i] == 1) {
                    tempStr += "<div>R<sub>" + (i + 1) + "</sub> - " + "R<sub>" + pivotRIdx + "</sub><sup>'</sup> &rarr; R<sub>" + (i + 1) + "</sub><sup>'</sup>";
                } else {
                    tempStr += "<div>R<sub>" + (i + 1) + "</sub> - " + (decimalToFrac(pivotCol[i])) + "R<sub>" + pivotRIdx + "</sub><sup>'</sup> &rarr; R<sub>" + (i + 1) + "</sub><sup>'</sup>";
                }
            }
        }
    }
    document.getElementById("tableau").innerHTML = tempStr;
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