const fs = require('fs');
const http = require('http').createServer(handler);
const io = require('socket.io')(http);
const Redis = require('ioredis');
const redis = new Redis(6379, 'redis');

redis.psubscribe('*', () => {
    redis.on('pmessage', (pattern, channel, message) => {
        io.emit(channel, message);
    });
});
redis.on("error", function(err){
    console.log(err);
});

http.listen(3000, () => {
    console.log('Listening on Port 3000');
});

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
