const fs = require('fs');
const http = require('http').createServer(handler);
const express = require('express');
const bodyParser = require('body-parser');
const Redis = require('ioredis');
const redis = new Redis(6379, 'redis');
const redis2 = new Redis(6379, 'redis');

redis.psubscribe('*', () => {
    redis.on('pmessage', (pattern, channel, message) => {
        io.emit(channel, message);
    });
});
redis.on("error", function(err){
    console.log(err);
});

const app = express();

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
 
// parse application/json
app.use(bodyParser.json());

const server = app.listen(3000);
const io = require('socket.io')(server);

app.get('/', (req, res) => {
    fs.readFile(__dirname + '/index.html', (err, data) => {
        if (err) {
            res.writeHead(500);
            return res.end('Error loading index.html');
        }

        res.writeHead(200);
        res.end(data);
    });
    io.on('products', (data) => {
        console.log(data);
        const el = document.querySelector('#message');
        el.innerHTML = "<h1>" + data + "</h1>";
    });
    // res.send('teste');
})

app.post('/publish', (req, res) => {
    const body = req.body;
    redis2.publish('products', body.mensagem).then((resposta) => {
        console.log(resposta);
    });
    res.status(200);
    res.json(body);
});


// http.listen(3000, () => {
//     console.log('Listening on Port 3000');
// });

function handler (req, res) {
    fs.readFile(__dirname + '/index.html', (err, data) => {
        if (err) {
            res.writeHead(500);
            return res.end('Error loading index.html');
        }

        res.writeHead(200);
        res.end(data);
    });
}
