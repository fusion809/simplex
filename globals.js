// Initialize globals
var tempStr = "";
var finalA = [[]];
var initialAT = [[]];
var finalb = [];
var finalxB = [];
var finalcj = [];
var finalV = [[]];
var l = 0;

function updateGlobals(A, b, xB, x, cj) {
    finalA = A;
    if (l == 0) {
        initialAT = transpose(A);
    }
    l++;
    finalb = b;
    finalxB = xB;
    finalx = x;
    finalcj = cj;
}