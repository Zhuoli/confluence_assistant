/**
 * Progress Panel
 * Displays structured progress logs during AI operations
 */

import { escapeHtml } from '../utils/dom';

export interface ProgressLogData {
    level: 'SUCCESS' | 'ERROR' | 'WARNING' | 'PROGRESS' | 'INFO';
    category: string;
    message: string;
}

export interface ProgressData {
    type: 'structured_log' | 'raw_log';
    data?: ProgressLogData;
    message?: string;
}

export class ProgressPanel {
    private static readonly PANEL_ID = 'progressPanel';
    private static readonly MAX_LOGS = 10;

    /**
     * Update progress panel with new log entry
     */
    static update(progressData: ProgressData, container: HTMLElement): void {
        let panel = document.getElementById(this.PANEL_ID);

        // Create panel if it doesn't exist
        if (!panel) {
            panel = document.createElement('div');
            panel.id = this.PANEL_ID;
            panel.className = 'progress-panel';
            container.appendChild(panel);
        }

        // Handle structured log messages
        if (progressData.type === 'structured_log' && progressData.data) {
            const logData = progressData.data;
            const logLine = document.createElement('div');
            logLine.className = `progress-log progress-log-${logData.level.toLowerCase()}`;

            const emoji = this.getLogEmoji(logData.category, logData.level);
            const categoryBadge = `<span class="log-category">[${logData.category}]</span>`;

            logLine.innerHTML = `${emoji} ${categoryBadge} ${escapeHtml(logData.message)}`;
            panel.appendChild(logLine);

            // Keep only last N log lines
            const logs = panel.querySelectorAll('.progress-log');
            if (logs.length > this.MAX_LOGS) {
                logs[0].remove();
            }
        }

        // Scroll to show latest progress
        container.scrollTop = container.scrollHeight;
    }

    /**
     * Remove progress panel from DOM
     */
    static remove(): void {
        const panel = document.getElementById(this.PANEL_ID);
        if (panel) {
            panel.remove();
        }
    }

    /**
     * Get emoji icon for log entry
     */
    private static getLogEmoji(category: string, level: string): string {
        if (level === 'SUCCESS') return '✓';
        if (level === 'ERROR') return '✗';
        if (level === 'WARNING') return '⚠';
        if (level === 'PROGRESS') return '⏳';

        // Category-specific emojis for INFO level
        switch (category) {
            case 'INIT': return '🚀';
            case 'SKILLS': return '📚';
            case 'MCP': return '🔌';
            case 'TOOLS': return '🛠';
            case 'CHAT': return '💬';
            default: return '•';
        }
    }
}
