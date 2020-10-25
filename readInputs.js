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
            var el = elRb.replace(/\][;]/g, '');

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
                console.log("el at line 31 is " + el);
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
 * Read serialTab argument from input table.
 * 
 * @params    None.
 * @return    Nothing.
 */
function readSerialTab() {
    var htmlEl = document.getElementById("serialTab").value;

    if (htmlEl.toLowerCase() == "true") {
        return true;
    } else if (htmlEl.toLowerCase() == "false") {
        return false;
    }
}

function getParameters() {
    var A;
    var b;
    var cj;
    var serialTab = readSerialTab();
    if ( document.getElementById("reuse").checked) {
        A = finalA;
        b = finalb;
        xB = finalxB;
        cj = finalcj;
        x = finalx;
    } else {
        A = findA();
        b = findb();
        xB = findxB();
        cj = findc();
        x = findx();
    }

    if ( document.getElementById("newConstr").checked) {
        var newARows = findA();
        var newbRows = findb();
        var newcRows = findc();
        var newxBrows = findxB();
        serialTab = true;
        document.getElementById("serialTab").value = true;

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
        
        
    }
    finalA = A;
    finalb = b;
    finalxB = xB;
    finalx = x;

    return [A, b, cj, x, xB, serialTab];
}
