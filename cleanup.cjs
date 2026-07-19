const fs = require('fs');
let content = fs.readFileSync('README.md', 'utf-8');

// Strip out <details>, <summary>, <br>, ```html ... ```, </summary>, </details>
// and just keep the <b>Name</b><br><img ...>
let newContent = content.replace(/<td align="center">\s*<details>[\s\S]*?<b>(.*?)<\/b>(?:.*?)<br>\s*<img src="(.*?)" width="260">\s*<\/summary>[\s\S]*?<\/details>\s*<\/td>/g, (match, name, imgUrl) => {
  return `<td align="center">
      <b>${name}</b><br>
      <img src="${imgUrl}" width="260">
    </td>`;
});

// Let's add the instruction text back if it's missing
if (!newContent.includes('PosSol comes with 36 beautifully crafted aesthetic themes')) {
  newContent = newContent.replace('## 🎨 Available Themes\n', '## 🎨 Available Themes\n\nPosSol comes with 36 beautifully crafted aesthetic themes. To use a theme, just copy the name of the theme below and replace `theme=dark` with it in your URL!\n');
}

fs.writeFileSync('README.md', newContent);
