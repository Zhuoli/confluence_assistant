/**
 * Code Block Handler
 * Handles syntax highlighting and copy-to-clipboard functionality
 */

import { escapeHtml } from '../utils/dom';

declare const hljs: any;
declare const marked: any;

export class CodeBlockHandler {
    /**
     * Copy code to clipboard
     */
    static async copyToClipboard(button: HTMLButtonElement, code: string): Promise<void> {
        try {
            await navigator.clipboard.writeText(code);

            // Visual feedback
            const copyText = button.querySelector('.copy-text');
            const copyIcon = button.querySelector('.copy-icon');
            const originalText = copyText?.textContent || '';
            const originalIcon = copyIcon?.textContent || '';

            if (copyText) copyText.textContent = 'Copied!';
            if (copyIcon) copyIcon.textContent = '✓';
            button.classList.add('copied');

            // Reset after 2 seconds
            setTimeout(() => {
                if (copyText) copyText.textContent = originalText;
                if (copyIcon) copyIcon.textContent = originalIcon;
                button.classList.remove('copied');
            }, 2000);
        } catch (err) {
            console.error('Failed to copy code:', err);
            alert('Failed to copy code to clipboard');
        }
    }

    /**
     * Render a code block with syntax highlighting
     */
    static renderCodeBlock(code: string, language: string): string {
        const validLanguage = language && hljs.getLanguage(language) ? language : null;
        let highlighted: string;

        if (validLanguage) {
            try {
                highlighted = hljs.highlight(code, { language: validLanguage }).value;
            } catch (e) {
                console.error('Highlight error:', e);
                highlighted = escapeHtml(code);
            }
        } else {
            // Auto-detect or plain text
            try {
                highlighted = hljs.highlightAuto(code).value;
            } catch (e) {
                highlighted = escapeHtml(code);
            }
        }

        const langLabel = validLanguage || 'code';
        const langClass = validLanguage ? ` class="language-${validLanguage}"` : '';
        const escapedCode = escapeHtml(code);

        // Return code block with copy button
        return `<div class="code-block-wrapper">
            <div class="code-block-header">
                <span class="code-block-language">${langLabel}</span>
                <button class="code-copy-button" onclick="window.copyCodeToClipboard(this)" data-code="${escapedCode.replace(/"/g, '&quot;')}">
                    <span class="copy-icon">📋</span>
                    <span class="copy-text">Copy</span>
                </button>
            </div>
            <pre><code${langClass}>${highlighted}</code></pre>
        </div>`;
    }

    /**
     * Configure Marked.js to use custom code renderer
     */
    static configureMarked(): void {
        if (typeof marked === 'undefined' || typeof hljs === 'undefined') {
            console.warn('[CodeBlockHandler] marked or hljs not available');
            return;
        }

        console.log('[CodeBlockHandler] Configuring marked.js with custom code renderer');

        marked.use({
            breaks: true,
            gfm: true,
            renderer: {
                code(code: string, infostring: string | undefined) {
                    const language = infostring || '';
                    return CodeBlockHandler.renderCodeBlock(code, language);
                }
            }
        });
    }
}

// Expose to window for HTML onclick handlers
declare global {
    interface Window {
        copyCodeToClipboard: (button: HTMLButtonElement) => void;
    }
}

window.copyCodeToClipboard = (button: HTMLButtonElement) => {
    const codeText = button.getAttribute('data-code');
    if (codeText) {
        CodeBlockHandler.copyToClipboard(button, codeText);
    }
};
