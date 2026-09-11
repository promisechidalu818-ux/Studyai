const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");

const PORT = Number(process.env.PORT) || 3000;
const HOST = "0.0.0.0";
const MAX_BODY_BYTES = 32_000;
const INDEX_FILE = path.join(__dirname, "index.html");

const topicGuides = [
  {
    matches: ["photosynthesis", "plant food", "chlorophyll"],
    topic: "Biology",
    title: "Photosynthesis",
    summary:
      "Photosynthesis is how green plants use sunlight to make food from water and carbon dioxide.",
    sections: [
      {
        heading: "How it works",
        body:
          "Chlorophyll in the leaves captures light energy. The plant takes in water through its roots and carbon dioxide through tiny openings in its leaves.",
      },
      {
        heading: "The word equation",
        body: "Carbon dioxide + water + light energy → glucose + oxygen.",
      },
      {
        heading: "Remember",
        body:
          "Glucose stores the plant's food energy, while oxygen is released into the air.",
      },
    ],
    followUps: ["What is chlorophyll?", "Explain the role of stomata"],
  },
  {
    matches: ["newton", "law of motion", "laws of motion", "force and motion"],
    topic: "Physics",
    title: "Newton's laws of motion",
    summary:
      "Newton's three laws explain how forces change the motion of objects.",
    sections: [
      {
        heading: "First law",
        body:
          "An object stays still or keeps moving at a steady speed in a straight line unless an outside force changes it. This is inertia.",
      },
      {
        heading: "Second law",
        body:
          "A stronger force creates more acceleration, while a heavier object needs more force. The formula is F = ma.",
      },
      {
        heading: "Third law",
        body:
          "For every action, there is an equal and opposite reaction. A swimmer pushes water backward and the water pushes the swimmer forward.",
      },
    ],
    followUps: ["Give me three examples of Newton's laws", "What is inertia?"],
  },
  {
    matches: ["surd", "surds", "irrational root", "square root"],
    topic: "Mathematics",
    title: "Surds",
    summary:
      "A surd is an exact root that cannot be simplified into a whole number or a simple fraction.",
    sections: [
      {
        heading: "Simplifying",
        body:
          "Look for a perfect-square factor. For example, √72 = √(36 × 2) = 6√2.",
      },
      {
        heading: "Combining surds",
        body:
          "Only like surds can be added or subtracted: 3√5 + 2√5 = 5√5.",
      },
      {
        heading: "Multiplying",
        body:
          "Multiply the numbers outside and inside the roots: (2√3)(4√5) = 8√15.",
      },
    ],
    followUps: ["Give me five surd practice questions", "Explain rationalising the denominator"],
  },
  {
    matches: ["cell", "cell biology", "organelles"],
    topic: "Biology",
    title: "The cell",
    summary:
      "A cell is the smallest unit of life. Living organisms are made of one or more cells.",
    sections: [
      {
        heading: "Important parts",
        body:
          "The nucleus controls cell activities, the cytoplasm is where many reactions happen, and the cell membrane controls what enters and leaves.",
      },
      {
        heading: "Plant cells",
        body:
          "Plant cells also have a cellulose cell wall, a large permanent vacuole, and chloroplasts for photosynthesis.",
      },
      {
        heading: "Animal cells",
        body:
          "Animal cells do not have a cell wall or chloroplasts. Their shape is usually more flexible.",
      },
    ],
    followUps: ["Compare plant and animal cells", "What does the nucleus do?"],
  },
];

function sendJson(res, statusCode, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(body),
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
  });
  res.end(body);
}

function sendText(res, statusCode, body, contentType = "text/plain; charset=utf-8") {
  res.writeHead(statusCode, {
    "Content-Type": contentType,
    "Content-Length": Buffer.byteLength(body),
    "X-Content-Type-Options": "nosniff",
  });
  res.end(body);
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    let size = 0;

    req.setEncoding("utf8");
    req.on("data", (chunk) => {
      size += Buffer.byteLength(chunk);
      if (size > MAX_BODY_BYTES) {
        reject(new Error("Request body is too large."));
        req.destroy();
        return;
      }
      body += chunk;
    });
    req.on("end", () => {
      if (!body) {
        resolve({});
        return;
      }

      try {
        resolve(JSON.parse(body));
      } catch {
        reject(new Error("Request body must be valid JSON."));
      }
    });
    req.on("error", reject);
  });
}

