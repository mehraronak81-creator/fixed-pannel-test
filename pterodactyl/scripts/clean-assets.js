const fs = require('node:fs');
const path = require('node:path');

const assetsDirectory = path.join(__dirname, '..', 'public', 'assets');

function removeGeneratedAssets(directory) {
    if (!fs.existsSync(directory)) return;

    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
        const target = path.join(directory, entry.name);
        if (entry.isDirectory()) {
            removeGeneratedAssets(target);
        } else if (/\.(?:js|map)$/i.test(entry.name)) {
            fs.rmSync(target);
        }
    }
}

removeGeneratedAssets(assetsDirectory);