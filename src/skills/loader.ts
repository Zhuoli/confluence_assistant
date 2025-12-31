import { readdirSync, readFileSync, statSync } from 'fs';
import { join } from 'path';
import matter from 'gray-matter';
import type { Skill, SkillMetadata } from './types.js';

/**
 * Skills Loader - Custom implementation for loading SKILL.md files
 * Replaces claude-agent-sdk's built-in skills loader
 */
export class SkillsLoader {
  private skills: Map<string, Skill> = new Map();
  private loaded: boolean = false;

  constructor(private skillsDir: string) {}

  /**
   * Load all skills from the skills directory
   */
  async load(): Promise<void> {
    if (this.loaded) {
      return; // Already loaded
    }

    try {
      const entries = readdirSync(this.skillsDir);

      for (const entry of entries) {
        const entryPath = join(this.skillsDir, entry);

        // Skip files in root directory (like 00-REPO-SKILLS-GUIDE.md)
        const stat = statSync(entryPath);
        if (!stat.isDirectory()) {
          continue;
        }

        // Look for SKILL.md in this directory
        const skillPath = join(entryPath, 'SKILL.md');

        try {
          const skillContent = readFileSync(skillPath, 'utf-8');
          const skill = this.parseSkill(entry, skillPath, skillContent);
          this.skills.set(entry, skill);
        } catch (error) {
          console.warn(`Warning: Failed to load skill from ${entry}:`, error);
        }
      }

      this.loaded = true;
      console.error(`✓ Loaded ${this.skills.size} skills from ${this.skillsDir}`);
    } catch (error) {
      console.error('Error loading skills:', error);
      throw new Error(`Failed to load skills: ${error}`);
    }
  }

  /**
   * Parse a SKILL.md file (with optional YAML front matter)
   */
  private parseSkill(dirName: string, filePath: string, fileContent: string): Skill {
    try {
      // Try to parse YAML front matter
      const { data, content } = matter(fileContent);

      // Use metadata name if available, otherwise use directory name
      const skillName = data.name || dirName;

      return {
        name: skillName,
        content: content.trim(),
        metadata: Object.keys(data).length > 0 ? (data as SkillMetadata) : undefined,
        filePath,
      };
    } catch (error) {
      // If parsing fails, treat entire file as content
      console.warn(`Warning: Failed to parse front matter for ${dirName}, using raw content`);

      return {
        name: dirName,
        content: fileContent.trim(),
        metadata: undefined,
        filePath,
      };
    }
  }

  /**
   * Get a specific skill by name
   */
  getSkill(name: string): Skill | undefined {
    return this.skills.get(name);
  }

  /**
   * Get all loaded skills
   */
  getAllSkills(): Skill[] {
    return Array.from(this.skills.values());
  }

  /**
   * Get skills as formatted context for system prompt
   */
  getSkillsContext(): string {
    const skills = this.getAllSkills();

    if (skills.length === 0) {
      return '';
    }

    const context = skills
      .map((skill) => {
        let header = `\n## Skill: ${skill.name}\n`;

        if (skill.metadata?.description) {
          header += `**Description**: ${skill.metadata.description}\n\n`;
        }

        return header + skill.content;
      })
      .join('\n\n---\n');

    return `\n# Available Skills\n\n${context}\n`;
  }

  /**
   * Get count of loaded skills
   */
  getCount(): number {
    return this.skills.size;
  }

  /**
   * Check if skills are loaded
   */
  isLoaded(): boolean {
    return this.loaded;
  }

  /**
   * Get skill names
   */
  getSkillNames(): string[] {
    return Array.from(this.skills.keys());
  }
}
