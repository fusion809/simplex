/**
 * Determine A from HTML form and return it
 * 
 * @params    None.
 * @return    A, the 2d array of constraint coefficients.
 */
function findA() {
    var htmlEl = document.getElementById("A").value;
    if (htmlEl.match(';')) {
        var arr = htmlEl.split(/[, ][\s]*/);
        var A = [[]];
        var k = 0;

        // Loop over each element and add to A
        for (let i = 0; i < arr.length; i++) {
            // Element (potentially) with right bracket
            var elRb = arr[i].replace(/\[/g, '');
            // Element without right bracket
            var el = elRb.replace(/\]/g, '');

            // We're using MATLAB notation for arrays
            if (/[0-9]\s*;/.test(elRb)) {
                var elArr = el.split(/;/);
                if (!isNaN(elArr[0])) {
                    A[k].push(parseFloat(elArr[0]));
                }
                k++;
                if (i != arr.length - 1) {
                    A.push([]);
                }
                if (!isNaN(elArr[1])) {
                    A[k].push(parseFloat(elArr[1]));
                }
            } else if (!isNaN(el) && !/^$/.test(el)) {
                A[k].push(parseFloat(el));
            }
        }
    } else {
        var A = [find1dNumArr("A")];
    }

    return A;
}

/**
 * Create a 1d array from numerical data in HTML element specified by name.
 * 
 * @param name     Name of the element you want to get the data from (string).
 * @return         1d array containing the numerical data in name.
 */
function find1dNumArr(name) {
    var htmlEl = document.getElementById(name).value.split(/[,;\s][\s]*/);
    var arr = [];

    for (let i = 0 ; i < htmlEl.length; i++) {
        var el = htmlEl[i].replace(/\[/, '').replace(/\]/, '');
        if (/[\-0-9./]+/.test(el)) {
            // Using math.fraction is required in case users input fractions
            el = math.fraction(el);
            el = el.s*el.n/el.d;
            arr.push(el);
        }
    }

    return arr;
}

/**
 * Create b array from data in the b field in the input table.
 * 
 * @params    None.
 * @return    Nothing.
 */
function findb() {
    return find1dNumArr("b");
}

/**
 * Create c array from data in the c field in the input table.
 * 
 * @params    None.
 * @return    Nothing.
 */
function findc() {
    return find1dNumArr("c");
}

/**
 * Create a 1d array from string data in HTML element specified by name.
 * 
 * @param name     Name of the element you want to get the data from (string).
 * @return         1d array containing the string data in name.
 */
function find1dStrArr(name) {
    var htmlEl = document.getElementById(name).value.split(/[,;\s][\s]*/);
    var arr = [];

    for (let i = 0 ; i < htmlEl.length; i++) {
        var el = htmlEl[i].replace(/\[/, '').replace(/\]/, '').replace(/"/g, '');
        if (/[_a-zA-Z0-9]+/.test(el)) {
            arr.push(el);
        }
    }

    return arr;
}

/**
 * Returns an array of basis variables.
 * 
 * @params    None.
 * @return    Nothing.
 */
function findxB() {
    return find1dStrArr("xB");
}

/**
 * Returns an array of decision variables.
 * 
 * @params    None.
 * @return    Nothing.
 */
function findx() {
    return find1dStrArr("x");
}

/**
 * Obtain and return parameters of the problem from the form.
 * 
 * @params    None.
 * @return    Nothing.
 */
function getParameters() {
    // Change objective function coefficient(s)
    if ( document.getElementById("changec").checked) {
        // Set globals
        var A = finalA;
        var b = finalb;
        var xB = finalxB;
        var cj = findc();
        var x = finalx;
        tempStr += "Objective function coefficient changed. ";
    } 
    // Add new constraint
    else if ( document.getElementById("newConstr").checked) {
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

        // Adds new column for new slack variable
        for (let i = 0; i < A.length; i++) {
            for (let j = 0 ; j < newbRows.length; j++) {
                A[i].push(0);
            }
        }

        if (newARows.length != newbRows.length) {
            alert("An equal number of rows must be added to A and b")
        }
        for (let i = 0; i < newARows.length; i++) {
            A.push(newARows[i]);
            b.push(newbRows[i]);
            xB.push(newxBrows[i]);
            x.push(newxBrows[i]);
            cj.push(newcRows[i]);
        }

        tempStr += "Adding new constraint. ";
    } 
    // Resource change (i.e. RHS of constraint)
    else if (document.getElementById("rscChg").checked) {
        // Set globals
        var A = finalA;
        var b = findb();
        var xB = finalxB;
        var cj = finalcj;
        var x = finalx;
        var b = matMult(finalV, b);
        b = bUp;

        tempStr += "Resource value changed. ";
    } 
    // LHS constraint coefficient change
    else if (document.getElementById("LHSChg").checked) {
        // Set globals
        var A = findA();
        var AT = transpose(A);
        var finalAT = transpose(finalA);
        var m = A.length;
        var mn = A[0].length;
        var b = finalb;
        var xB = finalxB;
        var cj = finalcj;
        var x = finalx;
        var loc = basisIndex(x, xB);
        for (let j = 0; j < mn ; j++) {
            if (!find(loc, j)) {
                finalAT[j] = matMult(finalV, AT[j]);
            } else {
                for (let i = 0 ; i < m ; i++) {
                    if (AT[j][i] != initialAT[j][i]) {
                        console.log(AT[j][i]);
                        console.log(initialAT[j][i]);
                        alert("If the coefficients of basic variables change, you must solve the problem from scratch again!");
                        return [A, b, cj, x, xB, true];
                    }
                }
            }
        }
        var A = transpose(finalAT);
    } 
    // Extract relevant values from form
    else {
        // Set globals
        var A = findA();
        var b = findb();
        var xB = findxB();
        var cj = findc();
        var x = findx();
    }

    // Update globals
    finalA = A;
    if (l == 0) {
        initialAT = transpose(A);
    }
    l++;
    finalb = b;
    finalxB = xB;
    finalx = x;
    finalcj = cj;

    // Uncheck buttons
    document.getElementById("changec").checked = false;
    document.getElementById("newConstr").checked = false;
    document.getElementById("rscChg").checked = false;
    document.getElementById("LHSChg").checked = false;
    return [A, b, cj, x, xB, false];
}

/**
 * Uncheck specified radio button if it is checked.
 * 
 * @param name     Name of the radio button's HTML element.
 * @return         Nothing.
 */
function uncheck(name) {
    if (document.getElementById(name).checked) { 
        document.getElementById(name).checked = false; 
    }
}