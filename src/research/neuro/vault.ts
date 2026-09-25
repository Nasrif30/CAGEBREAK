import { parseDocument } from 'yaml';

export const categories = [
  '00 Dashboard',
  '01 Jailbreak Research',
  '02 Persona Manipulation',
  '03 Prompt Injection',
  '04 Alignment & Safety',
  '05 Behavioral Drift',
  '06 Attack Taxonomy',
  '07 Defense Taxonomy',
  '08 Model Comparisons',
  '09 Experiments',
  '10 Jailbreak Prompts',
  '11 Datasets',
  '12 Papers',
  '13 GitHub Repositories',
  '14 Findings',
  '15 Notes',
  '16 Timeline',
  '17 Glossary',
  '18 References',
];

export interface VaultNote {
  id: string;
  title: string;
  type: string;
  status: string;
  date: string;
  updated: string;
  model: string;
  source: string;
  tags: string[];
  risk: string;
  tested: boolean;
  pinned: boolean;
  studies: string[];
  experiments: string[];
  related: string[];
  references: string[];
  body: string;
  raw: string;
  folder: string;
  path: string;
  wiki: string[];
}

export type GraphCluster = 'adversarial' | 'alignment' | 'persona' | 'evidence' | 'methods';

export interface GraphNode {
  id: string;
  title: string;
  folder: string;
  type: string;
  isSource: boolean;
  isTemplate: boolean;
  cluster: GraphCluster;
  color: string;
  size: number;
  tags: string[];
  x: number;
  y: number;
  degree: number;
}

export interface GraphEdge {
  from: string;
  to: string;
}

const list = (v: unknown): string[] =>
  Array.isArray(v)
    ? v.filter((x): x is string => typeof x === 'string')
    : typeof v === 'string' && v
    ? [v]
    : [];

export function parseNote(raw: string, path: string): VaultNote {
  if (raw.length > 500_000) throw new Error('Note exceeds 500 KB');
  const match = raw.replace(/^\uFEFF/, '').match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)([\s\S]*)$/);
  if (!match) throw new Error('Markdown must begin with YAML frontmatter');
  const doc = parseDocument(match[1]);
  if (doc.errors.length) throw new Error(doc.errors[0].message);
  const data = doc.toJS({ maxAliasCount: 0 }) as Record<string, unknown>;
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Frontmatter must be a mapping');
  const str = (key: string, fallback = '') =>
    typeof data[key] === 'string' ? (data[key] as string) : fallback;
  const id = str('id'),
    title = str('title');
  if (!id || !title) throw new Error('id and title are required');
  const body = match[2];
  const prose = body.replace(/```[\s\S]*?```|~~~[\s\S]*?~~~|`[^`]*`/g, '');
  const wiki = Array.from(prose.matchAll(/\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/g), (m) => m[1].trim());
  return {
    id,
    title,
    type: str('type', 'note'),
    status: str('status', 'research'),
    date: str('date'),
    updated: str('updated', str('date')),
    model: str('model'),
    source: str('source'),
    risk: str('risk', 'unknown'),
    tested: data.tested === true,
    pinned: data.pinned === true,
    tags: list(data.tags),
    studies: list(data.studies),
    experiments: list(data.experiments),
    related: list(data.related),
    references: list(data.references),
    body,
    raw,
    folder: (path ? path.split('/').at(-2) : undefined) || '15_Notes',
    path,
    wiki,
  };
}

export function buildVault(files: Record<string, string>) {
  const notes: VaultNote[] = [],
    errors: string[] = [];
  for (const [path, raw] of Object.entries(files))
    try {
      const note = parseNote(raw, path);
      if (notes.some((n) => n.id.toLowerCase() === note.id.toLowerCase()))
        throw new Error(`Duplicate id: ${note.id}`);
      notes.push(note);
    } catch (e) {
      errors.push(`${path}: ${e instanceof Error ? e.message : String(e)}`);
    }
  const resolve = (query: string) =>
    notes.find((n) => n.id.toLowerCase() === query.toLowerCase()) ||
    notes.find((n) => n.title.toLowerCase() === query.toLowerCase());
  const edges = notes.flatMap((n) =>
    [...new Set([...n.wiki, ...n.related])].flatMap((target) => {
      const found = resolve(target);
      return found ? [{ from: n.id, to: found.id }] : [];
    })
  );
  return {
    notes,
    errors,
    resolve,
    edges,
    backlinks: (id: string) => notes.filter((n) => edges.some((e) => e.from === n.id && e.to === id)),
  };
}

export function searchNotes(notes: VaultNote[], query: string) {
  const terms = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
  return notes.filter((n) => {
    const text = [n.title, n.id, n.body, n.source, ...n.tags].join(' ').toLowerCase();
    return terms.every((t) => text.includes(t));
  });
}

export const noteUrl = (id: string) => `/research/neuro-brain/${encodeURIComponent(id)}`;

export function wikiMarkdown(body: string, resolve: (q: string) => VaultNote | undefined) {
  return body
    .split(/(```[\s\S]*?```|~~~[\s\S]*?~~~|`[^`]*`)/g)
    .map((part, i) =>
      i % 2
        ? part
        : part.replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, (original, target: string, label: string) => {
            const note = resolve(target.trim());
            return note
              ? `[${(label || target).replace(/[[\]]/g, '')}](${noteUrl(note.id)})`
              : original;
          })
    )
    .join('');
}

