import { useMemo, useState } from 'react';
import { Link, useParams, useSearchParams, useNavigate } from 'react-router-dom';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  buildVault,
  categories,
  noteUrl,
  parseNote,
  searchNotes,
  wikiMarkdown,
  VaultNote,
} from './vault';
import { NeuroGraph } from './NeuroGraph';
import { MarkdownLab } from './MarkdownLab';
import { DEMO_STUDIES } from '../../data/demo/studies';
import { DEMO_EXPERIMENTS } from '../../data/demo/experiments';
import {
  BookOpen,
  Network,
  FileCode2,
  Search,
  Upload,
  Download,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Layers,
  ShieldAlert,
  Calendar,
  Tag,
  CheckCircle2,
  FileText,
  AlertTriangle,
} from 'lucide-react';
import './neuro.css';

const bundled = import.meta.glob('../../../research-vault/**/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

const storageKey = 'cagebreak-neuro-imports-v1';

function saved(): Record<string, string> {
  try {
    const value = JSON.parse(localStorage.getItem(storageKey) || '{}');
    return value && typeof value === 'object' && !Array.isArray(value)
      ? Object.fromEntries(
          Object.entries(value).filter((entry): entry is [string, string] => typeof entry[1] === 'string')
        )
      : {};
  } catch {
    return {};
  }
}

const isExternal = (url: string) => {
  try {
    return ['http:', 'https:'].includes(new URL(url).protocol);
  } catch {
    return false;
  }
};

interface NeuroBrainProps {
  initialTab?: 'library' | 'graph' | 'lab';
}

export function NeuroBrain({ initialTab }: NeuroBrainProps = {}) {
  const { noteId } = useParams();
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();

  const [imports, setImports] = useState(saved);
  const [message, setMessage] = useState('');

  const vault = useMemo(() => buildVault({ ...bundled, ...imports }), [imports]);
  const note = noteId ? vault.resolve(noteId) : undefined;

  const currentTab = (params.get('tab') as 'library' | 'graph' | 'lab') || initialTab || 'library';
  const query = params.get('q') || '';
  const folder = params.get('folder') || '';
  const mode = params.get('view') || 'all';

  const updateParam = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next);
  };

  const setTab = (tab: 'library' | 'graph' | 'lab') => {
    const next = new URLSearchParams(params);
    if (tab === 'library') {
      next.delete('tab');
    } else {
      next.set('tab', tab);
    }
    setParams(next);
  };

  const matches = useMemo(() => {
    return searchNotes(vault.notes, query)
      .filter((n) => (!folder || n.folder.startsWith(folder)) && (mode !== 'pinned' || n.pinned))
      .sort((a, b) => b.updated.localeCompare(a.updated) || a.title.localeCompare(b.title));
  }, [vault.notes, query, folder, mode]);

  async function ingest(files: FileList | null) {
    if (!files) return;
    const next = { ...imports };
    const ids = new Set(vault.notes.map((n) => n.id.toLowerCase()));
    const results: string[] = [];

    for (const file of Array.from(files)) {
      try {
        if (file.size > 500_000) throw new Error('Maximum file size is 500 KB');
        const raw = await file.text();
        const parsed = parseNote(raw, `local/15_Notes/${file.name}`);
        if (ids.has(parsed.id.toLowerCase())) {
          throw new Error('ID already exists; existing notes are never overwritten');
        }
        ids.add(parsed.id.toLowerCase());
        next[`local/15_Notes/${encodeURIComponent(parsed.id)}.md`] = raw;
        results.push(`${file.name}: imported successfully`);
      } catch (error) {
        results.push(`${file.name}: ${error instanceof Error ? error.message : String(error)}`);
      }
    }

    try {
      localStorage.setItem(storageKey, JSON.stringify(next));
      setImports(next);
      setMessage(results.join('\n'));
    } catch {
      setMessage('Storage is full or unavailable. No imports were saved.');
    }
  }

  function handleSaveNote(path: string, raw: string) {
    const next = { ...imports, [path]: raw };
    try {
      localStorage.setItem(storageKey, JSON.stringify(next));
      setImports(next);
      setMessage(`Saved to local browser vault: ${path}`);
    } catch {
      setMessage('Storage error: unable to persist note.');
    }
  }

  function handleSelectNote(targetId: string) {
    navigate(noteUrl(targetId));
    setTab('library');
  }

  function downloadNote(targetNote: VaultNote) {
    const url = URL.createObjectURL(new Blob([targetNote.raw], { type: 'text/markdown' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `${targetNote.id.replace(/[^\w-]/g, '_')}.md`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  const renderLinkList = (ids: string[]) => {
    return ids.map((id) => {
      const target = vault.resolve(id);
      return target ? (
        <li key={id}>
          <Link to={noteUrl(target.id)} className="neuro-link">
            <span className="neuro-link-title">{target.title}</span>
            <span className="neuro-link-meta">{target.type}</span>
          </Link>
        </li>
      ) : (
        <li key={id} className="neuro-unresolved">
          <span>{id}</span> <small>(unresolved reference)</small>
        </li>
      );
    });
  };

  return (
    <section className="neuro">
      {/* Vault Master Header */}
      <header className="neuro-header">
        <div className="neuro-header-main">
          <p className="neuro-eyebrow">CAGEBREAK / INTELLIGENCE REPOSITORY</p>
          <h1>
            <Link to="/research/neuro-brain">NEURO BRAIN</Link>
          </h1>
          <p className="neuro-subtitle">
            Obsidian knowledge vault, cognitive behavioral graph, and prompt jailbreak research lab.
          </p>
          <p className="neuro-muted">
            Evidence-anchored notes, adversarial benchmarks, and safety evaluations. Safe Markdown parsing with zero prompt execution.
          </p>
        </div>

        {/* Global Vault Stats */}
        <div className="neuro-header-stats">
          <div className="neuro-stat-pill">
            <span className="neuro-stat-val">{vault.notes.length}</span>
            <span className="neuro-stat-lbl">Notes</span>
          </div>
          <div className="neuro-stat-pill">
            <span className="neuro-stat-val">{vault.edges.length}</span>
            <span className="neuro-stat-lbl">Edges</span>
          </div>
          <div className="neuro-stat-pill">
            <span className="neuro-stat-val">
              {vault.notes.filter((n) => isExternal(n.source)).length}
            </span>
            <span className="neuro-stat-lbl">Sources</span>
          </div>
        </div>
      </header>

      {/* Primary Navigation Segmented Tabs */}
      <nav className="neuro-nav-tabs" aria-label="Neuro Brain Sections">
        <button
          className={`neuro-nav-tab ${currentTab === 'library' ? 'active' : ''}`}
          onClick={() => setTab('library')}
          aria-current={currentTab === 'library' ? 'page' : undefined}
        >
          <BookOpen size={16} />
          <span>Research Vault</span>
          <span className="neuro-tab-badge">{vault.notes.length}</span>
        </button>

        <button
          className={`neuro-nav-tab ${currentTab === 'graph' ? 'active' : ''}`}
          onClick={() => setTab('graph')}
          aria-current={currentTab === 'graph' ? 'page' : undefined}
        >
          <Network size={16} />
          <span>Knowledge Graph</span>
          <span className="neuro-tab-badge">{vault.edges.length} links</span>
        </button>

        <button
          className={`neuro-nav-tab ${currentTab === 'lab' ? 'active' : ''}`}
          onClick={() => setTab('lab')}
          aria-current={currentTab === 'lab' ? 'page' : undefined}
        >
          <FileCode2 size={16} />
          <span>Markdown Lab</span>
          <span className="neuro-tab-badge">Studio</span>
        </button>
      </nav>

      {/* Status or Import Messages */}
      {message && (
        <div role="status" className="neuro-status-banner">
          <span>{message}</span>
          <button onClick={() => setMessage('')} aria-label="Dismiss message">
            ✕
          </button>
        </div>
      )}

      {/* Note Validation Details */}
      {vault.errors.length > 0 && (
        <details className="neuro-validation-errors">
          <summary>
            <AlertTriangle size={14} /> Note frontmatter parsing warnings ({vault.errors.length})
          </summary>
          <pre>{vault.errors.join('\n')}</pre>
        </details>
      )}

      {/* TAB CONTENT: KNOWLEDGE GRAPH */}
      {currentTab === 'graph' && (
        <div className="neuro-tab-pane neuro-tab-graph">
          <NeuroGraph vault={vault} onSelectNote={handleSelectNote} />
        </div>
      )}

      {/* TAB CONTENT: MARKDOWN LAB */}
      {currentTab === 'lab' && (
        <div className="neuro-tab-pane neuro-tab-lab">
          <MarkdownLab
            vault={vault}
            onSaveNote={handleSaveNote}
            onSelectNoteInLibrary={handleSelectNote}
          />
        </div>
      )}

      {/* TAB CONTENT: RESEARCH VAULT LIBRARY */}
      {currentTab === 'library' && (
        <div className="neuro-tab-pane neuro-tab-library">
          {/* Quick Filter & Ingestion Strip */}
          <div className="neuro-tools-strip">
            <div className="neuro-search-bar">
              <Search size={15} />
              <input
                type="search"
                value={query}
                onChange={(e) => updateParam('q', e.target.value)}
                placeholder="Search by title, prompt text, model, taxonomy or tag..."
                aria-label="Search notes"
              />
              {query && (
                <button
                  className="neuro-clear-search"
                  onClick={() => updateParam('q', '')}
                  title="Clear search"
                >
                  ✕
                </button>
              )}
            </div>

            <div className="neuro-actions-bar">
              <label className="neuro-import-btn">
                <Upload size={14} />
                <span>Import .md</span>
                <input
                  type="file"
                  accept=".md,.markdown"
                  multiple
                  onChange={(e) => {
                    void ingest(e.target.files);
                    e.target.value = '';
                  }}
                />
              </label>
              <button
                className="neuro-lab-quick-btn"
                onClick={() => setTab('lab')}
                title="Open Markdown Studio"
              >
                <FileCode2 size={14} />
                <span>New from Template</span>
              </button>
            </div>
          </div>

          <div className="neuro-layout">
            {/* Category / Taxonomy Folder Sidebar */}
            <aside className="neuro-folder-nav" aria-label="Vault categories">
              <div className="neuro-folder-header">
                <span>Taxonomy Folders</span>
                <small>{categories.length}</small>
              </div>

              <button
                aria-pressed={!folder}
                className={`neuro-folder-btn ${!folder ? 'active' : ''}`}
                onClick={() => updateParam('folder', '')}
              >
                <span>All Research Categories</span>
                <span className="neuro-count-pill">{vault.notes.length}</span>
              </button>

              <div className="neuro-folder-list">
                {categories.map((category) => {
                  const prefix = category.slice(0, 2);
                  const count = vault.notes.filter((n) => n.folder.startsWith(prefix)).length;
                  const isActive = folder === prefix;
                  return (
                    <button
                      key={category}
                      aria-pressed={isActive}
                      className={`neuro-folder-btn ${isActive ? 'active' : ''}`}
                      onClick={() => updateParam('folder', prefix)}
                    >
                      <span className="neuro-folder-name">{category}</span>
                      <span className="neuro-count-pill">{count}</span>
                    </button>
                  );
                })}
              </div>
            </aside>

            {/* Note Reader or Card Grid Content */}
            <main className="neuro-content">
              {noteId && !note && (
                <div role="alert" className="neuro-alert-box">
                  <h3>Note Not Found</h3>
                  <p>The requested note identifier "{noteId}" does not exist in the active vault.</p>
                  <Link to="/research/neuro-brain" className="neuro-btn-secondary">
                    ← Return to Vault Library
                  </Link>
                </div>
              )}

              {/* Single Note View */}
              {note && !query && !folder ? (
                <article key={note.id} className="neuro-article">
                  <div className="neuro-article-header">
                    <div className="neuro-breadcrumbs">
                      <Link to="/research/neuro-brain">Vault</Link>
                      <ChevronRight size={12} />
                      <span>{note.folder}</span>
                      <ChevronRight size={12} />
                      <span className="neuro-crumb-id">{note.id}</span>
                    </div>

                    <div className="neuro-article-actions">
                      <button
                        className="neuro-action-pill"
                        onClick={() => {
                          setTab('graph');
                        }}
                        title="Locate node in graph"
                      >
                        <Network size={13} />
                        <span>Locate in Graph</span>
                      </button>
                      <button
                        className="neuro-action-pill"
                        onClick={() => downloadNote(note)}
                        title="Download raw Markdown note"
                      >
                        <Download size={13} />
                        <span>Download .md</span>
                      </button>
                    </div>
                  </div>

                  <div className="neuro-article-meta-strip">
                    <span className="neuro-pill neuro-pill-id">{note.id}</span>
                    <span className="neuro-pill neuro-pill-type">{note.type}</span>
                    <span className={`neuro-pill neuro-pill-risk-${note.risk.toLowerCase()}`}>
                      Risk: {note.risk}
                    </span>
                    {note.tested ? (
                      <span className="neuro-pill neuro-pill-tested">
                        <CheckCircle2 size={11} /> Tested by Author
                      </span>
                    ) : (
                      <span className="neuro-pill neuro-pill-untested">Not Locally Tested</span>
                    )}
                    {note.model && <span className="neuro-pill">Model: {note.model}</span>}
                    {note.updated && (
                      <span className="neuro-pill neuro-pill-date">Updated: {note.updated}</span>
                    )}
                  </div>

                  <h1 className="neuro-article-title">{note.title}</h1>

                  {/* Source Reference Anchor */}
                  <div className="neuro-article-source">
                    {isExternal(note.source) ? (
                      <a
                        href={note.source}
                        target="_blank"
                        rel="noreferrer"
                        className="neuro-source-anchor"
                      >
                        <span>Source: {new URL(note.source).hostname}</span>
                        <ExternalLink size={12} />
                      </a>
                    ) : (
                      <span className="neuro-source-local">
                        {note.source || 'Editorial research note'}
                      </span>
                    )}
                  </div>

                  {/* Tag Chips */}
                  {note.tags.length > 0 && (
                    <div className="neuro-tags-list">
                      {note.tags.map((tag) => (
                        <button
                          key={tag}
                          className="neuro-tag-chip"
                          onClick={() => updateParam('q', tag)}
                          title={`Search tag #${tag}`}
                        >
                          <Tag size={10} />
                          <span>#{tag}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Markdown Body Prose (Safe Rendering) */}
                  <div className="neuro-prose">
                    <Markdown
                      skipHtml
                      remarkPlugins={[remarkGfm]}
                      components={{
                        a: ({ href, children }) =>
                          href?.startsWith('/research/') ? (
                            <Link to={href}>{children}</Link>
                          ) : isExternal(href || '') ? (
                            <a href={href} target="_blank" rel="noreferrer">
                              {children} <ExternalLink size={11} style={{ display: 'inline' }} />
                            </a>
                          ) : (
                            <span>{children}</span>
                          ),
                        img: ({ alt }) => <span>{alt || 'Image reference'}</span>,
                      }}
                    >
                      {wikiMarkdown(note.body, vault.resolve)}
                    </Markdown>
                  </div>

                  {/* Relations & Graph Bridges */}
                  <div className="neuro-relations-grid">
                    <section className="neuro-rel-card">
                      <h3>Backlinks ({vault.backlinks(note.id).length})</h3>
                      <p className="neuro-rel-hint">Notes that explicitly link to this record.</p>
                      <ul className="neuro-rel-links">
                        {renderLinkList(vault.backlinks(note.id).map((n) => n.id))}
                        {!vault.backlinks(note.id).length && (
                          <li className="neuro-empty-hint">No incoming backlinks yet.</li>
                        )}
                      </ul>
                    </section>

                    <section className="neuro-rel-card">
                      <h3>
                        Outgoing Wiki Links ({[...new Set([...note.wiki, ...note.related])].length})
                      </h3>
                      <p className="neuro-rel-hint">Explicit wikilinks and related research references.</p>
                      <ul className="neuro-rel-links">
                        {renderLinkList([...new Set([...note.wiki, ...note.related])])}
                        {![...new Set([...note.wiki, ...note.related])].length && (
                          <li className="neuro-empty-hint">No outgoing references.</li>
                        )}
                      </ul>
                    </section>

                    <section className="neuro-rel-card">
                      <h3>Source Literature ({note.references.length})</h3>
                      <p className="neuro-rel-hint">Bibliographic citations and original papers.</p>
                      <ul className="neuro-rel-links">
                        {note.references.map((ref) => (
                          <li key={ref}>
                            {isExternal(ref) ? (
                              <a href={ref} target="_blank" rel="noreferrer" className="neuro-ext-ref">
                                {ref} <ExternalLink size={10} />
                              </a>
                            ) : (
                              <span>{ref}</span>
                            )}
                          </li>
                        ))}
                        {!note.references.length && (
                          <li className="neuro-empty-hint">No external sources cited.</li>
                        )}
                      </ul>
                    </section>
                  </div>

                  {/* Cross-Domain Bridges: Studies & Experiments */}
                  <div className="neuro-cross-domains">
                    <section className="neuro-domain-sec">
                      <h3>Linked Benchmark Studies</h3>
                      {!note.studies.length && (
                        <p className="neuro-empty-hint">No studies linked to this note.</p>
                      )}
                      <ul className="neuro-study-list">
                        {note.studies.map((id) => {
                          const study = DEMO_STUDIES.find((s) => s.id === id);
                          return (
                            <li key={id}>
                              {study ? (
                                <Link to={`/research/studies/${study.slug}`} className="neuro-study-link">
                                  <BookOpen size={14} />
                                  <span>{study.title}</span>
                                  <small>Synthetic Demo Study</small>
                                </Link>
                              ) : (
                                <span>{id} — (unresolved study id)</span>
                              )}
                            </li>
                          );
                        })}
                      </ul>
                    </section>

                    <section className="neuro-domain-sec">
                      <h3>Linked Experimental Probes</h3>
                      {!note.experiments.length && (
                        <p className="neuro-empty-hint">No experiments linked to this note.</p>
                      )}
                      <div className="neuro-exp-list">
                        {note.experiments.map((id) => {
                          const experiment = DEMO_EXPERIMENTS.find(
                            (e) => e.id === id || e.experimentId === id
                          );
                          return (
                            <details key={id} className="neuro-exp-detail">
                              <summary>
                                <span>{id}</span>
                                <small>{experiment ? experiment.model : 'Synthetic observation'}</small>
                              </summary>
                              {experiment && (
                                <div className="neuro-exp-body">
                                  <p>
                                    <strong>Model:</strong> {experiment.model}
                                  </p>
                                  <p>
                                    <strong>Observation:</strong> {experiment.observations}
                                  </p>
                                </div>
                              )}
                            </details>
                          );
                        })}
                      </div>
                    </section>
                  </div>
                </article>
              ) : (
                /* Card List Overview */
                <div className="neuro-card-list">
                  <div className="neuro-list-controls">
                    <div className="neuro-view-tabs">
                      <button
                        aria-pressed={mode === 'all'}
                        className={mode === 'all' ? 'active' : ''}
                        onClick={() => updateParam('view', 'all')}
                      >
                        All Records ({vault.notes.length})
                      </button>
                      <button
                        aria-pressed={mode === 'pinned'}
                        className={mode === 'pinned' ? 'active' : ''}
                        onClick={() => updateParam('view', 'pinned')}
                      >
                        Pinned ({vault.notes.filter((n) => n.pinned).length})
                      </button>
                      <button
                        aria-pressed={mode === 'sources'}
                        className={mode === 'sources' ? 'active' : ''}
                        onClick={() => updateParam('view', 'sources')}
                      >
                        Benchmark Sources ({vault.notes.filter((n) => isExternal(n.source)).length})
                      </button>
                    </div>

                    <div className="neuro-results-meta">
                      <span>Showing {matches.length} research records</span>
                    </div>
                  </div>

                  {matches.length === 0 ? (
                    <div className="neuro-empty-matches">
                      <p>No research notes match this query or folder filter.</p>
                      <button
                        className="neuro-btn-secondary"
                        onClick={() => {
                          updateParam('q', '');
                          updateParam('folder', '');
                        }}
                      >
                        Clear filters
                      </button>
                    </div>
                  ) : (
                    <div className="neuro-results-grid">
                      {matches.map((item) => (
                        <Link key={item.id} to={noteUrl(item.id)} className="neuro-note-card">
                          <div className="neuro-card-top">
                            <span className="neuro-card-type">{item.type}</span>
                            <span className="neuro-card-id">{item.id}</span>
                            {item.pinned && <span className="neuro-pin-dot" title="Pinned note" />}
                          </div>

                          <h3 className="neuro-card-title">{item.title}</h3>

                          <div className="neuro-card-tags">
                            {item.tags.slice(0, 3).map((tag) => (
                              <span key={tag} className="neuro-card-tag">
                                #{tag}
                              </span>
                            ))}
                            {item.tags.length > 3 && (
                              <span className="neuro-card-tag-more">+{item.tags.length - 3}</span>
                            )}
                          </div>

                          <div className="neuro-card-footer">
                            <span className="neuro-card-origin">
                              {item.source ? 'Source-backed' : 'Editorial note'}
                            </span>
                            <span className="neuro-card-date">{item.updated || 'Recent'}</span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </main>
          </div>
        </div>
      )}
    </section>
  );
}
