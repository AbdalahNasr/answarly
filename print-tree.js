const fs = require('fs');
const path = require('path');

function printTree(dir, prefix = '', excludeDirs = ['node_modules', '.git', '.next']) {
    try {
        const items = fs.readdirSync(dir).sort();
        
        items.forEach((item, index) => {
            const itemPath = path.join(dir, item);
            const isLast = index === items.length - 1;
            const currentPrefix = isLast ? '└── ' : '├── ';
            const nextPrefix = isLast ? '    ' : '│   ';
            
            // Skip excluded directories
            if (excludeDirs.includes(item)) {
                return;
            }
            
            console.log(prefix + currentPrefix + item);
            
            try {
                const stats = fs.statSync(itemPath);
                if (stats.isDirectory()) {
                    printTree(itemPath, prefix + nextPrefix, excludeDirs);
                }
            } catch (err) {
                // Skip files/directories that can't be accessed
            }
        });
    } catch (err) {
        console.error(`Error reading directory ${dir}:`, err.message);
    }
}

console.log('Project Tree (excluding node_modules, .git, .next):');
console.log('.');
printTree(process.cwd());