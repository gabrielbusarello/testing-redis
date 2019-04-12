const fs = require('fs');
const express = require('express');
const bodyParser = require('body-parser');
const Redis = require('ioredis');
const redisSub = new Redis(6379, 'redis');
const redisPub = new Redis(6379, 'redis');
const mysql = require('mysql');
const connection = mysql.createConnection({
    host: 'db',
    user: 'root',
    password: 'redis',
    database: 'redis_reg'
});

/* Respostas HTTP */
const resposta201 = {
    'status': true,
    'message': 'Notificação despachada com sucesso!'
};

const resposta500 = {
    'status': false,
    'message': 'Pode ter ocorrido um problema do serviço Redis ou do Banco de dados, tente novamente'
};
/* Respostas HTTP */

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
    let redisResponse;
    redisPub.publish(body.canal, body.mensagem).then((response) => {
        redisResponse = response;
        connection.query(`
            INSERT registers (channel, message, pub_redis) VALUES ("${body.canal}", "${body.mensagem}", ${redisResponse})
        `, (err, result, fields) => {
            console.log(redisResponse);
            console.log(err);
            console.log(result);
            console.log(fields);
    
            if (err || redisResponse === 0) {
                res.status(500);
                res.json(resposta500);
            } else {
                res.status(201)
                res.json(resposta201);
            }
        });
    });
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