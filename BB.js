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
    // Cols in A before constraint was added
    var {mn} = getDims(A);
    var loc = basisIndex(x, [decVar]); // Which column of x decVar is found in

    // Create new row to add to A
    var newARow = new Array(mn+1);

    // Loop over elements in new A row
    for (let i = 0; i < mn + 1; i++) {

        // Element corresponding to decVar should equal sign (-1 for >=, 
        // 1 for <=) 
        if (i == loc[0]) {
            newARow[i] = sign;
        } 
        // Slack variable coefficient
        else if (i == mn) {
            newARow[i] = 1;
        } 
        // All other elements should = 0
        else {
            newARow[i] = 0;
        }
    }

    // new b row & c entry
    var newARows = [newARow];
    var newbRow = [sign*val];
    var newcEnt = [0];

    // Add constraint to A, b, cj, x and xB
    [A, b, cj, x, xB] = addConstr(A, b, cj, x, xB, newARows, newbRow, newcEnt);
    return [A, b, cj, x, xB];
}

/**
 * Performs branch and bound to find solution.
 * 
 * @param A            Constraint coefficient array.
 * @param b            Solution array.
 * @param cj           Objective function coefficients array.
 * @param x            Decision variable array.
 * @param xB           Basis variable array.
 * @param sign         What the objective function has been multiplied by to 
 * make the problem a max problem, either -1 or 1.
 * @param objVarName   Name of the objective function (usually just a letter).
 * @param intConds     Integer conditions; there is one element for each 
 * decision variable. If equal to 1, that decision variable needs to be 
 * integer.
 * @param maxz         Maximium z value thus far found for an integer solution.
 * @return             [b, x, xB]
 */
function branchAndBound(A, b, cj, x, xB, sign, objVarName, intConds, maxz) {
    // Mention what integer constraints the user has specified
    for (let i = 0; i < x.length; i++) {
        if (intConds[i] == 1) {
            console.log(x[i] + " is required to be an integer.");
        } else {
            console.log(x[i] + " is not required to be an integer.");
        }
    }

    // isOptim = false if not all integer constraints are satisfied
    var [isOptim, branchVar, branchVal] = varNotInt(b, x, xB, intConds);

    if (!isOptim) {
        // Less than problem
        var [ALt, bLt, cjLt, xLt, xBLt] = addBBConstr(A, b, cj, x, xB, branchVar, Math.floor(branchVal), 1);
        var [ALt, bLt, cjLt, xLt, xBLt, zLt, isFeasLt] = simplexIterator(ALt, bLt, 
            cjLt, xLt, xBLt, sign, objVarName);
        if (isFeasLt && zLt > maxz) {
            var [isOptimLt, branchVarLt, branchValLt] = varNotInt(bLt, xLt, xBLt, intConds);
            if (isOptimLt) {
                maxz = zLt;
            }
        }

        // Greater than problem
        var [AGt, bGt, cjGt, xGt, xBGt] = addBBConstr(A, b, cj, x, xB, branchVar, Math.ceil(branchVal), 1);
        var [AGt, bGt, cjGt, xGt, xBGt, zGt, isFeasGt] = simplexIterator(AGt, bGt, 
            cjGt, xGt, xBGt, sign, objVarName);
    }
}

/**
 * Determines whether the integer conditions are satisfied.
 * 
 * @param b        Solution array.
 * @param x        Decision variable array.
 * @param xB       Basis variable array.
 * @param intConds Integer conditions. intConds[i] indicates whether x[i] is 
 * meant to be an integer. If it is equal to 1 the answer is yes, otherwise no.
 * @return         If conditions are satisfied, true, otherwise [false, first 
 * basis variable that doesn't satisfy integer conditions and solution value 
 * for that variable]
 */
function varNotInt(b, x, xB, intConds) {
    var loc = basisIndex(x, xB);
    for (let i = 0 ; i < b.length; i++) {
        if ( (intConds[loc[i]] == 1) && (!isInt(b[i]))){
            return [false, xB[i], b[i]];
        }
    }
    return true;
}