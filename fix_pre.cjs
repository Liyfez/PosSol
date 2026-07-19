const fs = require('fs');
let content = fs.readFileSync('README.md', 'utf-8');

// Unescape HTML entities
function unescapeHtml(text) {
  return text
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');
}

// Replace all <pre align="left"><code>...</code></pre> with fenced code blocks
content = content.replace(/<pre align="left"><code>([\s\S]*?)<\/code><\/pre>/g, (match, innerCode) => {
  const unescaped = unescapeHtml(innerCode);
  return `\n\`\`\`html\n${unescaped}\n\`\`\`\n`;
});

fs.writeFileSync('README.md', content);
