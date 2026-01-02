/**
 * Mermaid Diagram Renderer
 * Initializes and renders Mermaid diagrams in markdown
 */

declare const mermaid: any;

export class MermaidRenderer {
    private static counter: number = 0;

    /**
     * Initialize Mermaid with configuration
     */
    static initialize(): void {
        if (typeof mermaid === 'undefined') {
            console.warn('[MermaidRenderer] mermaid not available');
            return;
        }

        mermaid.initialize({
            startOnLoad: false,
            theme: 'default',
            securityLevel: 'loose',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, sans-serif'
        });

        console.log('[MermaidRenderer] Initialized');
    }

    /**
     * Get next unique ID for mermaid diagram
     */
    static getNextId(): string {
        return `mermaid-${this.counter++}`;
    }

    /**
     * Render all unrendered mermaid diagrams in the DOM
     */
    static async renderDiagrams(): Promise<void> {
        if (typeof mermaid === 'undefined') return;

        const mermaidElements = document.querySelectorAll('.mermaid:not(.mermaid-rendered)');

        for (const element of Array.from(mermaidElements)) {
            try {
                const id = element.id || this.getNextId();
                const graphDefinition = element.textContent || '';
                const { svg } = await mermaid.render(id + '-svg', graphDefinition);
                element.innerHTML = svg;
                element.classList.add('mermaid-rendered');
            } catch (e) {
                console.error('Mermaid rendering error:', e);
                element.innerHTML = `<div class="mermaid-error">Failed to render diagram: ${(e as Error).message}</div>`;
                element.classList.add('mermaid-rendered');
            }
        }
    }
}
