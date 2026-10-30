# Anyscale-DBCO

ML4CO · Database Systems · Combinatorial Optimization
Status: Ongoing

Scaling combinatorial optimization through decomposition, solver routing and composition.

## Problem
Combinatorial optimization problems inside databases, such as join ordering and plan selection, become intractable at production scale. Learned solvers help but degrade sharply out of distribution. The project asks how to scale solving without giving up reliability.

## Architecture
Anyscale-DBCO organizes solving as a pipeline of decomposition, routing, and composition. Large instances are split into subproblems that fit individual solvers well. Partial solutions are then composed back with explicit consistency checks.

## Solver bank
The system maintains a heterogeneous bank of exact, heuristic, and learned solvers. Each solver is profiled on instance features so that its strengths are explicit. The bank is extensible and treats solvers as interchangeable components.

## Routing
A lightweight router predicts which solver will perform best on each subproblem. Routing decisions rely on cheap structural features rather than expensive learned embeddings. This keeps routing overhead negligible relative to solve time.

## Decomposition
Instances are decomposed along structure-aware cuts that minimize coupling between parts. The decomposition balances subproblem size against composition error. We study both graph-based and learning-guided splitting strategies.

## Results
Early results indicate that routed decomposition matches strong monolithic baselines at a fraction of the compute. The approach scales to instances that are infeasible for any single solver in the bank. A full evaluation is in progress.

## My Contribution
I built the decomposition and routing components and integrated the solver bank.

## Contributions
- System design
- Solver bank integration
- Routing model
- Experiments and evaluation
- Writing
