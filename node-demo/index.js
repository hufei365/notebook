const fs = require('fs');
const http = require('http');

const cycle = () => {
    for (let i = 0; i < 3; i++) {
        console.log(i);
    }
}

const readFile = (file) => {
    fs.readFile(file, 'utf-8', (err, data) => {
        if (!err) {
            console.log(data);
        }
    });
}

const readFileSync = (file) => {
    console.log('read file sync \n',
        fs.readFileSync(file, (err, data) => {
            if (!err) console.log(data);
        })
    );
}

const server = http.createServer(function(req, res){
    res.write('hello');
    res.end();
})

server.listen(8001, function(){
    console.log('server start');
})

console.log('start......');

cycle();
readFile('index.js');
readFileSync('index.js');

console.log('end!!');