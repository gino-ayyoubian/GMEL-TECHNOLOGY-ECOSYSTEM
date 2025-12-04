
/**
 * robustly extracts a JSON object or array from a string that might contain 
 * markdown code blocks, explanatory text, or other noise.
 */
export const extractJson = (text: string): any | null => {
    if (!text) return null;

    // First, try to find a JSON markdown block
    const match = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (match && match[1]) {
        try {
            return JSON.parse(match[1]);
        } catch (error) {
            console.warn("Failed to parse JSON from markdown block, falling back to substring search:", error);
        }
    }

    // Fallback: Try to find the widest range of '{...}' or '[...]'
    const firstBrace = text.indexOf('{');
    const firstBracket = text.indexOf('[');
    
    if (firstBrace === -1 && firstBracket === -1) return null;

    let start = -1;
    let end = -1;

    // Determine if we're looking for an object or an array based on which comes first
    if (firstBrace === -1 || (firstBracket !== -1 && firstBracket < firstBrace)) {
        start = firstBracket;
        end = text.lastIndexOf(']');
    } else {
        start = firstBrace;
        end = text.lastIndexOf('}');
    }

    if (start === -1 || end === -1 || end < start) return null;

    const jsonString = text.substring(start, end + 1);
    try {
        return JSON.parse(jsonString);
    } catch (error) {
        console.error("Failed to parse extracted JSON substring:", error);
        return null;
    }
};
