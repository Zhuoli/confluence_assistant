/**
 * DOM utility functions
 */

/**
 * Escape HTML special characters to prevent XSS
 */
export function escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Remove an element from the DOM if it exists
 */
export function removeElement(id: string): void {
    const element = document.getElementById(id);
    if (element) {
        element.remove();
    }
}

/**
 * Clear all children from an element
 */
export function clearElement(element: HTMLElement): void {
    element.innerHTML = '';
}

/**
 * Create an element with class and optional attributes
 */
export function createElement<K extends keyof HTMLElementTagNameMap>(
    tag: K,
    className?: string,
    attributes?: Record<string, string>
): HTMLElementTagNameMap[K] {
    const element = document.createElement(tag);
    if (className) {
        element.className = className;
    }
    if (attributes) {
        Object.entries(attributes).forEach(([key, value]) => {
            element.setAttribute(key, value);
        });
    }
    return element;
}
