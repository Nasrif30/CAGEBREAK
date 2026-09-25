/**
 * StudyRepository
 * 
 * Provides an abstracted data access layer for research studies.
 * Currently backed by local demo data, prepared for future Supabase client integration.
 */

import { Study, StudyStatus } from '../types';
import { DEMO_STUDIES } from '../demo/studies';

export interface StudyFilterOptions {
  searchQuery?: string;
  status?: StudyStatus | 'all';
  model?: string;
  tag?: string;
  sortBy?: 'date_desc' | 'date_asc' | 'title_asc';
}

export class StudyRepository {
  private studies: Study[] = [...DEMO_STUDIES];

  /**
   * Fetch all studies matching optional filter criteria
   */
  async getStudies(options: StudyFilterOptions = {}): Promise<Study[]> {
    // Simulate slight async network boundary for realistic UI feel
    return new Promise((resolve) => {
      let filtered = [...this.studies];

      if (options.searchQuery && options.searchQuery.trim() !== '') {
        const query = options.searchQuery.toLowerCase().trim();
        filtered = filtered.filter(
          (s) =>
            s.title.toLowerCase().includes(query) ||
            s.summary.toLowerCase().includes(query) ||
            s.tags.some((t) => t.toLowerCase().includes(query)) ||
            s.models.some((m) => m.toLowerCase().includes(query))
        );
      }

      if (options.status && options.status !== 'all') {
        filtered = filtered.filter((s) => s.status === options.status);
      }

      if (options.model && options.model !== 'all') {
        filtered = filtered.filter((s) => s.models.includes(options.model!));
      }

      if (options.tag && options.tag !== 'all') {
        filtered = filtered.filter((s) => s.tags.includes(options.tag!));
      }

      if (options.sortBy) {
        if (options.sortBy === 'date_desc') {
          filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        } else if (options.sortBy === 'date_asc') {
          filtered.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        } else if (options.sortBy === 'title_asc') {
          filtered.sort((a, b) => a.title.localeCompare(b.title));
        }
      }

      resolve(filtered);
    });
  }

  /**
   * Find a study by its slug
   */
  async getStudyBySlug(slug: string): Promise<Study | null> {
    const study = this.studies.find((s) => s.slug === slug);
    return study || null;
  }

  /**
   * Find a study by its ID
   */
  async getStudyById(id: string): Promise<Study | null> {
    const study = this.studies.find((s) => s.id === id);
    return study || null;
  }

  /**
   * Get unique tags across all studies
   */
  async getAllTags(): Promise<string[]> {
    const tagSet = new Set<string>();
    this.studies.forEach((s) => s.tags.forEach((t) => tagSet.add(t)));
    return Array.from(tagSet).sort();
  }

  /**
   * Get unique models across all studies
   */
  async getAllModels(): Promise<string[]> {
    const modelSet = new Set<string>();
    this.studies.forEach((s) => s.models.forEach((m) => modelSet.add(m)));
    return Array.from(modelSet).sort();
  }
}

export const studyRepository = new StudyRepository();
