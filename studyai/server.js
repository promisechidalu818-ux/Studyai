const http = require("http");
const fs = require("fs");
const path = require("path");
const { GoogleGenAI } = require("@google/genai");

const PORT = process.env.PORT || 3000;

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

async function answerQuestion(question) {
  if (!question || !question.trim()) {
    return "Please enter a question.";
  }

  const response = await ai.models.generateContent({
    model: "gemini-3.6-flash",
    contents: question,
    config: {
      systemInstruction:
        "You are StudyAI, a helpful school tutor. Answer students' questions clearly and accurately. Explain difficult ideas in simple language, give examples when useful, and show steps for mathematics or science problems. Do not assume the question is about any particular subject. Answer the question directly."
    }
  });

  return response.text || "I could not generate an answer.";
}

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8"
  });
  res.end(JSON.stringify(data));
}

const server = http.createServer((req, res) => {
  if (req.method === "POST" && req.url === "/api/ask") {
    let body = "";

    req.on("data", chunk => {
      body += chunk;
    });

    req.on("end", async () => {
      try {
        const data = JSON.parse(body);
        const question = data.question || "";

        const answer = await answerQuestion(question);

        sendJson(res, 200, { answer });
      } catch (error) {
        console.error("Gemini error:", error);
        sendJson(res, 500, {
          answer: "Sorry, StudyAI could not answer that question right now."
        });
      }
    });

    return;
  }

  let filePath = req.url === "/"
    ? path.join(__dirname, "index.html")
    : path.join(__dirname, req.url);

  filePath = path.normalize(filePath);

  if (!filePath.startsWith(__dirname)) {
    res.writeHead(403);
    return res.end("Forbidden");
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      return res.end("Not found");
    }

    const ext = path.extname(filePath);
    const types = {
      ".html": "text/html",
      ".css": "text/css",
      ".js": "application/javascript",
      ".json": "application/json",
      ".png": "image/png",
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".svg": "image/svg+xml"
    };

    res.writeHead(200, {
      "Content-Type": types[ext] || "text/plain"
    });

    res.end(data);
  });
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`StudyAI server listening on 0.0.0.0:${PORT}`);
});
