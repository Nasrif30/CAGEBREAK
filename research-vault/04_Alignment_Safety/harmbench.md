---
id: SRC-HB
title: HarmBench
type: benchmark
status: source-summary
date: 2026-09-26
source: https://github.com/centerforaisafety/HarmBench
references:
  - https://arxiv.org/abs/2402.04249
  - https://github.com/centerforaisafety/HarmBench
tags: [red-team, benchmark, defense, robustness, paper, repository]
risk: unknown
tested: false
pinned: true
related: [JailbreakBench]
---
# Summary
HarmBench provides a framework for automated red teaming and robust refusal evaluation. Its workflow separates test-case generation, target-model completions, and evaluation. The repository supports comparing attacks and defenses under shared evaluation procedures.

# Evidence status
Primary repository reviewed on 2026-09-26. No experiments have been executed locally. Reported benchmark results depend on the specified model, attack, and evaluator configuration.

# Connections
[[JailbreakBench]] offers another standardized evaluation framework. Use [[Research Protocol]] before making cross-benchmark comparisons.
