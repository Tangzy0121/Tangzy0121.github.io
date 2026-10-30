# SafeCE

Database Systems · Cardinality Estimation · Risk Calibration
Status: In preparation

Risk-aware evaluation and upper-tail calibration for cardinality estimation.

## Motivation
Cardinality estimation errors in the upper tail are rare but dominate query latency regressions. Average-case metrics hide these failures, so estimators that look strong on standard benchmarks can still be risky in production. SafeCE studies how to evaluate and calibrate that risk explicitly.

## Benchmark
We assemble a benchmark that stresses join-heavy workloads with skewed distributions and correlated predicates. Queries are selected to expose tail behavior rather than mean error. The benchmark ships with per-query true cardinalities and plan-level outcomes for downstream analysis.

## Evaluation framework
The framework reports upper-tail risk measures alongside classical q-error statistics. We introduce a calibration procedure that maps model confidence to empirical tail risk. This makes estimators comparable on the metric that actually matters for robust plan selection.

## Results
Evaluated estimators show substantial tail-risk differences that are invisible under mean q-error. Calibration reduces worst-case plan regressions on the stressed workloads. Detailed numbers are being prepared for submission.

## My Contribution
I designed the benchmark and the evaluation framework, and ran the full experimental study.

## Contributions
- Benchmark construction
- Metric and framework design
- Experiment pipeline
- Data analysis
- Manuscript drafting
