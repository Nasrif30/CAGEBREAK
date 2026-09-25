---
id: SRC-TT
title: Tensor Trust
type: dataset
status: source-summary
date: 2026-09-26
source: https://tensortrust.ai/paper/
references:
  - https://arxiv.org/abs/2311.01011
  - https://github.com/HumanCompatibleAI/tensor-trust-data
tags: [prompt-injection, dataset, red-team, paper]
risk: unknown
tested: false
pinned: true
related: [Research Protocol]
---
# Summary
Tensor Trust collects human-generated prompt injection attacks and defenses through an online game. The research distinguishes prompt hijacking from prompt extraction and uses the collected interactions to study robustness.

# Evidence status
Official paper page reviewed on 2026-09-26. This entry catalogs the research and dataset location; it does not import the underlying attack records or claim local results. Check the upstream dataset license before redistribution.

# Connections
[[JailbreakBench]] and [[HarmBench]] cover complementary evaluation settings. Their scores should not be treated as interchangeable.
