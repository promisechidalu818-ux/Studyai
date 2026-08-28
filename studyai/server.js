const http = require("node:http");

const PORT = Number(process.env.PORT) || 3000;

const server = http.createServer((req, res) => {
  res.writeHead(200, {
    "Content-Type": "application/json; charset=utf-8",
  });

  res.end(
    JSON.stringify({
      name: "StudyAI",
      message: "StudyAI server is ready to be extended.",
    }),
  );
});

server.listen(PORT, () => {
  console.log(`StudyAI server listening on port ${PORT}`);
});