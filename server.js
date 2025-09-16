const http = require('http' );
const fs = require('fs');
const path = require('path');
const os = require('os');

const PORT = 12345;

function getLocalIpAddress() {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            if (iface.family === 'IPv4' && !iface.internal) {
                return iface.address;
            }
        }
    }
    return 'localhost';
}

const server = http.createServer((req, res ) => {
    // Extrai a URL base sem os parâmetros de busca (o que vem depois de '?')
    const baseUrl = req.url.split('?')[0];

    // Rota principal para servir o index.html (o buscador)
    if (baseUrl === '/') {
        const indexPath = path.join(__dirname, 'index.html');
        // CORREÇÃO APLICADA AQUI: Adicionado 'utf8' e tratamento de erro completo.
        fs.readFile(indexPath, 'utf8', (err, content) => {
            if (err) {
                console.error('Erro ao ler o arquivo index.html:', err);
                res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
                res.end('Erro no servidor: Não foi possível carregar o index.html.');
                return;
            }
            res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end(content);
        });
    }
    // Rota para o fetch do buscador (JSON completo)
    else if (baseUrl === '/questoes') {
        const jsonPath = path.join(__dirname, 'task_76781616.json');
        fs.readFile(jsonPath, 'utf8', (err, data) => {
            if (err) {
                res.writeHead(500);
                res.end('Erro ao carregar task_76781616.json');
                return;
            }
            res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(data);
        });
    }
    // Rota para o script do bookmarklet
    else if (baseUrl === '/script') {
        const scriptPath = path.join(__dirname, 'script.txt');
        fs.readFile(scriptPath, 'utf8', (err, data) => {
            if (err) {
                res.writeHead(500);
                res.end('Erro ao carregar script.txt');
                return;
            }
            res.writeHead(200, { 'Content-Type': 'application/javascript; charset=utf-8' });
            res.end(data);
        });
    }
    // Resposta para rotas não encontradas
    else {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end(`Endpoint não encontrado: ${baseUrl}`);
    }
});

const localIp = getLocalIpAddress();

server.listen(PORT, () => {
    console.log(`Servidor completo rodando!`);
    console.log(`\nBuscador de Questões: http://${localIp}:${PORT}` );
    console.log(`Solver (Bookmarklet): Clique no favorito na página da atividade.`);
    console.log('Bookmarklet: javascript:(function(){var s=document.createElement(\'script\');s.src=\'http://localhost:12345/script?t=%27+new Date( ).getTime();document.body.appendChild(s);})();');
    console.log('\n\nUtilize \"window.rodarBot = false;\" para parar o script');
});
