/**
 * Types for Skills system
 */

export interface SkillMetadata {
  name?: string;
  description?: string;
  [key: string]: any;
}

export interface Skill {
  /** Skill name (from directory or metadata) */
  name: string;
  /** Skill content (markdown) */
  content: string;
  /** YAML front matter metadata (if present) */
  metadata?: SkillMetadata;
  /** File path */
  filePath: string;
}

export interface SkillsRegistry {
  skills: Map<string, Skill>;
  count: number;
}
