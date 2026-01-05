/**
 * Utility function to truncate text to a specific word count
 */
const truncateTextByWords = (text: string, maxWords: number): string => {
    if (!text || typeof text !== 'string') return 'No description provided.';
    const words = text.trim().split(/\s+/).filter(word => word.length > 0);
    if (words.length <= maxWords) return text.trim();
    return words.slice(0, maxWords).join(' ') + '...';
};

export { truncateTextByWords }