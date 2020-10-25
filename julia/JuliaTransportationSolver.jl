# If you get an error about JuMP and Clp not being on your system you'll have to run:
# using Pkg; Pkg.add("JuMP"); Pkg.add("Clp"); before the rest of this code
using JuMP, Clp;
ORIG = ["S1", "S2", "S3"];
DEST = ["D1", "D2", "D3", "D4", "D5"];
supply = [100, 160, 140];
demand = [90, 60, 80, 100, 70];

# The following condition implies that the problem is balanced;
# This means for unbalanced problems you'll have to add a dummy column/row
@assert sum(supply) == sum(demand)
cost = [9 3 6 7 3;
		7 5 2 10 6;
		5 4 9 8 10];
model = Model(with_optimizer(Clp.Optimizer))

# Formulate as LP
@variable(model, trans[1:length(ORIG), 1:length(DEST)] >= 0)
@objective(model, Min, sum(cost[i, j] * trans[i, j] for i in 1:length(ORIG), j in 1:length(DEST)))
@constraint(model, [i in 1:length(ORIG)],
sum(trans[i, j] for j in 1:length(DEST)) == supply[i])
@constraint(model, [j in 1:length(DEST)],
   sum(trans[i, j] for i in 1:length(ORIG)) == demand[j])

# Solve the problem
JuMP.optimize!(model)

# This is the value of the decision variables
println(JuMP.value.(trans))
# Objective function value
objective_value(model)