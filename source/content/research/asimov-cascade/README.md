# Asimov Cascade

AI Safety · Robotics · System Safety
Status: ICRA 2027 · Under Review

Detecting cascading safety failures across interacting humanoid robotic subsystems.

## Overview
Asimov Cascade studies how local safety violations propagate across the interacting subsystems of a humanoid robot. The project models a robot as a network of coupled controllers and asks when a single component failure escalates into a system-level safety incident. The goal is to detect cascading failures early, before they become unrecoverable.

## Problem
Safety assurance for humanoid robots is typically performed per subsystem, such as locomotion, manipulation, or perception. In deployment these subsystems interact continuously, and a fault in one can silently shift the operating conditions of the others. Existing evaluation pipelines largely miss these cross-subsystem cascades.

## Key Idea
We represent subsystem interactions as a directed dependency graph and treat safety violations as load that redistributes after each failure. This turns cascade detection into a tractable simulation problem over the interaction graph. The perspective borrows from cascading-failure analysis in power grids and network robustness.

## Method
We construct a dataset of induced failure scenarios on simulated humanoid platforms, perturbing individual subsystems under controlled conditions. Failure propagation is simulated step by step, and each trajectory is labeled with the onset and scope of the cascade. Predictive models are then trained to estimate cascade risk from a short window of early subsystem signals.

## Results
Preliminary experiments show that cascade onsets are predictable from early subsystem telemetry, well before the failure becomes visible at the system level. Detection quality remains stable as the number of interacting subsystems grows. Full benchmark results will be reported in the camera-ready version.

## My Contribution
I led the project end to end, from the initial research formulation to the submitted manuscript.

## Publication & Links
A manuscript describing this work is currently under review at ICRA 2027. Code, data, and evaluation artifacts will be released after the review process concludes.

## Contributions
- Research design
- Dataset construction
- Experiment pipeline
- Statistical analysis
- Visualization
- Manuscript writing
