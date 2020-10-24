# This first bit of code just installs JuMP and Clp, which are Julia optimization packages
using Pkg;
Pkg.add("JuMP");
Pkg.add("Clp");
# Import JuMP and Clp
using JuMP, GLPK;
# Create optimization model
model = Model(with_optimizer(GLPK.Optimizer));
# Non-negativity conditions
@variable(model, x[i=1:3] >= 0, Int);
# Objective function
@objective(model, Max, 4x[1]-2x[2]+7x[3]);
# Constraints
@constraint(model, con1, 2x[1]+5x[3] <= 10);
@constraint(model, con2, x[1]+x[2]-x[3] <= 1);
@constraint(model, con3, 6x[1]-5x[2] <= 0);
# Solve the problem
optimize!(model)
# Return the value of the decision variables
println("x[1] is ", value(x[1]))
println("x[2] is ", value(x[2]))
println("x[3] is ", value(x[3]))
# Return objective function value
println("The value of the objective function is ", objective_value(model))