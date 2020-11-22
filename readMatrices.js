/**
 * Extract the V matrix from the A matrix.
 * 
 * @param A   Constraint decision variable coefficient matrix.
 * @return    V, square matrix of coefficients of slack variables.
 */
function extractV(A) {
    // Determine dimensionality
    var m = A.length;
    var mn = A[0].length;
    var n = mn - m;

    // Initialize array
    var V = new Array(m);

    // Loop over rows in A (and hence V)
    for (let i = 0; i < m; i++) {
        // Add second dimension to array
        V[i] = new Array(m);
        
        // Obtain V's elements from A
        for (let j = 0; j < m; j++) {
            V[i][j] = A[i][n + j];
        }
    }

    return V;
}

/**
 * Create a 1d array from numerical data in HTML element specified by name.
 * 
 * @param name     Name of the element you want to get the data from (string).
 * @return         1d array containing the numerical data in name.
 */
function read1dNumArr(name) {
    // Obtain html element and split on , semicolons or spaces
    var htmlEl = document.getElementById(name).value.split(/[,; ][\s]*/);

    // Initialize array to be filled
    var arr = [];

    // Loop over elements of htmlEl and add them to array.
    for (let i = 0; i < htmlEl.length; i++) {
        var el = htmlEl[i].replace(/\[/, '').replace(/\]/, '');
        if (/[\-0-9./]+/.test(el)) {
            // Using math.fraction is required in case users input fractions
            arr.push(fracToDecimal(el));
        } else if (name == "b") {
            var msg = "b has unsuitable elements in it. Remember b is meant";
            msg += " to be full of members separated by commas, spaces or ";
            msg += "semicolons."
            alert(msg);
        } else if (name == "c") {
            var msg = "c has unsuitable elements in it. Remember c is meant";
            msg += " to be full of numbers separated by commas, spaces or ";
            msg += "semicolons.";
            alert(msg);
        } else if (name == "A") {
            var msg = "A has unsuitable elements in it. Remember A is meant";
            msg += " to be full of numbers separated by commas, spaces or ";
            msg += "semicolons.";
            alert(msg);
        }
    }

    return arr;
}

/**
 * Create a 1d array from string data in HTML element specified by name.
 * 
 * @param name     Name of the element you want to get the data from (string).
 * @return         1d array containing the string data in name.
 */
function read1dStrArr(name) {
    var htmlEl = document.getElementById(name).value.split(/[,;\s][\s]*/);
    var arr = [];
    var el;

    // Loop over each element of htmlEl, and add what needs to be added to arr
    for (let i = 0; i < htmlEl.length; i++) {
        el = htmlEl[i].replace(/\[/, '').replace(/\]/, '').replace(/"/g, '');
        if (/[_a-zA-Z0-9]+/.test(el)) {
            arr.push(el);
        }
    }

    return arr;
}

/**
 * Read 2d numerical array from specified form element.
 * 
 * @param name  HTML element from which the 2d numerical array is to be read.
 * @return      2d numerical array.
 */
function read2dNumArr(name) {
    // Obtain HTML element and initialize globals
    var htmlEl = document.getElementById(name).value;
    var arr = htmlEl.split(/[, ][\s]*/);
    var A = [[]];
    var k = 0;
    var len;

    // Loop over each element and add to A
    for (let i = 0; i < arr.length; i++) {
        // Element (potentially) with right bracket
        var elRb = arr[i].replace(/\[/g, '');
        // Element without right bracket
        var el = elRb.replace(/\]/g, '');

        // First condition yields true if a semicolon separate two numbers
        if (/[0-9/]*[\s]*;/.test(elRb)) {
            var elArr = el.split(/;/);

            // Add first element to last row
            if (/[0-9/]*/.test(elArr[0])) {
                A[k].push(fracToDecimal(elArr[0]));
            }
            
            // Input validation
            if ((len != undefined) && (A[k].length != len)) {
                alert("A row length mismatch! For some reason your A matrix has rows of different lengths!");
                throw console.error("A's rows must be equal in length!");
            }
            len = A[k].length;
            k++;

            // Add new blank row
            if (i != arr.length - 1) {
                A.push([]);
            }

            // Add second element to new row
            if (/[0-9/]*/.test(elArr[1])) {
                A[k].push(fracToDecimal(elArr[1]));
            }
        } 
        // This condition yields true for any other number
        else if (/[0-9/]*[\s]*/.test(elRb)) {
            A[k].push(fracToDecimal(el));
        } else {
            var msg = "A has unsuitable elements in it. Remember A is ";
            msg += "meant to be full of numbers separated by commas, ";
            msg += "spaces or semicolons.";
            alert(msg);
        }
    }

    // Input validation for final row
    if ((len != undefined) && (A[k].length != len)) {
        alert("A row length mismatch! For some reason your A matrix has rows of different lengths!");
        console.error("A's rows must be equal in length!");
    }

    return A;
}

/**
 * Determine A from HTML form and return it
 * 
 * @params    None.
 * @return    A, the 2d array of constraint coefficients.
 */
function readA() {
    // Obtain HTML element for A
    var htmlEl = document.getElementById("A").value;

    // Both semicolons and spaces/commas separate elements, array is 2d
    var testFor2D = htmlEl.match(/[0-9][, ]*[0-9]/) && htmlEl.match(/[;]/);

    // Extract data from form
    if (testFor2D) {
        var A = read2dNumArr("A");
    } else {
        var A = [read1dNumArr("A")];
    }

    return A;
}

/**
 * Create b array from data in the b field in the input table.
 * 
 * @params    None.
 * @return    Nothing.
 */
function readb() {
    return read1dNumArr("b");
}

/**
 * Create c array from data in the c field in the input table.
 * 
 * @params    None.
 * @return    Nothing.
 */
function readc() {
    return read1dNumArr("c");
}

/**
 * Returns an array of decision variables.
 * 
 * @params    None.
 * @return    Nothing.
 */
function readx() {
    return read1dStrArr("x");
}

/**
 * Returns an array of basis variables.
 * 
 * @params    None.
 * @return    Nothing.
 */
function readxB() {
    return read1dStrArr("xB");
}