import http from "node:http"
import readJsonBody from "./readJsonBody.js";
import { students } from "./students.js";
import sendJson from "./sendJson.js";
import 'dotenv/config';
import { sensitiveHeaders } from "node:http2";

const port = process.env.PORT || 8080;

const server = http.createServer(async (req, res) => {

  const url = new URL(req.url, `http://localhost:${port}`);
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
      const idStr = pathname.substring(pathname.lastIndexOf("/") + 1);
      const trgId = Number(idStr);

      const foundStudent = students.find((student) => {
        return student.id === trgId;
      })
      if(!foundStudent) {
        sendJson(res, 404, {ERROR: "Student Not Found"});
        return;
      }

      sendJson(res, 200, foundStudent);
      return;
    }

    if (req.method === "POST" && pathname === "/students") {
      const body = await readJsonBody(req);

      if(!body || typeof body !== "object" || Array.isArray(body) || !body.name || typeof body.name !== "string"
          || !body.course || typeof body.course !== "string" || !body.name.trim() || !body.course.trim())
      {
        sendJson(res, 404, {
          ERROR: "Invalid student name and course, please try again with a new post request"
        });
        return;
      }

      const newId = students.reduce((maxId, student) => Math.max(maxId, student.id || 0), 0) + 1;

      const newStudent = {
        id: newId,
        name: body.name.trim(),
        course: body.course.trim(),
      }

      students.push(newStudent);
      sendJson(res, 201, {message: "Student added", student: newStudent});
      return;
    }

    if ((req.method === "PUT" || req.method === "PATCH") && /^\/students\/\d+$/.test(pathname)) {
      const idStr = pathname.substring(pathname.lastIndexOf("/") + 1);
      const trgId = Number(idStr);

      const foundIndex = students.findIndex((student) => student.id === trgId);
      if(foundIndex === -1) {
        sendJson(res, 404, {error: "Student Not Found"});
      }

      const body = await readJsonBody(req);
      if(!body || typeof body !== "object" || Array.isArray(body)) {
        sendJson(res, 404, {error: "Invalid Json body"})
        return;
      }
      const currentStudent = students[foundIndex];
      if(req.method === "PUT"){
        if(!body.name || typeof body.name !== "string" || !body.name.trim() || !body.course || typeof body.course !== "string" || !body.course.trim()){
          sendJson(res, 404, {error: "Not a valid put request, both the name and course should not be empty strings"})
        }
        students[foundIndex] = {
          id: trgId,
          name: body.name.trim(),
          course: body.course.trim()
        }
      } else if(req.method === 'PATCH'){
        const updatedName = body.name !== undefined ? body.name : currentStudent.name;
        const updatedCourse = body.course !== undefined ? body.course : currentStudent.course;

        if(typeof updatedName !== "string" || typeof updatedCourse !== "string" || !updatedName.trim() || !updatedCourse.trim()) {
          sendJson(res, 404, {error: "Course and name can not be empty strings"})
        }
      }
      students[foundIndex] = {
        id: trgId,
        name: updatedName.trim(),
        course: updatedCourse.trim()
      }
      sendJson(res, 200, {message: "Student Added", student: students[foundIndex]});
      return;
    }

    if (req.method === "DELETE" && /^\/students\/\d+$/.test(pathname)) {
        const idStr = pathname.substring(pathname.lastIndexOf("/") + 1);
      const trgId = Number(idStr);

      const foundIndex = students.findIndex((student) => student.id === trgId);
      if(foundIndex === -1) {
        sendJson(res, 404, {error: "Student Not Found"});
      }

      const [deletedStudent] = students.splice(foundIndex, 1);

      sendJson(res, 201, {message: "Successfully delted the student", student: deletedStudent})
      return;
    }

    sendJson(res, 404, {error: `Route ${req.method} and ${pathname} not found`})
    return;
  } catch (error) {
    console.error(error);
    if(res.writableEnded) return ;
    if(error instanceof SyntaxError){
      sendJson(res, 404, {error: "Invalid JSON format"});
      return;
    }

    sendJson(res, 500, {Error: "Internal server error"});
    return;
  }
});

server.listen(port, () => {
  console.log(`Student API running at http://localhost:${port}`);
});