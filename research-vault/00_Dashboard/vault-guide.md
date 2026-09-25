---
id: GUIDE-001
title: Vault Guide
type: documentation
status: editorial
date: 2026-09-26
tags: [vault, ingestion]
tested: false
risk: unknown
---
# Markdown ingestion
Repository notes are loaded from all research-vault folders at build time. Add a Markdown file to a folder to include it. Browser imports are stored on the current device only; download the Markdown and place it in research-vault to share it in a later build.

Frontmatter requires unique id and title values. Supported fields: type, status, date, updated, model, source, tags, risk, tested, pinned, studies, experiments, related, references. Use YAML lists for plural fields. Dates use YYYY-MM-DD. Imported notes enter 15 Notes. Duplicate IDs and malformed files are rejected without overwriting notes.

Use wiki links such as [[JailbreakBench]] or an ID such as [[SRC-HB|HarmBench]]. Code blocks remain literal. Backlinks and graph edges are derived from wiki links and related metadata. Missing links remain visible as unresolved references.

Study links use existing study IDs. Experiment links use existing experiment IDs and expose the corresponding record. Existing app records are synthetic demos and are labeled accordingly. Do not link real source summaries to demo results as if they were evidence.

# Scope
The seed collection contains three primary-source reading notes and editorial indexes. It is not a complete literature survey or a bulk dataset import. No model tests were run. Source URLs and dates preserve provenance.
