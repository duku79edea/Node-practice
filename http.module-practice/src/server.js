const http = require("node:http");

const PORT = 3000;

const students = [
  { id: 1, name: "Alice Wani", course: "Node.js" },
  { id: 2, name: "David Mori", course: "JavaScript" },
  { id: 3, name: "Grace Roba", course: "Web Development" },
  { id: 4, name: 'Derick Duku', course: "Node.js" },
  { id: 5, name: "Brenda Edea", course: "Node.js and Express" },
];

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {"Content-Type": "application/json"});
  // res.statusCode = statusCode;
  // res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(data));
}

function readJsonBody(req) {
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

const server = http.createServer(async (req, res) => {

  const url = new URL(req.url, `http://localhost:${PORT}`);
  const pathname = url.pathname;

  console.log(`${req.method} ${req.url}`);

  try {
    if(req.method === "GET" && pathname === "/students") {
      let results = students;

      const course = url.searchParams.get("course");
      const name = url.searchParams.get("name");

      if(course) {
        results = results.filter((student) => {
          return student.course.toLowerCase() === course.toLowerCase();
        })
      }

      if(name) {
        results = results.filter((student) => {
          return student.name.toLowerCase() === name.toLowerCase();
        })
      }

      sendJson(res, 200, results);
      return;
    }

    if (req.method === "GET" && /^\/students\/\d+$/.test(pathname)) {
      const id = pathname.substring(pathname.lastIndexOf("/") + 1);
      const students = students.find((student) => {
        return students.id === id;
      })

      if(!students) {
        sendJson(res, 404, {ERROR: "Student Not Found"});
        return;
      }

      sendJson(res, 200, students);
      return;
    }

    // STAGE 4: POST /students
    if (req.method === "POST" && pathname === "/students") {
      const body = await readJsonBody(req);

      if(!body || typeof body === "object" || Array.isArray(body) || !body.name || typeof body.name !== "string"
          || !body.course || typeof body.course !== "string" || !body.name.trim() || !body.name.trim()
      ) {
        sendJson(res, 404, {ERROR: "Invalid student name and course, please try again with the post request"});
      }

      // TODO: assign a unique ID, add the student, return status 201
      return;
    }

    // STAGE 5: PUT /students/:id and PATCH /students/:id
    if (
      (req.method === "PUT" || req.method === "PATCH") &&
      /^\/students\/\d+$/.test(pathname)
    ) {
      // TODO: find student or return 404
      // TODO: parse and validate the request body
      // TODO: PUT replaces fields; PATCH updates only supplied fields
      return;
    }

    // STAGE 6: DELETE /students/:id
    if (req.method === "DELETE" && /^\/students\/\d+$/.test(pathname)) {
      // TODO: find the student's index
      // TODO: return 404 if missing, otherwise remove and return success
      return;
    }

    // STAGE 7: unknown routes should return a JSON 404.
    // TODO: send a JSON error response.
  } catch (error) {
    // STAGE 7: handle invalid JSON and unexpected errors safely.
    // TODO: do not send a second response if one has already ended.
    console.error(error);
  }
});

server.listen(PORT, () => {
  console.log(`Student API running at http://localhost:${PORT}`);
});
