# Simplex method
This repository contains a webpage I have written to solve linear programming problems using the simplex method. 

As of 14 November 2020 this solver:
* Prints messages indicating whether the solution is:
  * Permanently degenerate.
  * Permanently infeasible.
  * Unbounded.
* Mentions whether a problem has alternate solutions and lists them.
* Shows extensive working.
* Uses USQ's MAT2200 simplex tableau layout (not sure the formal name for this layout).
* Can perform sensitivity analysis, including:
  * The adding of new constraint(s).
  * The changing of objective function coefficient(s).
  * The change in resource value(s) (the right-hand side of constraints).
  * Constraint left-hand side change(s).
  * The adding of new variable(s).
* Allows the user to enter the problem in either matrix form or non-matrix form.

Shortcomings include:
* Poor performance. For really big problems this solver is *very slow* (taking several seconds). Any optimizations will be welcome.
* Does not solve integer programming problems (branchAndBound.js is an attempt at this, but it was abandoned due to the complexity of the recursion required).
* While the original problem can be entered in non-matrix form, sensitivity analysis can only be performed with changes to the problem entered in matrix form.