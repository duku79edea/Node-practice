export default function sendJson(res, statusCode, data) {
    res.writeHead(statusCode, {"Content-Type": "application/json"});
    // res.statusCode = statusCode;
    // res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(data));
}