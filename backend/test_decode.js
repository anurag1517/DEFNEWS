const googleNewsUrl = 'https://news.google.com/rss/articles/CBMiW2h0dHBzOi8vd3d3Lm5kdHYuY29tL2luZGlhLW5ld3MvaW5kaWFzLWZpcnN0LWluZGVwZW5kZW5jZS1kYXktZmxhZy1ob2lzdGluZy13YXMtbm90LWF0LXJlZC1mb3J0LTU5NjAwMTDSAQA?oc=5';

function decodeGoogleNewsUrl(url) {
    try {
        const parts = url.split('/articles/');
        if (parts.length < 2) return url;
        const code = parts[1].split('?')[0];
        
        // Find base64 matching block
        // Google News urls usually start with CBMi...
        // Let's try base64 decoding the code directly
        let base64Str = code;
        if (code.startsWith('CBMi')) {
            // Cut the prefix CBMiW (or similar) or decode substrings
            // Let's decode different parts
            console.log('Original code:', code);
            
            // Try buffer base64 decode
            const decoded = Buffer.from(code, 'base64').toString('utf-8');
            console.log('Raw decoded string:', decoded);
            
            // Let's extract any http url matching
            const match = decoded.match(/https?:\/\/[^\s"']+/);
            if (match) {
                return match[0];
            }
        }
        return url;
    } catch (e) {
        console.error(e);
        return url;
    }
}

console.log('Decoded Link:', decodeGoogleNewsUrl(googleNewsUrl));
