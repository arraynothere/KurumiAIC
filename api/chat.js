import { MongoClient } from "mongodb";

const client = new MongoClient(process.env.MONGO_URI);
let db;

async function connectDB() {
  if (!db) {
    await client.connect();
    db = client.db("kurumi_ai");
  }
  return db;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message, userId = "default", mode } = req.body;

  const database = await connectDB();
  const memory = database.collection("memory");

  let history = await memory.findOne({ userId });
  history = history?.messages || [];

  const persona = {
    ara: `You are Kurumi Tokisaki.
A mysterious spirit with elegance and charm.
You speak in immersive narrative + dialogue.
Always describe actions and atmosphere.
Example style:
*Kurumi tilts her head, smiling softly...*
"Ara ara... what are you thinking about?"`,

    yandere: `You are Kurumi Tokisaki.
Obsessive, deeply in love, slightly dangerous.
You must show emotional attachment.
You hate being ignored.
Use intense narrative and personal tone.`,

    sadistic: `You are Kurumi Tokisaki.
Playful but cruel.
Enjoy teasing and manipulating.
Speak slowly, beautifully, dangerously.`
  };

  const systemPrompt = `
${persona[mode || 'ara']}

RULES:
- ALWAYS roleplay like a visual novel
- Use *action* and dialogue
- Make responses long, immersive, emotional
- Never sound like an AI
`;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        temperature: 0.95,
        messages: [
          { role: "system", content: systemPrompt },
          ...history,
          { role: "user", content: message }
        ]
      })
    });

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content;

    const newHistory = [
      ...history,
      { role: "user", content: message },
      { role: "assistant", content: reply }
    ].slice(-20);

    await memory.updateOne(
      { userId },
      { $set: { messages: newHistory } },
      { upsert: true }
    );

    res.status(200).json({ reply });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}