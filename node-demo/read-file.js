const fs = require('fs');

const readFile = (file) => {
    fs.readFile(file, 'utf-8', (err, data) => {
        if(!err) console.log(data);
    });
}

console.log('program start ......');
readFile('test.json');
console.log('readFile has put the I/O ');
console.log('program end!!!!!');