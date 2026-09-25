/**
 * CAGEBREAK Research Domain Types & Interfaces
 * 
 * Defines the core schemas for AI behavioral research, studies,
 * persona modifications, experiments, notes, and citations.
 */

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

export type StudyStatus = 'draft' | 'in_progress' | 'completed' | 'peer_reviewed' | 'archived';

export type MetricClassification = 'MEASURED' | 'RESEARCHER OBSERVATION' | 'EXPERIMENTAL METRIC';

export type SourceType =
  | 'Academic Paper'
  | 'Documentation'
  | 'Article'
  | 'Dataset'
  | 'Repository'
  | 'Experiment Log'
  | 'Other';

export type TimelineEventType =
  | 'Study Created'
  | 'Experiment Conducted'
  | 'Finding Added'
  | 'Persona Tested'
  | 'Paper Reviewed'
  | 'Dataset Updated';

export interface BehaviorMetric {
  id: string;
  name: 'Politeness' | 'Aggression' | 'Refusal' | 'Consistency' | 'Toxicity' | 'Instruction Adherence' | string;
  classification: MetricClassification;
  baselineScore: number; // 0 to 100
  modifiedScore: number; // 0 to 100
  delta: number;
  unit?: string;
  notes?: string;
}

export interface Study {
  id: string;
  slug: string;
  title: string;
  summary: string;
  researchQuestion: string;
  hypothesis: string;
  methodology: string;
  models: string[];
  date: string; // ISO 8601
  updatedAt: string;
  status: StudyStatus;
  tags: string[];
  findings: string[];
  limitations: string[];
  references: string[];
  relatedExperimentIds: string[];
}

export interface Experiment {
  id: string;
  experimentId: string;
  studyId: string;
  model: string;
  modelVersion: string;
  date: string;
  baselinePersona: string;
  modifiedPersona: string;
  systemPromptDescription: string;
  testPrompt: string;
  baselineResponse: string;
  modifiedResponse: string;
  observations: string;
  metrics: BehaviorMetric[];
  riskLevel: RiskLevel;
  notes?: string;
  tags: string[];
}

export interface Persona {
  id: string;
  name: string;
  description: string;
  category: string;
  systemInstructionSummary: string;
  traits: string[];
  riskLevel: RiskLevel;
  createdAt: string;
  relatedExperiments: string[];
}

export interface BehaviorTest {
  id: string;
  name: string;
  category: string;
  description: string;
  testPrompt: string;
  evaluatorModel: string;
  passingThreshold: number;
}

export interface ResearchNote {
  id: string;
  title: string;
  content: string; // Markdown
  tags: string[];
  date: string;
  updatedDate: string;
  pinned: boolean;
  linkedStudyId?: string;
  linkedExperimentId?: string;
  references?: string[];
}

export interface Finding {
  id: string;
  title: string;
  summary: string;
  model: string;
  persona: string;
  experimentId: string;
  behaviorCategory: string;
  riskLevel: RiskLevel;
  supportingEvidence: string;
}

export interface Source {
  id: string;
  title: string;
  authors: string[];
  year: number;
  publisher: string;
  url?: string;
  doi?: string;
  sourceType: SourceType;
  notes?: string;
  tags: string[];
  linkedStudies: string[];
}

export interface TimelineEvent {
  id: string;
  title: string;
  date: string;
  eventType: TimelineEventType;
  description: string;
  linkedEntityId?: string;
  linkedEntityType?: 'study' | 'experiment' | 'persona' | 'finding' | 'source';
}
