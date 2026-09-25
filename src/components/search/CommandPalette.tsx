import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, BookOpen, FlaskConical, Users, ArrowRight, X } from 'lucide-react';
import { DEMO_STUDIES } from '../../data/demo/studies';
import { DEMO_EXPERIMENTS } from '../../data/demo/experiments';
import { DEMO_PERSONAS } from '../../data/demo/personas';
import { buildVault } from '../../research/neuro/vault';

const bundledVault = import.meta.glob('../../../research-vault/**/*.md', { query: '?raw', import: 'default', eager: true }) as Record<string, string>;

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SearchResultItem {
  id: string;
  title: string;
  category: 'Studies' | 'Experiments' | 'Personas' | 'Notes' | 'Neuro Brain';
  url: string;
  icon: React.ReactNode;
  meta?: string;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const vault = buildVault(bundledVault);

  // Aggregate searchable items
  const allItems: SearchResultItem[] = [
    {
      id: 'neuro-brain-home',
      title: 'Neuro Brain Knowledge Vault',
      category: 'Neuro Brain' as const,
      url: '/research/neuro-brain',
      icon: <BookOpen size={16} />,
      meta: '19 research categories • Obsidian-style vault',
    },
    ...vault.notes.map((n) => ({
      id: n.id,
      title: n.title,
      category: 'Neuro Brain' as const,
      url: `/research/neuro-brain/${encodeURIComponent(n.id)}`,
      icon: <BookOpen size={16} />,
      meta: `${n.folder} • ${n.tags.slice(0, 3).join(', ')}`,
    })),
    ...DEMO_STUDIES.map((s) => ({
      id: s.id,
      title: s.title,
      category: 'Studies' as const,
      url: `/research/studies/${s.slug}`,
      icon: <BookOpen size={16} />,
      meta: s.models.join(', '),
    })),
    ...DEMO_EXPERIMENTS.map((e) => ({
      id: e.id,
      title: `${e.experimentId}: ${e.baselinePersona} vs ${e.modifiedPersona}`,
      category: 'Experiments' as const,
      url: `/research/experiments?id=${e.id}`,
      icon: <FlaskConical size={16} />,
      meta: `${e.model} • ${e.riskLevel.toUpperCase()}`,
    })),
    ...DEMO_PERSONAS.map((p) => ({
      id: p.id,
      title: p.name,
      category: 'Personas' as const,
      url: `/research/personas?id=${p.id}`,
      icon: <Users size={16} />,
      meta: p.category,
    })),
  ];

  const filteredItems = query.trim() === ''
    ? allItems.slice(0, 6)
    : allItems.filter(
        (item) =>
          item.title.toLowerCase().includes(query.toLowerCase()) ||
          (item.meta && item.meta.toLowerCase().includes(query.toLowerCase())) ||
          item.category.toLowerCase().includes(query.toLowerCase())
      );

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredItems.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % Math.max(1, filteredItems.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredItems[selectedIndex]) {
        navigate(filteredItems[selectedIndex].url);
        onClose();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Archive Search Command Palette"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        backgroundColor: 'rgba(0, 0, 0, 0.45)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: '12vh',
        paddingLeft: '1rem',
        paddingRight: '1rem',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
        style={{
          width: '100%',
          maxWidth: '620px',
          backgroundColor: 'var(--surface-primary)',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--border-subtle)',
          boxShadow: 'var(--shadow-lg)',
          overflow: 'hidden',
          animation: 'fadeInScale 0.2s cubic-bezier(0.2, 0.8, 0.2, 1)',
        }}
      >
        {/* Search Input Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '1rem 1.25rem',
            borderBottom: '1px solid var(--border-subtle)',
            gap: '0.75rem',
          }}
        >
          <Search size={18} style={{ color: 'var(--accent-primary)', flexShrink: 0 }} />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search studies, experiments, personas, notes..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{
              width: '100%',
              border: 'none',
              outline: 'none',
              backgroundColor: 'transparent',
              fontSize: '1rem',
              color: 'var(--text-primary)',
              fontFamily: 'inherit',
            }}
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              style={{ color: 'var(--text-tertiary)', padding: '2px' }}
              aria-label="Clear query"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Results List */}
        <div style={{ maxHeight: '360px', overflowY: 'auto', padding: '0.5rem' }}>
          {filteredItems.length === 0 ? (
            <div
              style={{
                padding: '2.5rem 1rem',
                textAlign: 'center',
                color: 'var(--text-tertiary)',
                fontSize: '0.875rem',
              }}
            >
              No matching research items found.
            </div>
          ) : (
            filteredItems.map((item, index) => {
              const isSelected = index === selectedIndex;
              return (
                <div
                  key={`${item.category}-${item.id}`}
                  onClick={() => {
                    navigate(item.url);
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(index)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.65rem 0.85rem',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: isSelected ? 'var(--accent-subtle)' : 'transparent',
                    cursor: 'pointer',
                    transition: 'background var(--transition-fast)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0 }}>
                    <span
                      style={{
                        color: isSelected ? 'var(--accent-primary)' : 'var(--text-secondary)',
                        display: 'flex',
                      }}
                    >
                      {item.icon}
                    </span>
                    <div style={{ minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: '0.875rem',
                          fontWeight: isSelected ? 600 : 500,
                          color: isSelected ? 'var(--accent-primary)' : 'var(--text-primary)',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {item.title}
                      </div>
                      {item.meta && (
                        <div
                          style={{
                            fontSize: '0.75rem',
                            color: 'var(--text-tertiary)',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {item.meta}
                        </div>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
                    <span
                      style={{
                        fontSize: '0.7rem',
                        fontWeight: 500,
                        padding: '0.15rem 0.5rem',
                        borderRadius: 'var(--radius-full)',
                        backgroundColor: 'var(--surface-secondary)',
                        color: 'var(--text-tertiary)',
                      }}
                    >
                      {item.category}
                    </span>
                    {isSelected && <ArrowRight size={14} style={{ color: 'var(--accent-primary)' }} />}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div
          style={{
            padding: '0.5rem 1.25rem',
            backgroundColor: 'var(--surface-secondary)',
            borderTop: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.75rem',
            color: 'var(--text-tertiary)',
          }}
        >
          <span>Use ↑ ↓ to navigate, ↵ to select, esc to close</span>
          <span>Spotlight Search</span>
        </div>
      </div>
    </div>
  );
};
