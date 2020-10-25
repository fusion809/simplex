/**
 * Determine A from HTML form and return it
 * 
 * @params    None.
 * @return    A, the 2d array of constraint coefficients.
 */
function findA() {
    var arr = document.getElementById("A").value.split(/[, ][\s]*/);
    var A = [[]];
    var k = 0;

    // Loop over each element and add to A
    for (let i = 0; i < arr.length; i++) {
        var elRb = arr[i].replace(/\[/g, '');
        var el = elRb.replace(/\]/g, '');

        // We're using MATLAB notation for arrays
        if (/[0-9]\s*;/.test(elRb)) {
            var elArr = el.split(/;/);
            A[k].push(parseFloat(elArr[0]));
            k++;
            if (i != arr.length - 1) {
                A.push([]);
            }
        } else {
            A[k].push(parseFloat(el));
        }
    }

    return A;
}

/**
 * Create a 1d array from numerical data in HTML element specified by name.
 * 
 * @param name     A string that is equal to the name of the element you want to use.
 * @return         1d array containing the numerical data in name.
 */
function find1dNumArr(name) {
    var htmlEl = document.getElementById(name).value.split(/[,;\s][\s]*/);
    console.log(htmlEl)
    var arr = new Array(htmlEl.length);

    for (let i = 0 ; i < arr.length; i++) {
        var el = parseFloat(htmlEl[i].replace(/\[/, '').replace(/\]/, ''));
        arr[i] = el;
    }

    return arr;
}

/**
 * Create a 1d array from string data in HTML element specified by name.
 * 
 * @param name     A string that is equal to the name of the element you want to use.
 * @return         1d array containing the string data in name.
 */
function find1dStrArr(name) {
    var htmlEl = document.getElementById(name).value.split(/[,;\s][\s]*/);
    var arr = new Array(htmlEl.length);

    for (let i = 0 ; i < arr.length; i++) {
        var el = htmlEl[i].replace(/\[/, '').replace(/\]/, '').replace(/"/g, '');
        arr[i] = el;
    }

    return arr;
}

function readSerialTab() {
    var htmlEl = document.getElementById("serialTab").value;

    if (htmlEl.toLowerCase() == "true") {
        return true;
    } else if (htmlEl.toLowerCase() == "false") {
        return false;
    }
}