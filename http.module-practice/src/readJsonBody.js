export default function readJsonBody(req) {
    return new Promise((resolve, reject) => {
        if (req.headers["content-type"] !== "application/json") {
            reject(new Error("Content-Type must be a json"));
        }
        let body = "";
        req.on("data", (chunk) => { return body += chunk});

        req.on("end", () => {
            try{
                let json = JSON.parse(body);
                resolve(json);
            }catch(error){
                reject(new Error("Response was not found and invalid JSON"));
            }
        })
        req.on("error", (err) => {
            reject(new Error("Response was not found and invalid JSON"));
        })
    })
}