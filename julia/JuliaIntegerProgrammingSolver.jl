# This first bit of code just installs JuMP and Clp, which are Julia optimization packages
using Pkg;
Pkg.add("JuMP");
Pkg.add("GLPK");
# Import JuMP and Clp
using JuMP, GLPK;
# Create optimization model
model = Model(with_optimizer(GLPK.Optimizer));
# Non-negativity conditions
@variable(model, x1 >= 0, integer=true);
@variable(model, x2 >= 0, integer=true);
@variable(model, x3 >= 0, integer=true);
# Objective function
@objective(model, Max, 1x1 + 2x2 + 3x3);
# Constraints
@constraint(model, con1, 6x1+4x2+2x3 <= 7);
#@constraint(model, con4, x2 <= 4);
# Solve the problem
optimize!(model)
# Return the value of the decision variables
println("x1 is ", value(x1))
println("x2 is ", value(x2))
println("x3 is ", value(x3))
# Return objective function value
println("The value of the objective function is ", objective_value(model))
