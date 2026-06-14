const fs = require('fs');

const code = fs.readFileSync('app/page.tsx', 'utf-8');

// Function to find the exact boundaries of `{activeTab === 'xxx' && ( ... )}`
function getBlockBounds(tabName) {
    const startStr = `{activeTab === '${tabName}' && (`;
    const startIdx = code.indexOf(startStr);
    if (startIdx === -1) return null;

    let braceCount = 0;
    let inString = false;
    let stringChar = '';
    
    // Start after the first `{`
    for (let i = startIdx; i < code.length; i++) {
        const char = code[i];
        
        if (inString) {
            if (char === stringChar && code[i-1] !== '\\') {
                inString = false;
            }
        } else {
            if (char === '"' || char === "'" || char === '`') {
                inString = true;
                stringChar = char;
            } else if (char === '{') {
                braceCount++;
            } else if (char === '}') {
                braceCount--;
                if (braceCount === 0) {
                    return { start: startIdx, end: i + 1 };
                }
            }
        }
    }
    return null;
}

const blocks = {
    home: getBlockBounds('home'),
    gundem: getBlockBounds('gundem'),
    vaatler: getBlockBounds('vaatler'),
    saha: getBlockBounds('saha'),
    gonullu: getBlockBounds('gonullu'),
    meclis: getBlockBounds('meclis'),
    karne: getBlockBounds('karne'),
    anket: getBlockBounds('anket'),
    iletisim: getBlockBounds('iletisim'),
};

let newCode = code;

function extractContent(bounds) {
    if (!bounds) return "";
    let content = code.substring(bounds.start, bounds.end);
    // Strip the wrapper: `{activeTab === 'xxx' && (` ... `)}`
    content = content.replace(/\{activeTab === '[^']+' && \([\s\S]*?<div[^>]*>/, ''); // Remove start and first div
    // We actually just want the inner children of that first div.
    // A simpler way: we just inject the raw content since we are writing a script, let's just do regex replacements on the new file.
    return content;
}

// Actually it's much easier to just do text replacement on the entire file.
// We'll read the sections, extract their JSX content manually and build the new file.
