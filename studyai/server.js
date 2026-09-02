const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");

const PORT = Number(process.env.PORT) || 3000;

const server = http.createServer((req, res) => {
  if (req.url === "/" && req.method === "GET") {
    const filePath = path.join(__dirname, "index.html");

    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(500, {
          "Content-Type": "text/plain; charset=utf-8",
        });
        res.end("Could not load Study AI.");
        return;
      }

      res.writeHead(200, {
        "Content-Type": "text/html; charset=utf-8",
      });

      res.end(data);
    });

    return;
  }

  res.writeHead(404, {
    "Content-Type": "text/plain; charset=utf-8",
  });

  res.end("Page not found.");
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`StudyAI server listening on port ${PORT}`);
});