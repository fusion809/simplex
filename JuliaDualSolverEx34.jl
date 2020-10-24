# This first bit of code just installs JuMP and Clp, which are Julia optimization packages
using Pkg;
Pkg.add("JuMP");
Pkg.add("Clp");
# Import JuMP and Clp
using JuMP, Clp;
# Create optimization model
model = Model(with_optimizer(Clp.Optimizer));
# Non-negativity conditions
@variable(model, x1 >= 0);
@variable(model, x2 >= 0);
# Objective function
@objective(model, Max, 3x1+5x2);
# Constraints
@constraint(model, con1, 3x1+x2 <= 6);
@constraint(model, con2, x1+2x2 <= 8);
# Solve the problem
optimize!(model)
# Return the value of the decision variables
println("x1 is ", value(x1))
println("x2 is ", value(x2))
# Return objective function value
println("The value of the objective function is ", objective_value(model))
# Return y1, y2
y1 = dual(con1);
y2 = dual(con2);
println("y1 is ", y1)
println("y2 is ", y2)
# Shadow prices
shadow1 = shadow_price(con1);
shadow2 = shadow_price(con2);
println("shadow price associated with slack variable 1 is ", shadow1);
println("shadow price associated with slack variable 2 is ", shadow2);