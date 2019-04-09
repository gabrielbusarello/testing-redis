const http = require('http');

http.createServer(function (req, res) {
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.end(`<h1>Teste</h1>`);
}).listen(3000, '127.0.0.1');