function makeFallbackGuide(question) {
  const cleanQuestion = question.replace(/\s+/g, " ").trim();
  return {
    topic: "Study guide",
    title: "Let's break it down",
    summary: `Here is a simple way to start studying "${cleanQuestion}".`,
    sections: [
      {
        heading: "Start with the meaning",
        body:
          "Write a one-sentence definition in your own words. If you cannot define it simply, identify the unfamiliar words first.",
      },
      {
        heading: "Build the idea",
        body:
          "Connect the topic to one example, one cause or process, and one result. This makes the idea easier to recall during revision.",
      },
      {
        heading: "Check your understanding",
        body:
          "Close your notes and explain the topic aloud. Then create a short question that tests the most important point.",
      },
    ],
    followUps: ["Give me a beginner explanation", "Turn this into a quiz"],
  };
}

function publicGuide(guide) {
  return {
    topic: guide.topic,
    title: guide.title,
    summary: guide.summary,
    sections: guide.sections,
    followUps: guide.followUps,
  };
}

function answerQuestion(question) {
  const normalized = question.toLowerCase();
  const arithmetic = normalized.match(/^\s*(\d+)\s*([+\-*])\s*(\d+)\s*$/);

  if (arithmetic) {
    const first = Number(arithmetic[1]);
    const second = Number(arithmetic[3]);
    const operator = arithmetic[2];
    const result =
      operator === "+"
        ? first + second
        : operator === "-"
          ? first - second
          : first * second;

    return {
      topic: "Mathematics",
      title: "Quick calculation",
      summary: `${first} ${operator} ${second} = ${result}`,
      sections: [
        {
          heading: "The answer",
          body: "The calculation is complete. Try changing one number and solve it again to practise.",
        },
      ],
      followUps: ["Give me a similar practice question", "Explain this step-by-step"],
    };
  }

  const guide = topicGuides.find((candidate) =>
    candidate.matches.some((match) => normalized.includes(match)),
  );

  return publicGuide(guide || makeFallbackGuide(question));
}

async function handleRequest(req, res) {
  const requestUrl = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);
  const { pathname } = requestUrl;

  if (req.method === "GET" && pathname === "/") {
    fs.readFile(INDEX_FILE, (error, data) => {
      if (error) {
        sendText(res, 500, "Could not load StudyAI.");
        return;
      }
      sendText(res, 200, data, "text/html; charset=utf-8");
    });
    return;
  }

  if (req.method === "GET" && pathname === "/api/healthz") {
    sendJson(res, 200, {
      status: "ok",
      name: "StudyAI",
      message: "StudyAI server is ready.",
    });
    return;
  }

  if (req.method === "POST" && pathname === "/api/ask") {
    let payload;
    try {
      payload = await readJsonBody(req);
    } catch (error) {
      sendJson(res, 400, { error: error.message });
      return;
    }

    const question = typeof payload.question === "string" ? payload.question.trim() : "";
    if (!question) {
      sendJson(res, 400, { error: "Please enter a question." });
      return;
    }
    if (question.length > 500) {
      sendJson(res, 400, { error: "Please keep your question under 500 characters." });
      return;
    }

    sendJson(res, 200, {
      question,
      answer: answerQuestion(question),
    });
    return;
  }

  if (pathname.startsWith("/api/")) {
    sendJson(res, 404, { error: "API route not found." });
    return;
  }

  sendText(res, 404, "Page not found.");
}

const server = http.createServer((req, res) => {
  handleRequest(req, res).catch(() => {
    if (!res.headersSent) {
      sendJson(res, 500, { error: "Something went wrong. Please try again." });
    }
  });
});

server.listen(PORT, HOST, () => {
  console.log(`StudyAI server listening on ${HOST}:${PORT}`);
});

function shutdown() {
  server.close(() => process.exit(0));
}

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);