/**
 * Formatting utility functions
 */

/**
 * Format timestamp as relative time (e.g., "5m ago", "Just now")
 */
export function formatRelativeTime(timestamp: number): string {
    const now = Date.now();
    const diff = now - timestamp;

    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (seconds < 60) {
        return 'Just now';
    } else if (minutes < 60) {
        return `${minutes}m ago`;
    } else if (hours < 24) {
        const date = new Date(timestamp);
        return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    } else if (days < 7) {
        const date = new Date(timestamp);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } else {
        const date = new Date(timestamp);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
}

/**
 * Generate a safe filename from text content
 */
export function generateFilename(text: string): string {
    // Remove markdown formatting for title extraction
    const plainText = text
        .replace(/[#*`_~\[\]()]/g, '') // Remove markdown symbols
        .replace(/\n+/g, ' ')          // Replace newlines with spaces
        .trim();

    // Get first 50 characters or first line, whichever is shorter
    let title = plainText.substring(0, 50);
    const firstLineEnd = title.indexOf('.');
    if (firstLineEnd > 10) {
        title = title.substring(0, firstLineEnd);
    }

    // Clean up for filename
    const filename = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')   // Replace non-alphanumeric with dash
        .replace(/^-+|-+$/g, '')        // Remove leading/trailing dashes
        .substring(0, 50);              // Limit length

    // Add timestamp if filename is too short or generic
    if (filename.length < 10 || filename === 'technical-design' || filename === 'design-document') {
        const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
        return `${filename}-${timestamp}.md`;
    }

    return `${filename}.md`;
}

/**
 * Format current time for display
 */
export function formatCurrentTime(): string {
    return new Date().toLocaleTimeString();
}
