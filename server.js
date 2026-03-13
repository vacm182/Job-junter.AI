const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const MODEL = "claude-sonnet-4-20250514";

app.post("/api/chat", async (req, res) => {
  const { messages, system } = req.body;
  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({ model: MODEL, max_tokens: 800, system, messages })
    });
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/generate-cv", async (req, res) => {
  const { job } = req.body;
  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 1500,
        messages: [{
          role: "user",
          content: `Generate ATS-optimized CV and cover letter for Victor Castro Medina.
PROFILE: 9 years PET packaging engineer (Envases Universales Mexico 2016-2025). Expert: PET container design, industrialization, hotfill, rPET, eco-design, lightweighting, production line launch. Tools: SolidWorks, Keyshot. Education: Industrial Design UNAM + Stanford Design Thinking ME310. Location: Île-de-France. French: A2.
JOB: ${job.title} at ${job.company}, ${job.location}, ${job.salary}. ATS keywords: ${job.keywords.join(", ")}.
Reply ONLY with JSON (no markdown): {"cv":"optimized CV max 400 words","cover":"cover letter max 220 words mentioning ${job.company} specifically"}`
        }]
      })
    });
    const data = await response.json();
    const text = data.content?.[0]?.text?.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(text || "{}");
    res.json(parsed);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/health", (req, res) => res.json({ status: "ok" }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`JobHunter backend running on port ${PORT}`));
