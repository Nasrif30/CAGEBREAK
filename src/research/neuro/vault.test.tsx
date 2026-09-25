import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  buildVault,
  parseNote,
  searchNotes,
  wikiMarkdown,
  buildGraphData,
  NOTE_TEMPLATES,
} from './vault';
import { NeuroBrain } from './NeuroBrain';

const raw = (id: string, title: string, body = '') =>
  `---\nid: ${id}\ntitle: ${title}\ndate: 2026-09-26\ntested: false\ntags: [robustness]\n---\n${body}`;

describe('Markdown vault core', () => {
  it('parses metadata and searches body and tags', () => {
    const note = parseNote(raw('A', 'Alpha', 'Evidence here'), '15_Notes/a.md');
    expect(note.date).toBe('2026-09-26');
    expect(note.tested).toBe(false);
    expect(searchNotes([note], 'evidence robustness')).toEqual([note]);
  });

  it('rejects invalid frontmatter and duplicate IDs without overwrite', () => {
    expect(() => parseNote('no metadata', 'a.md')).toThrow();
    const vault = buildVault({ 'a.md': raw('A', 'Alpha'), 'b.md': raw('a', 'Other') });
    expect(vault.notes).toHaveLength(1);
    expect(vault.errors).toHaveLength(1);
  });

  it('builds resolved graph edges and backlinks; ignores code links', () => {
    const vault = buildVault({
      'a.md': raw('A', 'Alpha', '[[Beta]] `[[No]]`'),
      'b.md': raw('B', 'Beta'),
    });
    expect(vault.edges).toEqual([{ from: 'A', to: 'B' }]);
    expect(vault.backlinks('B')[0].id).toBe('A');
    expect(wikiMarkdown('[[Beta|Read]] `[[Beta]]` [[Missing]]', vault.resolve)).toBe(
      '[Read](/research/neuro-brain/B) `[[Beta]]` [[Missing]]'
    );
  });

  it('rejects oversized notes and YAML aliases', () => {
    expect(() => parseNote('x'.repeat(500001), 'x')).toThrow();
    expect(() => parseNote('---\nid: &id A\ntitle: *id\n---\n', 'x')).toThrow();
  });
});

describe('Templates & Graph Builder', () => {
  it('parses all standard templates with valid frontmatter', () => {
    expect(NOTE_TEMPLATES.length).toBeGreaterThanOrEqual(4);
    for (const t of NOTE_TEMPLATES) {
      const note = parseNote(t.content, `${t.category}/${t.id}.md`);
      expect(note.id).toBeTruthy();
      expect(note.title).toBeTruthy();
      expect(note.type).toBeTruthy();
    }
  });

  it('builds organic hemispheric brain graph data with source beacons', () => {
    const vault = buildVault({
      '10_Jailbreak_Prompts/JB-001.md': `---
id: JB-BENCH
title: JailbreakBench Anchor
type: benchmark
source: https://jailbreakbench.github.io
tags: [jailbreak, benchmark]
date: 2026-09-26
tested: true
---
Benchmark record linking to [[EXP-01]]`,
      '09_Experiments/EXP-01.md': `---
id: EXP-01
title: Persona Drift Test
type: experiment
tags: [persona, experiment]
date: 2026-09-26
---
Observations on behavioral drift`,
    });

    const graph = buildGraphData(vault, 1000, 600);
    expect(graph.nodes).toHaveLength(2);
    expect(graph.edges).toHaveLength(1);

    const jbNode = graph.nodes.find((n) => n.id === 'JB-BENCH');
    expect(jbNode).toBeDefined();
    expect(jbNode?.isSource).toBe(true);
    expect(jbNode?.cluster).toBe('adversarial');

    const expNode = graph.nodes.find((n) => n.id === 'EXP-01');
    expect(expNode).toBeDefined();
    expect(expNode?.cluster).toBe('methods');

    // Bounded coordinates within canvas bounds
    expect(jbNode!.x).toBeGreaterThan(0);
    expect(jbNode!.x).toBeLessThan(1000);
    expect(jbNode!.y).toBeGreaterThan(0);
    expect(jbNode!.y).toBeLessThan(600);
  });
});

describe('Neuro Brain UI Rendering', () => {
  it('renders Vault Library with search and folder tree', () => {
    const markup = renderToStaticMarkup(
      <MemoryRouter initialEntries={['/research/neuro-brain']}>
        <NeuroBrain />
      </MemoryRouter>
    );

    expect(markup).toContain('NEURO BRAIN');
    expect(markup).toContain('Research Vault');
    expect(markup).toContain('Knowledge Graph');
    expect(markup).toContain('Markdown Lab');
    expect(markup).toContain('Search by title');
    expect(markup).toContain('Taxonomy Folders');
  });

  it('renders Knowledge Graph canvas when graph tab is active', () => {
    const markup = renderToStaticMarkup(
      <MemoryRouter initialEntries={['/research/neuro-brain?tab=graph']}>
        <NeuroBrain initialTab="graph" />
      </MemoryRouter>
    );

    expect(markup).toContain('neuro-graph-shell');
    expect(markup).toContain('neuro-graph-svg');
    expect(markup).toContain('All Knowledge');
    expect(markup).toContain('Adversarial &amp; Jailbreak');
    expect(markup).toContain('Source Provenance');
  });

  it('renders Markdown Lab studio when lab tab is active', () => {
    const markup = renderToStaticMarkup(
      <MemoryRouter initialEntries={['/research/neuro-brain?tab=lab']}>
        <NeuroBrain initialTab="lab" />
      </MemoryRouter>
    );

    expect(markup).toContain('MARKDOWN RESEARCH LABORATORY');
    expect(markup).toContain('Editor &amp; Live Preview');
    expect(markup).toContain('Templates');
    expect(markup).toContain('Vault Files');
    expect(markup).toContain('Valid Frontmatter');
  });

  it('safely sanitizes adversarial markdown without script execution', () => {
    const malicious = parseNote(
      `---
id: SEC-TEST
title: XSS Payload Test
tags: [security]
date: 2026-09-26
---
<script>alert("hacked")</script>
<img src="x" onerror="alert(1)" />

Normal text with research data.`,
      '15_Notes/sec.md'
    );

    expect(malicious.id).toBe('SEC-TEST');
    const renderedMarkup = renderToStaticMarkup(
      <Markdown skipHtml remarkPlugins={[remarkGfm]}>
        {malicious.body}
      </Markdown>
    );
    // Verified: skipHtml strips <script> and doesn't execute malicious JavaScript
    expect(renderedMarkup).not.toContain('<script>');
    expect(renderedMarkup).not.toContain('alert("hacked")');
    expect(renderedMarkup).toContain('Normal text with research data.');
  });
});
