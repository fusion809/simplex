var A = [[-5, -5, -3, 1, 0, 0, 0, 0, 0, 0], 
         [-1, -1, 1, 0, 1, 0, 0, 0, 0, 0], 
         [-7, -6, 9, 0, 0, 1, 0, 0, 0, 0], 
         [-5, -5, -5, 0, 0, 0, 1, 0, 0, 0], 
         [-2, -4, 15, 0, 0, 0, 0, 1, 0, 0], 
         [-12, -10, 0, 0, 0, 0, 0, 0, 1, 0], 
         [0, -1, 10, 0, 0, 0, 0, 0, 0, 1]]; 
var b = [-50, -20, -30, -35, -10, -90, -20]; 
var cj = [-5, -6, -3, 0, 0, 0, 0, 0, 0, 0]; 
var x = ["x", "y", "z", "s1", "s2", "s3", "s4", "s5", "s6", "s7"]; 
var xB = ["s1", "s2", "s3", "s4", "s5", "s6", "s7"]; 

simplexIterator(A, b, cj, x, xB)