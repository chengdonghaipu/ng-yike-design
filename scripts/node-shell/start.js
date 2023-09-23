const http = require('http');
const { writeFile } = require('fs/promises');

const server = http.createServer((req, res) => {
    if (req.url === '/hello') {
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('Hello, World!\n');
    } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found\n');
    }
});

// 使用0作为端口号，Node.js会随机选择一个可用端口
server.listen(0, async () => {
    const address = server.address();
    await writeFile('./.node-shell', JSON.stringify({ port: address.port }, null, 2))
    console.log(`Server is running at http://localhost:${address.port}/`);
});