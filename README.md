# Simplex method
This repository contains a webpage I have written to solve linear programming problems using the simplex method. 

As of 2 November 2020 this solver supports:
* Printing messages indicating whether the solution is:
  * Permanently degenerate.
  * Permanently infeasible.
  * Unbounded.
* Mentioning whether a problem has alternate solutions and listing them.
* Showing extensive working.
* Uses USQ's MAT2200 simplex tableau layout (not sure the formal name for this layout).
* Sensitivity analysis, including:
  * The adding of new constraint(s).
  * The changing of objective function coefficient(s).
  * The change in resource value(s) (the right-hand side of constraints).
  * Constraint left-hand side change(s).
  * The adding of new variable(s).

Shortcomings include:
* Poor performance. For really big problems this solver is *very slow* (taking several seconds). Any optimizations will be welcome.
* Does not support entering the problem in a format other than matrix format.