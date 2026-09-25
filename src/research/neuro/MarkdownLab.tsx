import React, { useState, useMemo } from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  VaultNote,
  parseNote,
  NOTE_TEMPLATES,
  categories,
} from './vault';
import {
  FileText,
  Upload,
  Download,
  Copy,
  Check,
  PlusCircle,
  AlertCircle,
  CheckCircle2,
  FileCode,
  Search,
  FolderOpen,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

interface MarkdownLabProps {
  vault: {
    notes: VaultNote[];
    errors: string[];
    resolve: (q: string) => VaultNote | undefined;
  };
  onSaveNote: (path: string, raw: string) => void;
  onSelectNoteInLibrary: (noteId: string) => void;
}

export const MarkdownLab: React.FC<MarkdownLabProps> = ({
  vault,
  onSaveNote,
  onSelectNoteInLibrary,
}) => {
  const [activeTab, setActiveTab] = useState<'editor' | 'files' | 'templates'>('editor');
  const [rawText, setRawText] = useState<string>(NOTE_TEMPLATES[0].content);
  const [copied, setCopied] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string>('');
  const [searchFilter, setSearchFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Real-time frontmatter validation
  const validation = useMemo(() => {
    try {
      const parsed = parseNote(rawText, 'draft.md');
      return { valid: true, note: parsed, error: null };
    } catch (e) {
      return { valid: false, note: null, error: e instanceof Error ? e.message : String(e) };
    }
  }, [rawText]);

  // Load a template into the editor
  const handleLoadTemplate = (templateContent: string) => {
    // Generate a fresh unique ID based on timestamp
    const uniqueId = `REC-${Date.now().toString().slice(-4)}`;
    const customized = templateContent.replace(/id:\s*([A-Z]+-[A-Z]+)/i, `id: $1-${uniqueId}`);
    setRawText(customized);
    setActiveTab('editor');
    setSaveStatus('Template loaded into editor.');
    setTimeout(() => setSaveStatus(''), 4000);
  };

  // Copy raw content
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(rawText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setSaveStatus('Failed to copy to clipboard.');
    }
  };

  // Download raw markdown file
  const handleDownload = () => {
    const filename = validation.note ? `${validation.note.id}.md` : 'note.md';
    const blob = new Blob([rawText], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Save current note into vault session
  const handleSaveToVault = () => {
    if (!validation.valid || !validation.note) {
      setSaveStatus('Cannot save: fix frontmatter errors first.');
      return;
    }
    const folder = validation.note.folder || '15_Notes';
    const path = `local/${folder}/${encodeURIComponent(validation.note.id)}.md`;
    onSaveNote(path, rawText);
    setSaveStatus(`Saved note "${validation.note.title}" (${validation.note.id}) to vault!`);
    setTimeout(() => setSaveStatus(''), 5000);
  };

  // File import handler
  const handleImportFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    let importedCount = 0;
    const errors: string[] = [];

    for (const file of Array.from(files)) {
      try {
        if (file.size > 500_000) throw new Error(`${file.name}: Exceeds 500 KB limit`);
        const text = await file.text();
        const parsed = parseNote(text, `local/15_Notes/${file.name}`);
        const path = `local/15_Notes/${encodeURIComponent(parsed.id)}.md`;
        onSaveNote(path, text);
        importedCount++;
      } catch (err) {
        errors.push(err instanceof Error ? err.message : String(err));
      }
    }

    if (importedCount > 0) {
      setSaveStatus(`Successfully imported ${importedCount} note(s).`);
      setActiveTab('files');
    }
    if (errors.length > 0) {
      alert(`Import issues:\n${errors.join('\n')}`);
    }
    e.target.value = '';
  };

  // Filtered vault files
  const filteredVaultFiles = useMemo(() => {
    return vault.notes
      .filter((n) => {
        const matchesCategory =
          categoryFilter === 'all' || n.folder.startsWith(categoryFilter);
        const matchesQuery =
          !searchFilter.trim() ||
          n.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
          n.id.toLowerCase().includes(searchFilter.toLowerCase()) ||
          n.tags.some((t) => t.toLowerCase().includes(searchFilter.toLowerCase()));
        return matchesCategory && matchesQuery;
      })
      .sort((a, b) => b.updated.localeCompare(a.updated));
  }, [vault.notes, categoryFilter, searchFilter]);

  return (
    <div className="markdown-lab">
      {/* Lab Header & Tabs */}
      <div className="lab-header">
        <div>
          <span className="neuro-eyebrow">MARKDOWN RESEARCH LABORATORY</span>
          <h2 className="lab-title">Vault Authoring & Ingestion Studio</h2>
          <p className="lab-subtitle">
            Create, paste, validate, and import Markdown research documents with strict YAML frontmatter integrity.
          </p>
        </div>

        {/* Sub-Tabs */}
        <div className="lab-subtabs">
          <button
            className={`lab-tab-btn ${activeTab === 'editor' ? 'active' : ''}`}
            onClick={() => setActiveTab('editor')}
          >
            <FileCode size={14} />
            <span>Editor & Live Preview</span>
          </button>
          <button
            className={`lab-tab-btn ${activeTab === 'templates' ? 'active' : ''}`}
            onClick={() => setActiveTab('templates')}
          >
            <PlusCircle size={14} />
            <span>Templates ({NOTE_TEMPLATES.length})</span>
          </button>
          <button
            className={`lab-tab-btn ${activeTab === 'files' ? 'active' : ''}`}
            onClick={() => setActiveTab('files')}
          >
            <FolderOpen size={14} />
            <span>Vault Files ({vault.notes.length})</span>
          </button>
        </div>
      </div>

      {saveStatus && (
        <div
          className={`lab-notification ${
            validation.valid ? 'success' : 'warning'
          }`}
        >
          {validation.valid ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          <span>{saveStatus}</span>
        </div>
      )}

      {/* 1. EDITOR & LIVE PREVIEW TAB */}
      {activeTab === 'editor' && (
        <div className="lab-editor-grid">
          {/* Left Column: Markdown Input */}
          <div className="lab-editor-pane">
            <div className="lab-pane-header">
              <div className="lab-validation-badge">
                {validation.valid ? (
                  <span className="badge-valid">
                    <CheckCircle2 size={13} /> Valid Frontmatter · ID:{' '}
                    <strong>{validation.note?.id}</strong>
                  </span>
                ) : (
                  <span className="badge-invalid">
                    <AlertCircle size={13} /> {validation.error}
                  </span>
                )}
              </div>

              <div className="lab-pane-actions">
                <button
                  onClick={handleCopy}
                  className="lab-btn-icon"
                  title="Copy Raw Markdown"
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
                <button
                  onClick={handleDownload}
                  className="lab-btn-icon"
                  title="Download .md file"
                >
                  <Download size={14} />
                  <span>Download .md</span>
                </button>
                <button
                  onClick={handleSaveToVault}
                  className="lab-btn-save"
                  disabled={!validation.valid}
                  title="Save note to active browser vault session"
                >
                  <PlusCircle size={14} />
                  <span>Save to Vault</span>
                </button>
              </div>
            </div>

            <textarea
              className="lab-textarea"
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder="Paste or write Markdown with YAML frontmatter..."
              spellCheck={false}
            />

            <div className="lab-textarea-footer">
              <span>{rawText.length.toLocaleString()} characters</span>
              <span>{rawText.split(/\s+/).filter(Boolean).length} words</span>
              <span>Safe sandbox: prompt text rendered as non-executable research data</span>
            </div>
          </div>

          {/* Right Column: Live Rendered Preview */}
          <div className="lab-preview-pane">
            <div className="lab-pane-header">
              <span className="lab-preview-label">Live Scientific Render</span>
              {validation.note && (
                <span className="lab-type-tag">
                  {validation.note.type} · Risk: {validation.note.risk}
                </span>
              )}
            </div>

            <div className="lab-preview-body">
              {validation.note ? (
                <div className="lab-preview-card">
                  <span className="neuro-eyebrow">
                    {validation.note.id} · {validation.note.status}
                  </span>
                  <h3 className="lab-preview-title">{validation.note.title}</h3>

                  <div className="neuro-meta">
                    <span>
                      {validation.note.tested
                        ? 'Locally Tested'
                        : 'Literature Benchmark'}
                    </span>
                    <span>Updated {validation.note.date || 'Today'}</span>
                    {validation.note.model && <span>Model: {validation.note.model}</span>}
                  </div>

                  {validation.note.tags.length > 0 && (
                    <div className="neuro-tags">
                      {validation.note.tags.map((t) => (
                        <span key={t} className="neuro-tag">
                          #{t}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="neuro-prose">
                    <Markdown skipHtml remarkPlugins={[remarkGfm]}>
                      {validation.note.body}
                    </Markdown>
                  </div>
                </div>
              ) : (
                <div className="lab-preview-error">
                  <AlertCircle size={28} />
                  <p>Markdown preview unavailable due to YAML frontmatter syntax error.</p>
                  <code>{validation.error}</code>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2. TEMPLATES TAB */}
      {activeTab === 'templates' && (
        <div className="lab-templates-view">
          <div className="lab-templates-header">
            <h3>Standardized Research Templates</h3>
            <p>
              Pre-structured YAML metadata archetypes designed for jailbreak reproduction, prompt injection taxonomies, and alignment verification.
            </p>
          </div>

          <div className="lab-templates-grid">
            {NOTE_TEMPLATES.map((tmpl) => (
              <div key={tmpl.id} className="lab-template-card">
                <div className="lab-tmpl-top">
                  <span className="lab-tmpl-icon">{tmpl.icon}</span>
                  <span className="lab-tmpl-badge">{tmpl.badge}</span>
                </div>
                <h4 className="lab-tmpl-title">{tmpl.title}</h4>
                <p className="lab-tmpl-desc">{tmpl.description}</p>
                <div className="lab-tmpl-meta">
                  Target folder: <code>{tmpl.category}</code>
                </div>
                <button
                  className="lab-tmpl-btn"
                  onClick={() => handleLoadTemplate(tmpl.content)}
                >
                  <PlusCircle size={14} />
                  <span>Use Template in Editor</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. VAULT FILES TAB */}
      {activeTab === 'files' && (
        <div className="lab-files-view">
          <div className="lab-files-toolbar">
            <div className="lab-files-search">
              <Search size={14} style={{ color: 'var(--text-tertiary)' }} />
              <input
                type="search"
                placeholder="Filter vault files..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
              />
            </div>

            <select
              className="lab-folder-select"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              aria-label="Filter by folder"
            >
              <option value="all">All Folders ({vault.notes.length})</option>
              {categories.map((c) => (
                <option key={c} value={c.slice(0, 2)}>
                  {c}
                </option>
              ))}
            </select>

            <label className="lab-import-btn">
              <Upload size={14} />
              <span>Import .md File(s)</span>
              <input
                type="file"
                accept=".md,.markdown"
                multiple
                onChange={handleImportFiles}
                style={{ display: 'none' }}
              />
            </label>
          </div>

          <div className="lab-files-table-wrapper">
            <table className="lab-files-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Title</th>
                  <th>Folder</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Updated</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredVaultFiles.map((note) => (
                  <tr key={note.id}>
                    <td>
                      <code>{note.id}</code>
                    </td>
                    <td>
                      <div className="lab-file-title-cell">
                        <strong>{note.title}</strong>
                        {note.source && (
                          <span className="lab-provenance-tag">Source</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className="lab-folder-pill">{note.folder}</span>
                    </td>
                    <td>{note.type}</td>
                    <td>
                      <span className={`status-pill ${note.status}`}>
                        {note.status}
                      </span>
                    </td>
                    <td>{note.updated || note.date}</td>
                    <td>
                      <div className="lab-row-actions">
                        <button
                          onClick={() => {
                            setRawText(note.raw);
                            setActiveTab('editor');
                          }}
                          className="lab-action-btn"
                          title="Open in Editor"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => onSelectNoteInLibrary(note.id)}
                          className="lab-action-btn primary"
                          title="View in Library"
                        >
                          View
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
