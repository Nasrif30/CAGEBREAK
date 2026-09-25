# AGENTS.md — CAGEBREAK Agent Collaboration Guide

This document establishes the architecture ownership boundaries for the CAGEBREAK project.

## Ownership Matrix

| Area | Primary Owner | Scope & Guidelines |
|---|---|---|
| `src/experience/` | **Codex / Astra** | Three.js scene, WebGL shaders, 3D glass physics, hand rig interactions, cinematic entry sequence. Application engineer does NOT modify without coordination. |
| `src/research/` | **Antigravity (App Engineer)** | Research shell, scientific archive views, research workflows, long-form findings. |
| `src/pages/` | **Antigravity (App Engineer)** | Overview, Studies, Experiments, Personas, Behavioral Tests, Notes, Sources, Timeline. |
| `src/components/` | **Antigravity (App Engineer)** | Design system primitives (GlassCard, StatCard, Tag, RiskBadge, SegmentedControl, CommandPalette, TopBar, Sidebar, MobileNavigation). |
| `src/data/` | **Antigravity (App Engineer)** | Research TypeScript interfaces, demo data, repository abstractions (`StudyRepository`, `ExperimentRepository`), future Supabase connector hooks. |
| `src/styles/` | **Antigravity (App Engineer)** | Global CSS variables, light/dark mode tokens, typography, accessibility resets, motion preferences. |
| Shared files (`App.tsx`, `package.json`, `AGENT_STATE.md`) | **Shared (Coordinated)** | Make only minimal, non-breaking edits. Use feature flags and clean bridges. |

## 3D Experience -> Research Archive Bridge Contract

Codex/Astra exposes or signals completion via:
- State property: `experiencePhase === "research"`
- Callback: `onExperienceComplete()`

The research application mounts gracefully with an Apple-inspired fade-and-resolve transition (subtle upward motion, soft blur resolving to sharp, controlled opacity).
