const fs = require('bluebird').promisifyAll(require('fs'));
exports.read = (name, def) => fs.readFileAsync(name, 'utf-8').then(JSON.parse).catch(() => def);
exports.write = (name, data) => fs.writeFileAsync(name, JSON.stringify(data));
