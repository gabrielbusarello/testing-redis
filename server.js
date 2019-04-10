const fs = require('fs');
const express = require('express');
const bodyParser = require('body-parser');
const Redis = require('ioredis');
const redisSub = new Redis(6379, 'redis');
const redisPub = new Redis(6379, 'redis');

const app = express();

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
 
// parse application/json
app.use(bodyParser.json());

app.get('/', (req, res) => {
    fs.readFile(__dirname + '/index.html', (err, data) => {
        if (err) {
            res.writeHead(500);
            return res.end('Error loading index.html');
        }

        res.writeHead(200);
        res.end(data);
    });
})

app.post('/publish', (req, res) => {
    const body = req.body;
    redisPub.publish(body.token, body.mensagem).then((response) => {
        console.log(response);
    });
    res.status(200);
    res.json(body);
});

const server = app.listen(3000);
const io = require('socket.io')(server);

redisSub.psubscribe('*', () => {
    redisSub.on('pmessage', (pattern, channel, message) => {
        io.emit(channel, message);
    });
});
redisSub.on("error", function(err){
    console.log(err);
});