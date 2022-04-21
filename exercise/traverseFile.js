const { join, resolve } = require('path')
const { readFileSync, readdirSync, statSync } = require('fs')

const entry = resolve('./src');
const exts = [];
let fileCount = 0;

function fileHandler(path) {
    console.log(path); fileCount++;
    const result = /\.[a-z\d]+$/.exec(path)
    if (result) {
        const ext = result[0]
        if (exts.indexOf(ext) === -1) {
            exts.push(ext)
        }
    }
}

function dirHandler(path) {
    const files = readdirSync(path);

    files.forEach(file => {
        const fullPath = join(path, file);

        const stat = statSync(fullPath)

        if (stat.isDirectory()) {
            dirHandler(fullPath)
        } else {
            fileHandler(fullPath)
        }
    })
}

const source = resolve('./src')

console.log('source dir: ', source)

dirHandler(source)

console.log('scane files count: ', fileCount, '\nand exts is : ', exts)
console.log('traverse end')
