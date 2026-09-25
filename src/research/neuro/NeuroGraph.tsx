import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  VaultNote,
  buildGraphData,
  GraphNode,
  GraphCluster,
  noteUrl,
} from './vault';
import {
  Search,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Sparkles,
  ExternalLink,
  BookOpen,
  ArrowRight,
  Filter,
} from 'lucide-react';

interface NeuroGraphProps {
  vault: {
    notes: VaultNote[];
    edges: { from: string; to: string }[];
    resolve: (q: string) => VaultNote | undefined;
    backlinks: (id: string) => VaultNote[];
  };
  onSelectNote?: (noteId: string) => void;
}

export const NeuroGraph: React.FC<NeuroGraphProps> = ({ vault, onSelectNote }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [clusterFilter, setClusterFilter] = useState<GraphCluster | 'all'>('all');

  const width = 1000;
  const height = 620;

  // Build graph nodes & edges
  const graphData = useMemo(() => {
    return buildGraphData(vault, width, height);
  }, [vault]);

  // Compute connected neighbors for active node
  const activeNodeId = hoveredNodeId || selectedNodeId;
  const connectedIds = useMemo(() => {
    if (!activeNodeId) return new Set<string>();
    const set = new Set<string>([activeNodeId]);
    graphData.edges.forEach((e) => {
      if (e.from.toLowerCase() === activeNodeId.toLowerCase()) set.add(e.to);
      if (e.to.toLowerCase() === activeNodeId.toLowerCase()) set.add(e.from);
    });
    return set;
  }, [activeNodeId, graphData.edges]);

  // Selected note details
  const selectedNote = useMemo(() => {
    if (!selectedNodeId) return null;
    return vault.notes.find((n) => n.id.toLowerCase() === selectedNodeId.toLowerCase()) || null;
  }, [selectedNodeId, vault.notes]);

  // Pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).tagName.toLowerCase() === 'circle') return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const factor = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom((prev) => Math.max(0.4, Math.min(2.8, prev * factor)));
  };

  const resetView = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setSelectedNodeId(null);
  }, []);

  // Search matching nodes
  const matchingNodeIds = useMemo(() => {
    if (!searchQuery.trim()) return null;
    const q = searchQuery.toLowerCase().trim();
    return new Set(
      graphData.nodes
        .filter(
          (n) =>
            n.title.toLowerCase().includes(q) ||
            n.id.toLowerCase().includes(q) ||
            n.tags.some((t) => t.toLowerCase().includes(q))
        )
        .map((n) => n.id)
    );
  }, [searchQuery, graphData.nodes]);

  // Focus view on node when selected from search
  const focusOnNode = (node: GraphNode) => {
    setSelectedNodeId(node.id);
    const targetPanX = width / 2 - node.x;
    const targetPanY = height / 2 - node.y;
    setPan({ x: targetPanX * 0.7, y: targetPanY * 0.7 });
    setZoom(1.3);
  };

  // Node position dictionary for fast edge rendering
  const nodeMap = useMemo(() => {
    const map = new Map<string, GraphNode>();
    graphData.nodes.forEach((n) => map.set(n.id.toLowerCase(), n));
    return map;
  }, [graphData.nodes]);

  return (
    <div className="neuro-graph-shell" ref={containerRef}>
      {/* Top Toolbar */}
      <div className="neuro-graph-toolbar">
        {/* Cluster Filter Chips */}
        <div className="neuro-graph-filters">
          <span className="neuro-graph-filter-label">
            <Filter size={13} /> Clusters:
          </span>
          {[
            { id: 'all', label: 'All Knowledge' },
            { id: 'adversarial', label: 'Adversarial & Jailbreak', color: '#FF5E3A' },
            { id: 'alignment', label: 'Alignment & Defenses', color: '#00D0B4' },
            { id: 'persona', label: 'Persona & Drift', color: '#A86EFF' },
            { id: 'evidence', label: 'Sources & Benchmarks', color: '#2997FF' },
          ].map((item) => (
            <button
              key={item.id}
              className={`neuro-graph-chip ${clusterFilter === item.id ? 'active' : ''}`}
              onClick={() => setClusterFilter(item.id as any)}
              style={
                item.color && clusterFilter === item.id
                  ? { borderColor: item.color, color: '#fff', backgroundColor: `${item.color}25` }
                  : undefined
              }
            >
              {item.color && (
                <span className="neuro-graph-dot" style={{ backgroundColor: item.color }} />
              )}
              {item.label}
            </button>
          ))}
        </div>

        {/* Search Bar in Graph */}
        <div className="neuro-graph-search">
          <Search size={14} style={{ color: 'var(--text-tertiary)' }} />
          <input
            type="search"
            placeholder="Search nodes in brain network..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <span className="neuro-graph-search-count">
              {matchingNodeIds ? matchingNodeIds.size : 0} nodes
            </span>
          )}
        </div>

        {/* Zoom Controls */}
        <div className="neuro-graph-controls">
          <button
            onClick={() => setZoom((z) => Math.min(2.8, z * 1.2))}
            title="Zoom In"
            aria-label="Zoom in graph"
          >
            <ZoomIn size={15} />
          </button>
          <button
            onClick={() => setZoom((z) => Math.max(0.4, z * 0.8))}
            title="Zoom Out"
            aria-label="Zoom out graph"
          >
            <ZoomOut size={15} />
          </button>
          <button onClick={resetView} title="Recenter Graph" aria-label="Reset graph view">
            <RotateCcw size={14} />
          </button>
        </div>
      </div>

      {/* Main Canvas Viewport */}
      <div
        className="neuro-graph-canvas-container"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onWheel={handleWheel}
        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
      >
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="neuro-graph-svg"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            {/* Subtle glow filter */}
            <filter id="nodeGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3.5" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="haloGlow" x="-60%" y="-60%" width="220%" height="220%">
              <feGaussianBlur stdDeviation="6" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <g
            transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}
            style={{
              transformOrigin: `${width / 2}px ${height / 2}px`,
              transition: isDragging ? 'none' : 'transform 0.15s ease-out',
            }}
          >
            {/* Brain Hemisphere Backdrop Ambient Glows */}
            <ellipse
              cx={width * 0.32}
              cy={height * 0.5}
              rx={180}
              ry={140}
              fill="rgba(255, 94, 58, 0.025)"
              filter="blur(40px)"
            />
            <ellipse
              cx={width * 0.68}
              cy={height * 0.5}
              rx={180}
              ry={140}
              fill="rgba(41, 151, 255, 0.025)"
              filter="blur(40px)"
            />

            {/* Connecting Edges */}
            <g className="neuro-graph-edges">
              {graphData.edges.map((edge, i) => {
                const source = nodeMap.get(edge.from.toLowerCase());
                const target = nodeMap.get(edge.to.toLowerCase());
                if (!source || !target) return null;

                const isConnected =
                  activeNodeId &&
                  (edge.from.toLowerCase() === activeNodeId.toLowerCase() ||
                    edge.to.toLowerCase() === activeNodeId.toLowerCase());

                const isFilteredOut =
                  clusterFilter !== 'all' &&
                  source.cluster !== clusterFilter &&
                  target.cluster !== clusterFilter;

                if (isFilteredOut) return null;

                return (
                  <line
                    key={`edge-${i}`}
                    x1={source.x}
                    y1={source.y}
                    x2={target.x}
                    y2={target.y}
                    stroke={isConnected ? '#2997FF' : 'rgba(255, 255, 255, 0.14)'}
                    strokeWidth={isConnected ? 2.2 : 1}
                    strokeOpacity={isConnected ? 0.9 : 0.4}
                    strokeDasharray={isConnected ? 'none' : undefined}
                    style={{ transition: 'stroke 0.2s ease, stroke-width 0.2s ease' }}
                  />
                );
              })}
            </g>

            {/* Graph Nodes */}
            <g className="neuro-graph-nodes">
              {graphData.nodes.map((node) => {
                const isSelected = selectedNodeId?.toLowerCase() === node.id.toLowerCase();
                const isHovered = hoveredNodeId?.toLowerCase() === node.id.toLowerCase();
                const isHighlighted =
                  activeNodeId && connectedIds.has(node.id.toLowerCase());
                const isSearchMatch = matchingNodeIds
                  ? matchingNodeIds.has(node.id)
                  : true;

                const isClusterMatch =
                  clusterFilter === 'all' || node.cluster === clusterFilter;

                const dimmed =
                  (activeNodeId && !isHighlighted) ||
                  (matchingNodeIds && !isSearchMatch) ||
                  !isClusterMatch;

                const opacity = dimmed ? 0.18 : 1;

                return (
                  <g
                    key={node.id}
                    transform={`translate(${node.x}, ${node.y})`}
                    style={{
                      cursor: 'pointer',
                      opacity,
                      transition: 'opacity 0.2s ease, transform 0.2s ease',
                    }}
                    onMouseEnter={() => setHoveredNodeId(node.id)}
                    onMouseLeave={() => setHoveredNodeId(null)}
                    onClick={(e) => {
                      e.stopPropagation();
                      focusOnNode(node);
                    }}
                    onDoubleClick={(e) => {
                      e.stopPropagation();
                      if (onSelectNote) onSelectNote(node.id);
                    }}
                  >
                    {/* Source Beacon Halo */}
                    {node.isSource && (
                      <circle
                        r={node.size + 7}
                        fill="none"
                        stroke={node.color}
                        strokeWidth={1.2}
                        strokeDasharray="3 3"
                        opacity={0.6}
                      />
                    )}

                    {/* Active Selection / Hover Ring */}
                    {(isSelected || isHovered) && (
                      <circle
                        r={node.size + 6}
                        fill="none"
                        stroke="#FFFFFF"
                        strokeWidth={2}
                        filter="url(#nodeGlow)"
                      />
                    )}

                    {/* Main Node Body */}
                    <circle
                      r={node.size}
                      fill={node.color}
                      stroke={isSelected ? '#FFFFFF' : 'rgba(0, 0, 0, 0.4)'}
                      strokeWidth={node.isSource ? 2 : 1}
                      filter={node.isSource || isSelected ? 'url(#nodeGlow)' : undefined}
                    />

                    {/* Central Anchor Dot for Landmarks */}
                    {node.size > 12 && (
                      <circle r={2.5} fill="#FFFFFF" opacity={0.8} />
                    )}

                    {/* Node Text Label (Displayed for Landmark Hubs or when highlighted/hovered/zoomed) */}
                    {(node.size >= 12 || isSelected || isHovered || zoom >= 1.25) && (
                      <text
                        y={node.size + 13}
                        textAnchor="middle"
                        className="neuro-graph-node-label"
                        fill={isSelected ? '#FFFFFF' : 'rgba(255, 255, 255, 0.85)'}
                        fontSize={isSelected ? '12px' : '10.5px'}
                        fontWeight={isSelected || node.size >= 14 ? 600 : 400}
                        style={{ pointerEvents: 'none', userSelect: 'none' }}
                      >
                        {node.title.length > 22
                          ? `${node.title.slice(0, 20)}…`
                          : node.title}
                      </text>
                    )}
                  </g>
                );
              })}
            </g>
          </g>
        </svg>

        {/* Graph Legend */}
        <div className="neuro-graph-legend">
          <div className="neuro-graph-legend-item">
            <span className="neuro-graph-legend-dot" style={{ backgroundColor: '#FF5E3A' }} />
            <span>Adversarial & Jailbreak</span>
          </div>
          <div className="neuro-graph-legend-item">
            <span className="neuro-graph-legend-dot" style={{ backgroundColor: '#00D0B4' }} />
            <span>Alignment & Defenses</span>
          </div>
          <div className="neuro-graph-legend-item">
            <span className="neuro-graph-legend-dot" style={{ backgroundColor: '#A86EFF' }} />
            <span>Persona & Drift</span>
          </div>
          <div className="neuro-graph-legend-item">
            <span className="neuro-graph-legend-dot" style={{ backgroundColor: '#2997FF' }} />
            <span>Source Literature</span>
          </div>
          <div className="neuro-graph-legend-item">
            <span className="neuro-graph-legend-ring" />
            <span>Source Provenance</span>
          </div>
        </div>
      </div>

      {/* Side Detail Inspector Panel */}
      {selectedNote && (
        <aside className="neuro-graph-side-panel">
          <div className="neuro-graph-side-header">
            <span className="neuro-graph-badge">
              {selectedNote.type.toUpperCase()} · {selectedNote.folder}
            </span>
            <button
              onClick={() => setSelectedNodeId(null)}
              className="neuro-graph-close-btn"
              aria-label="Close inspector"
            >
              ✕
            </button>
          </div>

          <h3 className="neuro-graph-side-title">{selectedNote.title}</h3>

          <div className="neuro-graph-meta-pills">
            <span className="neuro-pill">
              Risk: <strong>{selectedNote.risk}</strong>
            </span>
            <span className="neuro-pill">
              {selectedNote.tested ? 'Locally Evaluated' : 'Literature Benchmark'}
            </span>
            {selectedNote.model && (
              <span className="neuro-pill">Model: {selectedNote.model}</span>
            )}
          </div>

          {selectedNote.source && (
            <div className="neuro-graph-source-box">
              <span className="neuro-graph-source-label">Provenance</span>
              <a
                href={selectedNote.source}
                target="_blank"
                rel="noreferrer"
                className="neuro-graph-source-link"
              >
                <span>{selectedNote.source}</span>
                <ExternalLink size={12} />
              </a>
            </div>
          )}

          <div className="neuro-graph-excerpt">
            <p>
              {selectedNote.body
                .replace(/^#+.*$/gm, '')
                .replace(/\[\[.*?\]\]/g, '')
                .slice(0, 240)
                .trim()}
              …
            </p>
          </div>

          {selectedNote.tags.length > 0 && (
            <div className="neuro-graph-tags">
              {selectedNote.tags.map((t) => (
                <span key={t} className="neuro-tag">
                  #{t}
                </span>
              ))}
            </div>
          )}

          {/* Connected Links Summary */}
          <div className="neuro-graph-connections-box">
            <div className="neuro-graph-conn-col">
              <span className="neuro-conn-label">
                Backlinks ({vault.backlinks(selectedNote.id).length})
              </span>
              <ul className="neuro-conn-list">
                {vault
                  .backlinks(selectedNote.id)
                  .slice(0, 3)
                  .map((b) => (
                    <li
                      key={b.id}
                      onClick={() => {
                        const targetNode = nodeMap.get(b.id.toLowerCase());
                        if (targetNode) focusOnNode(targetNode);
                      }}
                    >
                      {b.title}
                    </li>
                  ))}
                {vault.backlinks(selectedNote.id).length === 0 && (
                  <li className="neuro-conn-empty">None</li>
                )}
              </ul>
            </div>

            <div className="neuro-graph-conn-col">
              <span className="neuro-conn-label">
                Outgoing ({selectedNote.wiki.length + selectedNote.related.length})
              </span>
              <ul className="neuro-conn-list">
                {[...new Set([...selectedNote.wiki, ...selectedNote.related])]
                  .slice(0, 3)
                  .map((relId) => {
                    const relNote = vault.resolve(relId);
                    return (
                      <li
                        key={relId}
                        onClick={() => {
                          if (relNote) {
                            const targetNode = nodeMap.get(relNote.id.toLowerCase());
                            if (targetNode) focusOnNode(targetNode);
                          }
                        }}
                      >
                        {relNote ? relNote.title : relId}
                      </li>
                    );
                  })}
              </ul>
            </div>
          </div>

          {/* Action to Library */}
          <div className="neuro-graph-actions">
            {onSelectNote ? (
              <button
                className="neuro-btn-primary"
                onClick={() => onSelectNote(selectedNote.id)}
              >
                <BookOpen size={14} />
                <span>Open in Research Library</span>
                <ArrowRight size={14} />
              </button>
            ) : (
              <Link to={noteUrl(selectedNote.id)} className="neuro-btn-primary">
                <BookOpen size={14} />
                <span>Open in Research Library</span>
                <ArrowRight size={14} />
              </Link>
            )}
          </div>
        </aside>
      )}
    </div>
  );
};
