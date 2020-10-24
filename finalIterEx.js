A = [[1, 0, math.fraction('-1/15'), math.fraction('1/30'), 0], [0, 1, math.fraction('1/300'), math.fraction('-1/150'), 0], [0, 0, math.fraction('4/75'), math.fraction('-1/150'), 1]];
b = [math.fraction('80/3'), math.fraction('56/3'), math.fraction('-4/3')];
cj= [-16, -90, 0, 0, 0];
x = ["x1", "x2", "s1", "s2", "s3"];
xB = ["x1", "x2", "s3"];
simplexIterator(A, b, cj, x, xB)