/**
 * Create a 1d array from numerical data in HTML element specified by name.
 * 
 * @param name     Name of the element you want to get the data from (string).
 * @return         1d array containing the numerical data in name.
 */
function find1dNumArr(name) {
    var htmlEl = document.getElementById(name).value.split(/[,;\s][\s]*/);
    var arr = [];

    for (let i = 0; i < htmlEl.length; i++) {
        var el = htmlEl[i].replace(/\[/, '').replace(/\]/, '');
        if (/[\-0-9./]+/.test(el)) {
            // Using math.fraction is required in case users input fractions
            arr.push(fracToDecimal(el));
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
function find1dStrArr(name) {
    var htmlEl = document.getElementById(name).value.split(/[,;\s][\s]*/);
    var arr = [];

    // Loop over each element of htmlEl, and add what needs to be added to arr
    for (let i = 0; i < htmlEl.length; i++) {
        var el = htmlEl[i].replace(/\[/, '').replace(/\]/, '').replace(/"/g, '');
        if (/[_a-zA-Z0-9]+/.test(el)) {
            arr.push(el);
        }
    }

    return arr;
}

/**
 * Determine A from HTML form and return it
 * 
 * @params    None.
 * @return    A, the 2d array of constraint coefficients.
 */
function findA() {
    var htmlEl = document.getElementById("A").value;
    if (htmlEl.match(/[, ]/)) {
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
            if (/[0-9/]*[\s]*;/.test(elRb)) {
                var elArr = el.split(/;/);
                if (/[0-9/]*/.test(elArr[0])) {
                    A[k].push(fracToDecimal(elArr[0]));
                }
                k++;
                if (i != arr.length - 1) {
                    A.push([]);
                }
                if (/[0-9/]*/.test(elArr[1])) {
                    A[k].push(fracToDecimal(elArr[1]));
                }
            } else if (/[0-9/]*[\s]*/.test(elRb)) {
                A[k].push(fracToDecimal(el));
            }
        }
    } else {
        var A = [find1dNumArr("A")];
    }

    return A;
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
 * Extract the V matrix from the A matrix.
 * 
 * @param A   Constraint decision variable coefficient matrix.
 * @return    V
 */
function findV(A) {
    var m = A.length;
    var V = new Array(m);

    for (let i = 0; i < m; i++) {
        V[i] = new Array(m);
        for (let j = 0; j < m; j++) {
            V[i][j] = A[i][m + j - 1];
        }
    }

    return V;
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
 * Returns an array of basis variables.
 * 
 * @params    None.
 * @return    Nothing.
 */
function findxB() {
    return find1dStrArr("xB");
}