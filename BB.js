function branchAndBound(A, b, cj, x, xB, intConds, maxz) {
    for (let i = 0; i < x.length; i++) {
        if (intConds[i] == 1) {
            console.log(x[i] + " is required to be an integer.");
        } else {
            console.log(x[i] + " is not required to be an integer.");
        }
    }

    var varsNotInts = true;
    [A, b, cj, x, xB, z] = simplexIterator(A, b, cj, x, xB);

    if (z[A[0].length+1] < maxz) {
        return;
    } 
    while (varsNotInts) {
        var [varsNotInts, ALt, bLt, cjLt, xLt, xBLt] = addBBConstraint(A, b, cj, x, xBLt, intConds);
    }
}

function addGtConstr(A, b, cj, x, xB, decVar) {

}

function addBBConstraint(A, b, cj, x, xB, intConds, cond) {
    var loc = basisIndex(x, xB);
    var varsNotInt = false;
    var newARow = [[]];
    var newbRow = [];
    for (let i = 0 ; i < b.length; i++) {
        if (intConds[loc[i]] == 1 && !isInt(b[i])) {
            if (cond == "leq") {
                newbRow = Math.floor(b[i]);
                newARow.push(BBConstraint(A, loc[i], "leq"));
            } else if (cond == "geq") {
                newbRow = -Math.ceil(b[i]);
                newARow.push(BBConstraint(A, loc[i], "geq"));
            } else {
                console.log("For some reason cond is not equal to either leq or geq");
            }
            varsNotInts = true;
            newcRow = [0];
            newxBRow = [newSlackVariable(x)];
            break;
        }
    }
    [A, b, cj, x, xB] = newConstraint(newARow, newbRow, newcRow, newxBRow);
    return [varsNotInts, A, b, cj, x, xB];
}

function BBConstraint(A, b, cj, x, xB, loc, val, cond) {
    var newARow = [];
    var newbRow = val;
    for (let i = 0 ; i < A[0].length + 1; i++) {
        if (loc != i && i < A[0].length) {
            newARow.push(0)
        } else if (cond = "leq") {
            newARow.push(1);
        } else if (cond = "geq") {
            newARow.push(-1);
            newbRow *= -1;
        } else {
            newARow.push(1);
        }
    }
    xB.push(newSlackVariable(x));
    x.push(xB[xB.length-1]);
    A.push(newARow);
    b.push(newbRow);
    cj.push(0);

    return [A, b, cj, x, xB];
}