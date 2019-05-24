function getUltimosReg(result) {
    const tabela = getRegistrosEmTabela(result);
    return `<!DOCTYPE html>
<html>
    <head>
        <title>Últimos Registros</title>
        <meta charset="utf-8" />
        <style>
            body {
                background: #fafafa;
                font-family: monospace;
            }
            h1 {
                text-align: center;
            }
            #tabela {
                display: flex;
                justify-content: center;
                align-items: center;
                background: #fff;
                padding: 20px;
                border: 3px solid #f1f1f1;
            }
            table, th, td {
                border: 1px solid black;
                border-collapse: collapse;
            }
            th {
                padding: 10px;
                background: #cdcdcd;
            }
            td {
                padding: 5px;
            }
        </style>
    </head>
    <body>
        <h1>Últimos registros de notificação inseridos no BD</h1>
        <div id="tabela">
            ${tabela}
        </div>
    </body>
</html>
`;
};

function getRegistrosEmTabela(result) {
    let resTd = result.map((elem) => {
        return '<tr><td>' + elem.id + '</td>' +
                '<td>' + elem.channel + '</td>' +
                '<td>' + handleMessage(elem.message) + '</td>' +
                '<td>' + (elem.pub_redis === 1 ? 'Yes' : 'No') + '</td>' +
                '<td>' + elem.createdAt + '</td></tr>';
    });

    const tabela = `<table>
    <thead>
        <tr>
            <th>ID</th>
            <th>Channel</th>
            <th>Message</th>
            <th>Redis</th>
            <th>Date</th>
        </tr>
    </thead>
    <tbody>
        ${resTd.toString().replace(/,/g, '').replace(/\{\$vrgl\$\}/g, ',')}
    </tbody>
</table>
`;
    return tabela;
}

function handleMessage(message) {
    message = JSON.parse(message.replace(/\\"/g, '"'));
    return 'Tipo: ' + message.tipo + '<br />' +
            'Título: ' + message.titulo.replace(/,/g, '{$vrgl$}') + '<br />' +
            'Corpo: ' + message.corpo.replace(/,/g, '{$vrgl$}') + '<br />' +
            'Ação: ' + message.acao;
}

module.exports.getUltimosReg = getUltimosReg;
