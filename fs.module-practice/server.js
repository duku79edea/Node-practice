import http from 'node:http';
import { getData } from "./getData.js";

const port = 4000;
const server = http.createServer(async (req, res) => {
    const destinstion = await getData();
    if(req.url === '/api' && req.method === 'GET') {
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify(destinstion));
    }else{
        res.statusCode = 404;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({error: "Not Found"}));
    }
})

server.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
})