const fs = require('fs');
const express = require('express');
const bodyParser = require('body-parser');
const Redis = require('ioredis');
const redisSub = new Redis(6379, 'redis');
const redisPub = new Redis(6379, 'redis');
const notification = require('./connection').Notification;
const prettier = require('./prettier');

/* Respostas HTTP */
const resposta201 = {
    'status': true,
    'message': 'Notificação despachada com sucesso!'
};

const resposta500 = {
    'status': false,
    'message': 'Pode ter ocorrido um problema do serviço Redis ou do Banco de dados, tente novamente'
};

const resposta401 = {
    'status': false,
    'message': 'O header Authorization não foi informado ou está inválido'
}
/* Respostas HTTP */

const app = express();

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
 
// parse application/json
app.use(bodyParser.json());

app.get('/', (req, res) => {
    getReg().then((result) => {
        res.status(200);
        if (req.query.prettier) {
            res.end(prettier.getUltimosReg(result));
        } else {
            res.json(result);
        }
    });
});

app.get('/working', (req, res) => {
    fs.readFile(__dirname + '/index.html', (err, data) => {
        if (err) {
            res.writeHead(500);
            return res.end('Error loading index.html');
        }

        res.writeHead(200);
        res.end(data);
    });
});

app.post('/publish', (req, res) => {
    const body = req.body;
    if (req.headers.authorization && req.headers.authorization === 'UmVkaXNVbml2aWxsZU5vdGlmaWNhY29lc0FwaQ==') {
        let redisResponse;
        redisPub.publish(body.canal, JSON.stringify(body.mensagem)).then((response) => {
            redisResponse = response;
            body.mensagem = JSON.stringify(body.mensagem);
            notification.create({ channel: body.canal, message: body.mensagem, pub_redis: redisResponse }).then((notification) => {
                res.status(201);
                res.json(resposta201);
            }).catch((err) => {
                res.status(500);
                res.json(resposta500);
            })
        });
    } else {
        res.status(401);
        res.json(resposta401);
    }
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

function getReg() {
    return new Promise((resolve, reject) => {
        notification.findAll({
            order: [
                ['id', 'DESC']
            ]
        }).then(notifications => {
            resolve(notifications);
        }).catch(err => {
            throw Error(err);
        });
    });
}