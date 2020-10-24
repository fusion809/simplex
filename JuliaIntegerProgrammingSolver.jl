# This first bit of code just installs JuMP and Clp, which are Julia optimization packages
using Pkg;
Pkg.add("JuMP");
Pkg.add("GLPK");
# Import JuMP and Clp
using JuMP, GLPK;
# Create optimization model
model = Model(with_optimizer(GLPK.Optimizer));
# Non-negativity conditions
@variable(model, x1 >= 0);
@variable(model, x2 >= 0);
@variable(model, x3 >= 0);
# Objective function
@objective(model, Max, 4x1-2x2+7x3);
# Constraints
@constraint(model, con1, 2x1 + 5x3 <= 10);
@constraint(model, con2, x1 + x2 - x3 <= 1);
@constraint(model, con3, 6x1-5x2 <= 0);
#@constraint(model, con4, x2 <= 4);
# Solve the problem
optimize!(model)
# Return the value of the decision variables
println("x1 is ", value(x1))
println("x2 is ", value(x2))
println("x3 is ", value(x3))
# Return objective function value
println("The value of the objective function is ", objective_value(model))
