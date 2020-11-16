function branchAndBound(A, b, cj, x, xB, sign, objVarName, intConds) {
    for (let i = 0; i < x.length; i++) {
        if (intConds[i] == 1) {
            console.log(x[i] + " is required to be an integer.");
        } else {
            console.log(x[i] + " is not required to be an integer.");
        }
    }

    [A, b, cj, x, xB, z] = simplexIterator(A, b, cj, x, xB);
    var [isOptim, branchVar, branchVal] = varNotInt(b, x, xB, intConds);
    [A, b, cj, x, xB] = addBBConstr(A, b, cj, x, xB, branchVar, branchVal, 1);
    [A, b, cj, x, xB, z, isFeas] = simplexIterator(A, b, cj, x, xB, sign, 
        objVarName);
}

function varNotInt(b, x, xB, intConds) {
    var loc = basisIndex(x, xB);
    for (let i = 0 ; i < b.length; i++) {
        if ( (intConds[loc[i]] == 1) && (!isInt(b[i]))){
            return [false, xB[i], b[i]];
        }
    }
    return true;
}

/**
 * Add max or min constraint for a decision variable.
 * 
 * @param A       
 * @param b 
 * @param cj 
 * @param x 
 * @param xB       
 * @param decVar   Decision variable we're creating a max/min constraint for.
 * @param val      Max/min for variable.
 * @param sign     -1 if greater than constraint, 1 for less than constraint.
 */
function addBBConstr(A, b, cj, x, xB, decVar, val, sign) {
    var {mn} = getDims(A);
    var loc = basisIndex(x, [decVar]);

    // Create new row to add to A
    var newARow = new Array(mn+1);
    for (let i = 0; i < mn + 1; i++) {
        if (i == loc[0]) {
            newARow[i] = sign;
        } else if (i == mn) {
            newARow[i] = 1;
        } else {
            newARow[i] = 0;
        }
    }

    // new b row & c entry
    var newARows = [newARow];
    var newbRow = [sign*val];
    var newcEnt = [0];

    [A, b, cj, x, xB] = addConstr(A, b, cj, x, xB, newARows, newbRow, newcEnt);
    return [A, b, cj, x, xB];
}