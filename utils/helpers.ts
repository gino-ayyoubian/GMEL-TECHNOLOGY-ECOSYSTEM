
/**
 * robustly extracts a JSON object or array from a string that might contain 
 * markdown code blocks, explanatory text, or other noise.
 */
export const extractJson = (text: string): any | null => {
    if (!text) return null;

    // 1. Try finding a JSON markdown block first
    const markdownMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (markdownMatch && markdownMatch[1]) {
        try {
            const trimmed = markdownMatch[1].trim();
            return JSON.parse(trimmed);
        } catch (error) {
            // If the code block exists but is malformed, we'll try the brute force fallback
        }
    }

    // 2. Brute force search for valid JSON structures
    // We attempt to parse substrings between all possible openers and closers
    const findValidBlock = (opener: string, closer: string) => {
        let startIdx = 0;
        while ((startIdx = text.indexOf(opener, startIdx)) !== -1) {
            let endIdx = text.lastIndexOf(closer);
            while (endIdx !== -1 && endIdx > startIdx) {
                const potential = text.substring(startIdx, endIdx + 1);
                try {
                    const parsed = JSON.parse(potential);
                    // Check if it's a simple placeholder string like "[Project Name]"
                    // Valid JSON objects/arrays usually have content.
                    if (typeof parsed === 'object' && parsed !== null) {
                        return parsed;
                    }
                } catch (e) {
                    // Try the next closer moving inwards
                }
                endIdx = text.lastIndexOf(closer, endIdx - 1);
            }
            startIdx++;
        }
        return null;
    };

    // Check for object first, then array
    const obj = findValidBlock('{', '}');
    if (obj) return obj;

    const arr = findValidBlock('[', ']');
    if (arr) return arr;

    return null;
};
