import http from "node:http"
import readJsonBody from "./readJsonBody.js";
import { students } from "./students.js";
import sendJson from "./sendJson.js";
import 'dotenv/config';

const port = process.env.PORT || 8080;

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

server.listen(port, () => {
  console.log(`Student API running at http://localhost:${port}`);
});
