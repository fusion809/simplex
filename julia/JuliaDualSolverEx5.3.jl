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
@variable(model, x3 >= 0);
@variable(model, x4 >= 0);
@variable(model, x5 >= 0);
# Objective function
@objective(model, Min, x1+x2+x3+x4+x5);
# Constraints
@constraint(model, con1, 2x1+x2-x3+x4+3x5 >= 30);
@constraint(model, con2, x1-x2+2x3-x4+x5 >= 20);
# Solve the problem
optimize!(model)
# Return the value of the decision variables
println("x1 is ", value(x1))
println("x2 is ", value(x2))
println("x3 is ", value(x3))
println("x4 is ", value(x4))
println("x5 is ", value(x5))
# Return objective function value
println("The value of the objective function is ", objective_value(model))
# Return y1, y2
y1 = abs(dual(con1));
y2 = abs(dual(con2));
println("y1 is ", y1)
println("y2 is ", y2)