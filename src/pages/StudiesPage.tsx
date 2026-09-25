import React, { useEffect, useState, useMemo } from 'react';
import { Search, LayoutGrid, List, SlidersHorizontal, RotateCcw } from 'lucide-react';
import { Study, StudyStatus } from '../data/types';
import { studyRepository, StudyFilterOptions } from '../data/repositories/StudyRepository';
import { StudyCard } from '../components/research/StudyCard';
import { SegmentedControl } from '../components/ui/SegmentedControl';
import { Tag } from '../components/ui/Tag';

export const StudiesPage: React.FC = () => {
  const [studies, setStudies] = useState<Study[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<StudyStatus | 'all'>('all');
  const [selectedModel, setSelectedModel] = useState<string>('all');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date_desc' | 'date_asc' | 'title_asc'>('date_desc');

  // Available filter options
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [availableModels, setAvailableModels] = useState<string[]>([]);

  useEffect(() => {
    async function init() {
      const [allTags, allModels] = await Promise.all([
        studyRepository.getAllTags(),
        studyRepository.getAllModels(),
      ]);
      setAvailableTags(allTags);
      setAvailableModels(allModels);
    }
    init();
  }, []);

  useEffect(() => {
    async function fetchFiltered() {
      setLoading(true);
      const filterOpts: StudyFilterOptions = {
        searchQuery,
        status: selectedStatus,
        model: selectedModel,
        tag: selectedTag,
        sortBy,
      };
      const data = await studyRepository.getStudies(filterOpts);
      setStudies(data);
      setLoading(false);
    }
    fetchFiltered();
  }, [searchQuery, selectedStatus, selectedModel, selectedTag, sortBy]);

  const hasActiveFilters = useMemo(() => {
    return (
      searchQuery !== '' ||
      selectedStatus !== 'all' ||
      selectedModel !== 'all' ||
      selectedTag !== 'all'
    );
  }, [searchQuery, selectedStatus, selectedModel, selectedTag]);

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedStatus('all');
    setSelectedModel('all');
    setSelectedTag('all');
    setSortBy('date_desc');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <span
            style={{
              fontSize: '0.8rem',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: 'var(--accent-primary)',
            }}
          >
            Research Catalog
          </span>
          <h1
            style={{
              fontSize: '2.25rem',
              fontWeight: 700,
              letterSpacing: '-0.03em',
              margin: '0.35rem 0 0.5rem',
              color: 'var(--text-primary)',
            }}
          >
            Behavioral Studies
          </h1>
          <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', maxWidth: '680px' }}>
            Empirical inquiry into LLM persona drift, boundary testing, compliance decays, and meta-instruction resistance.
          </p>
        </div>

        {/* View Layout Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <SegmentedControl
            value={viewMode}
            onChange={(val) => setViewMode(val as 'grid' | 'list')}
            options={[
              { value: 'grid', label: 'Grid', icon: <LayoutGrid size={15} /> },
              { value: 'list', label: 'List', icon: <List size={15} /> },
            ]}
          />
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          padding: '1.25rem',
          backgroundColor: 'var(--surface-primary)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-subtle)',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          {/* Search Box */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              padding: '0.5rem 0.85rem',
              backgroundColor: 'var(--surface-secondary)',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)',
              flex: '1 1 260px',
            }}
          >
            <Search size={16} style={{ color: 'var(--text-tertiary)' }} />
            <input
              type="text"
              placeholder="Search studies by title, question, or tag..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                border: 'none',
                outline: 'none',
                backgroundColor: 'transparent',
                fontSize: '0.875rem',
                color: 'var(--text-primary)',
                fontFamily: 'inherit',
              }}
            />
          </div>

          {/* Status Dropdown */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as StudyStatus | 'all')}
            style={{
              padding: '0.5rem 0.85rem',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--surface-secondary)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-primary)',
              fontSize: '0.85rem',
              cursor: 'pointer',
              outline: 'none',
            }}
            aria-label="Filter by status"
          >
            <option value="all">All Statuses</option>
            <option value="peer_reviewed">Peer Reviewed</option>
            <option value="completed">Completed</option>
            <option value="in_progress">In Progress</option>
            <option value="draft">Draft</option>
          </select>

          {/* Model Filter */}
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            style={{
              padding: '0.5rem 0.85rem',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--surface-secondary)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-primary)',
              fontSize: '0.85rem',
              cursor: 'pointer',
              outline: 'none',
            }}
            aria-label="Filter by model"
          >
            <option value="all">All Evaluated Models</option>
            {availableModels.map((model) => (
              <option key={model} value={model}>
                {model}
              </option>
            ))}
          </select>

          {/* Sorting Dropdown */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'date_desc' | 'date_asc' | 'title_asc')}
            style={{
              padding: '0.5rem 0.85rem',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--surface-secondary)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-primary)',
              fontSize: '0.85rem',
              cursor: 'pointer',
              outline: 'none',
            }}
            aria-label="Sort studies"
          >
            <option value="date_desc">Newest First</option>
            <option value="date_asc">Oldest First</option>
            <option value="title_asc">Title (A-Z)</option>
          </select>

          {/* Reset Filters Button */}
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                fontSize: '0.8125rem',
                color: 'var(--accent-primary)',
                cursor: 'pointer',
                padding: '0.5rem',
              }}
            >
              <RotateCcw size={13} />
              <span>Reset</span>
            </button>
          )}
        </div>

        {/* Tag Filters Row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', paddingTop: '0.25rem' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Filter by Tag:
          </span>
          <Tag
            size="sm"
            active={selectedTag === 'all'}
            onClick={() => setSelectedTag('all')}
          >
            All
          </Tag>
          {availableTags.map((tag) => (
            <Tag
              key={tag}
              size="sm"
              active={selectedTag === tag}
              onClick={() => setSelectedTag(tag === selectedTag ? 'all' : tag)}
            >
              {tag}
            </Tag>
          ))}
        </div>
      </div>

      {/* Studies Listing */}
      {loading ? (
        <div style={{ padding: '4rem 0', textAlign: 'center', color: 'var(--text-tertiary)' }}>
          Loading behavioral studies...
        </div>
      ) : studies.length === 0 ? (
        <div
          style={{
            padding: '4rem 1.5rem',
            textAlign: 'center',
            backgroundColor: 'var(--surface-primary)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <SlidersHorizontal size={32} style={{ color: 'var(--text-tertiary)', margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: '1.15rem', fontWeight: 600, marginBottom: '0.5rem' }}>
            No matching studies found
          </h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
            Try adjusting your search criteria or resetting filters.
          </p>
          <button
            onClick={resetFilters}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--accent-primary)',
              color: '#FFFFFF',
              fontWeight: 500,
              fontSize: '0.875rem',
              cursor: 'pointer',
            }}
          >
            Clear all filters
          </button>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: viewMode === 'grid' ? 'repeat(auto-fill, minmax(380px, 1fr))' : '1fr',
            gap: '1.25rem',
          }}
        >
          {studies.map((study) => (
            <StudyCard key={study.id} study={study} layout={viewMode} />
          ))}
        </div>
      )}
    </div>
  );
};
