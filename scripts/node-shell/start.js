const http = require('http');
const {writeFile} = require('fs/promises');
const {highlight} = require("./highlight");

const server = http.createServer((req, res) => {
  if (req.url === '/highlight' && req.method === 'POST') {
    let requestBody = '';

    res.writeHead(200, {'Content-Type': 'text/plain'});

    req.on('data', chunk => {
      requestBody += chunk
    })

    req.on('end', () => {
      console.log('Received request body:', requestBody);
      const { code, lang } = JSON.parse(requestBody);
      res.end(highlight(code, lang));
    });
  } else {
    res.writeHead(404, {'Content-Type': 'text/plain'});
    res.end('Not Found\n');
  }
});

// 使用0作为端口号，Node.js会随机选择一个可用端口
server.listen(0, async () => {
  const address = server.address();

  await writeFile('./.node-shell', JSON.stringify({
    port: address.port,
    host: 'localhost'
  }, null, 2))
  console.log(`Server is running at http://localhost:${address.port}/`);
});