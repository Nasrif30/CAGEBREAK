/**
 * ExperimentRepository
 * 
 * Abstracted data access layer for behavioral experiments.
 * Backed by demo data, architected for seamless Supabase migration.
 */

import { Experiment, RiskLevel } from '../types';
import { DEMO_EXPERIMENTS } from '../demo/experiments';

export interface ExperimentFilterOptions {
  searchQuery?: string;
  studyId?: string;
  model?: string;
  riskLevel?: RiskLevel | 'all';
}

export class ExperimentRepository {
  private experiments: Experiment[] = [...DEMO_EXPERIMENTS];

  async getExperiments(options: ExperimentFilterOptions = {}): Promise<Experiment[]> {
    return new Promise((resolve) => {
      let filtered = [...this.experiments];

      if (options.searchQuery && options.searchQuery.trim() !== '') {
        const q = options.searchQuery.toLowerCase().trim();
        filtered = filtered.filter(
          (e) =>
            e.experimentId.toLowerCase().includes(q) ||
            e.baselinePersona.toLowerCase().includes(q) ||
            e.modifiedPersona.toLowerCase().includes(q) ||
            e.testPrompt.toLowerCase().includes(q) ||
            e.observations.toLowerCase().includes(q)
        );
      }

      if (options.studyId) {
        filtered = filtered.filter((e) => e.studyId === options.studyId);
      }

      if (options.model && options.model !== 'all') {
        filtered = filtered.filter((e) => e.model === options.model);
      }

      if (options.riskLevel && options.riskLevel !== 'all') {
        filtered = filtered.filter((e) => e.riskLevel === options.riskLevel);
      }

      resolve(filtered);
    });
  }

  async getExperimentById(id: string): Promise<Experiment | null> {
    const exp = this.experiments.find((e) => e.id === id || e.experimentId === id);
    return exp || null;
  }
}

export const experimentRepository = new ExperimentRepository();