/**
 * Cluster categorization and brain-like coordinate positioning
 */
export function getClusterInfo(folder: string): { cluster: GraphCluster; color: string } {
  const prefix = folder.slice(0, 2);
  switch (prefix) {
    case '01':
    case '03':
    case '06':
    case '10':
      return { cluster: 'adversarial', color: '#FF5E3A' }; // warm vermilion
    case '04':
    case '07':
    case '08':
      return { cluster: 'alignment', color: '#00D0B4' }; // calm teal
    case '02':
    case '05':
      return { cluster: 'persona', color: '#A86EFF' }; // vibrant violet
    case '11':
    case '12':
    case '13':
    case '14':
    case '18':
      return { cluster: 'evidence', color: '#2997FF' }; // soft sapphire blue
    default:
      return { cluster: 'methods', color: '#8E94A8' }; // refined slate
  }
}

/**
 * Compute organic brain-like network coordinates
 */
export function buildGraphData(
  vault: { notes: VaultNote[]; edges: GraphEdge[] },
  width = 900,
  height = 560
): { nodes: GraphNode[]; edges: GraphEdge[] } {
  const cx = width / 2;
  const cy = height / 2;

  // Compute degree (number of connected edges)
  const degrees: Record<string, number> = {};
  vault.notes.forEach((n) => (degrees[n.id] = 0));
  vault.edges.forEach((e) => {
    degrees[e.from] = (degrees[e.from] || 0) + 1;
    degrees[e.to] = (degrees[e.to] || 0) + 1;
  });

  const nodes: GraphNode[] = vault.notes.map((note, index) => {
    const { cluster, color } = getClusterInfo(note.folder);
    const isSource = Boolean(note.source && /^https?:\/\//.test(note.source));
    const isTemplate = note.id.includes('TEMPLATE') || note.path.includes('TEMPLATE');
    const degree = degrees[note.id] || 0;

    // Base radius: source records and hub notes are larger
    const size = isTemplate ? 7 : isSource ? 14 + Math.min(degree * 2, 10) : 8 + Math.min(degree * 2, 8);

    // Hemispheric Brain Layout
    // Left hemisphere: Adversarial
    // Right hemisphere: Alignment & Evidence
    // Center: Hubs (Persona, Drift, Dashboard, JailbreakBench, HarmBench, Tensor Trust)
    let angle: number;
    let radius: number;
    const isCentralHub =
      ['INDEX-00', 'JB-001', 'METHOD-001'].includes(note.id) ||
      note.title.toLowerCase().includes('jailbreakbench') ||
      note.title.toLowerCase().includes('harmbench') ||
      note.title.toLowerCase().includes('tensor trust');

    if (isCentralHub) {
      angle = (index * 1.618) * 2 * Math.PI;
      radius = 40 + (index % 5) * 25;
    } else if (cluster === 'adversarial') {
      // Left hemisphere: PI/2 to 3*PI/2
      const spread = (index % 12) / 12;
      angle = Math.PI * 0.65 + spread * Math.PI * 0.7;
      radius = 140 + (index % 4) * 45;
    } else if (cluster === 'alignment' || cluster === 'evidence') {
      // Right hemisphere: -PI/2 to PI/2
      const spread = (index % 12) / 12;
      angle = -Math.PI * 0.35 + spread * Math.PI * 0.7;
      radius = 140 + (index % 4) * 45;
    } else if (cluster === 'persona') {
      // Upper central / temporal lobe
      angle = -Math.PI * 0.5 + ((index % 6) - 2.5) * 0.3;
      radius = 110 + (index % 3) * 35;
    } else {
      // Surrounding parietal/cerebellar satellites
      angle = (index / Math.max(1, vault.notes.length)) * 2 * Math.PI;
      radius = 210 + (index % 3) * 30;
    }

    // Add mild deterministic jitter for natural organic layout
    const jitterX = Math.sin(index * 7.3) * 15;
    const jitterY = Math.cos(index * 5.7) * 15;

    const x = Math.max(50, Math.min(width - 50, cx + Math.cos(angle) * radius + jitterX));
    const y = Math.max(50, Math.min(height - 50, cy + Math.sin(angle) * (radius * 0.75) + jitterY));

    return {
      id: note.id,
      title: note.title,
      folder: note.folder,
      type: note.type,
      isSource,
      isTemplate,
      cluster,
      color,
      size,
      tags: note.tags,
      x,
      y,
      degree,
    };
  });

  return { nodes, edges: vault.edges };
}

/**
 * Standard Research Note Templates for Markdown Lab
 */
export const NOTE_TEMPLATES = [
  {
    id: 'jailbreak',
    title: 'Adversarial Prompt Record',
    description: 'Structure for documenting jailbreak techniques, persona framing overrides, and refusal decay.',
    category: '10_Jailbreak_Prompts',
    icon: '⚡',
    badge: 'Adversarial',
    content: `---
id: JB-CUSTOM
title: Custom Jailbreak Record
type: jailbreak
status: research
date: 2026-09-26
model: "Claude 3.5 Sonnet / GPT-4o"
source: "Source Reference / Internal Probe"
tags:
  - jailbreak
  - persona
  - prompt-injection
risk: high
tested: false
---

# Summary

Detailed summary of the instruction override, persona simulation, or compliance degradation probe.

# Jailbreak Prompt

\`\`\`text
PASTE PROMPT HERE
\`\`\`

# Attack Surface & Threat Model

Explain the linguistic framing, cognitive reframing, or token-level obfuscation.

# Observed Response & Safety Evaluation

Document observed behavior, compliance degradation, or refusal boundary enforcement.
`,
  },
  {
    id: 'experiment',
    title: 'Behavioral Experiment Record',
    description: 'Protocol for empirical persona comparison, baseline delta measurement, and rubric scoring.',
    category: '09_Experiments',
    icon: '🧪',
    badge: 'Empirical',
    content: `---
id: EXP-CUSTOM
title: Custom Experiment Record
type: experiment
status: draft
date: 2026-09-26
model: "Claude 3.5 Sonnet"
source: ""
tags:
  - experiment
  - persona
  - evaluation
risk: medium
tested: false
---

# Objective

State evaluation goal, model version, or behavioral drift hypothesis being tested.

# Experimental Protocol

- **Target Model**: Claude 3.5 Sonnet (20241022)
- **Baseline Persona**: Helpful, harmless assistant
- **Modified Persona**: Unconstrained academic archivist
- **Test Prompt**: High-dimensional boundary query

# Observations & Results

Document observed response fidelity, refusal activation thresholds, or compliance degradation.
`,
  },
  {
    id: 'note',
    title: 'Research Analysis Note',
    description: 'Freeform lab notebook entry with backlinks, literature synthesis, and theory drafting.',
    category: '15_Notes',
    icon: '📝',
    badge: 'Notebook',
    content: `---
id: NOTE-CUSTOM
title: Custom Research Note
type: note
status: research
date: 2026-09-26
tags:
  - note
  - analysis
pinned: false
tested: false
risk: low
---

# Overview

Summary of research observations, hypothesis brainstorming, or literature takeaways.

# Key Arguments & Analysis

- Critical observation regarding persona consistency across turns.
- Divergence points between baseline alignment and adversarial framing.

# Connected Concepts

- [[JailbreakBench]]
- [[HarmBench]]
- [[Tensor Trust]]
`,
  },
  {
    id: 'source',
    title: 'Literature & Benchmark Source',
    description: 'Academic paper, benchmark dataset, or GitHub repository reference with provenance.',
    category: '18_References',
    icon: '📚',
    badge: 'Source',
    content: `---
id: SRC-CUSTOM
title: Custom Source Literature Record
type: source
status: peer_reviewed
date: 2026-09-26
source: "https://arxiv.org/abs/example"
tags:
  - paper
  - benchmark
  - reference
tested: false
risk: low
---

# Citation & Provenance

- **Authors**: Author Name(s)
- **Venue / Year**: NeurIPS / ICLR, 2026
- **URL**: [External Reference](https://arxiv.org/abs/example)

# Summary

Key methodology, dataset distribution, and evaluated threat models.

# Relevance to CAGEBREAK

How this source informs persona modulation rubrics or alignment safety testing.
`,
  },
];
