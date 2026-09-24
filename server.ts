import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialized Gemini AI client
let aiClient: GoogleGenAI | null = null;
function getAiClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// API Routes
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
    supabaseConfigured: Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY),
  });
});

app.get("/api/config", (req, res) => {
  res.json({
    supabaseUrl: process.env.SUPABASE_URL || "",
    hasSupabaseKey: Boolean(process.env.SUPABASE_ANON_KEY),
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
  });
});

// AI Diet Assistant Endpoint
app.post("/api/ai/chat", async (req, res) => {
  try {
    const rawMsg = req.body.message || req.body.prompt;
    const userProfile = req.body.userProfile || req.body.profileContext;
    const conversationHistory = req.body.conversationHistory;

    const message = typeof rawMsg === "string" ? rawMsg : "";

    if (!message) {
      res.status(400).json({ error: "Message or prompt is required." });
      return;
    }

    const ai = getAiClient();

    // Prepare context from user profile
    const profileSummary = userProfile
      ? `User context:
- Name: ${userProfile.full_name || "User"}
- Age: ${userProfile.age || "N/A"}, Gender: ${userProfile.gender || "N/A"}
- Height: ${userProfile.height || "N/A"} cm, Weight: ${userProfile.weight || "N/A"} kg
- Fitness Goal: ${userProfile.fitness_goal || "Maintain Weight"}
- Dietary Preference: ${userProfile.dietary_preference || "Standard"}
- Allergies: ${Array.isArray(userProfile.allergies) ? userProfile.allergies.join(", ") : userProfile.allergies || "None"}
- Target Calories: ${userProfile.target_calories || "N/A"} kcal, Protein: ${userProfile.target_protein || "N/A"} g`
      : "No specific user profile provided.";

    const systemPrompt = `You are the specialized AI Diet Assistant for the "Smart Food & Diet Planner" web application.
${profileSummary}

Guidelines:
1. Provide accurate, practical, and motivating nutritional guidance, meal ideas, macro breakdowns, and smart food alternatives.
2. Keep in mind Indian and global cuisines (dal, roti, paneer, oats, eggs, idli, etc.), vegetarian/vegan requirements, and any food allergies.
3. Be concise, structured, and easy to read using markdown bullet points and bold highlights.
4. MANDATORY MEDICAL DISCLAIMER: Clearly state that your suggestions are informational estimates and educational guidance, not medical diagnosis or prescription. Users should consult registered dietitians or healthcare professionals for clinical conditions.
5. Offer concrete portion sizes and approximate calories/macros when suggesting foods or snacks.`;

    if (ai) {
      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: `${systemPrompt}\n\nUser Question: ${message}`,
      });

      const reply = response.text || "I couldn't generate a response. Please try again.";
      res.json({ reply, source: "gemini" });
      return;
    }

    // Built-in intelligent fallback for offline / keyless testing
    const lower = message.toLowerCase();
    let fallbackReply = "";

    if (lower.includes("high-protein") || lower.includes("protein")) {
      fallbackReply = `### High-Protein Recommendations 🥗

Here are nutrient-dense high-protein meal options aligned with your nutrition goals:

* **Paneer Bhurji / Grilled Paneer (150g)**: ~280 kcal | **21g Protein** | 6g Carbs | 18g Healthy Fats
* **Egg White & Veggie Omelet (3 whites + 1 whole egg)**: ~160 kcal | **18g Protein** | 2g Carbs
* **Sprouted Moong & Chana Salad (1 bowl)**: ~210 kcal | **14g Protein** | 32g Fiber-rich Carbs
* **Greek Yogurt / Hung Curd Bowl with Almonds (200g)**: ~190 kcal | **17g Protein** | 10g Carbs
* **Grilled Chicken Breast or Fish Tikka (150g)**: ~240 kcal | **38g Protein** | 0g Carbs

*Note: Nutrition estimates are educational and informational, not medical prescriptions.*`;
    } else if (lower.includes("breakfast")) {
      fallbackReply = `### Smart Healthy Breakfast Ideas 🥣

* **High-Fiber Vegetable Oats (50g oats + vegetables + flaxseeds)**: ~240 kcal | 8g Protein | 38g Carbs
* **2 Multigrain Rotis with 1 bowl Tadka Dal & Mint Chutney**: ~310 kcal | 12g Protein | 46g Carbs
* **2 Steamed Idlis with Sambar & Coconut-Coriander Chutney**: ~220 kcal | 7g Protein | 40g Carbs
* **Paneer & Spinach Stuffed Besan Chilla (2 pcs)**: ~280 kcal | 15g Protein | 24g Carbs

*Tip: Always drink 1-2 glasses of water 20 minutes before breakfast to kickstart digestion!*`;
    } else if (lower.includes("snack") || lower.includes("snacks")) {
      fallbackReply = `### Healthy Indian Snack Ideas (Under 180 kcal) 🥜

* **Roasted Makhana (Fox Nuts) with Pinch of Turmeric & Black Pepper (30g)**: ~110 kcal | 3g Protein
* **Boiled Peanut / Chickpea Chaat with Lemon Juice & Cucumber (1/2 cup)**: ~150 kcal | 7g Protein
* **Mixed Roasted Seeds (Chia, Pumpkin, Sunflower - 2 tbsp)**: ~130 kcal | 5g Protein | Healthy Omega-3s
* **Apple or Guava slices with pinch of Chaat Masala**: ~80 kcal | High dietary fiber

*Tip: Pre-portion snacks into small containers to prevent accidental overeating.*`;
    } else if (lower.includes("lunch") || lower.includes("dinner")) {
      fallbackReply = `### Balanced Meal Blueprint 🍛

A balanced meal plate follows the healthy ratio:
1. **50% Vegetables & Salad**: Cucumber, tomato, spinach, methi, carrots, capsicum.
2. **25% Lean Protein**: Dal / Rajma / Chole / Paneer / Tofu / Chicken / Fish / Eggs.
3. **25% Complex Carbohydrates**: 1-2 Rotis (Whole Wheat / Jowar) or 1 bowl Brown/Basmati Rice.

*Approximate Meal Profile*: ~420 - 520 kcal, 20-25g protein, 10g dietary fiber.`;
    } else {
      fallbackReply = `### Smart Nutrition Insight 💡

Thank you for your question: "${message}"

Here are core principles for your daily diet planner:
- **Caloric Balance**: Maintain a steady caloric intake matching your goal (${userProfile?.fitness_goal || "Healthy lifestyle"}).
- **Hydration**: Aim for 2.5 to 3.5 liters of clean water daily.
- **Macronutrient Split**: Strive for 45-50% complex carbs, 25-30% quality protein, and 20-25% essential healthy fats.
- **Whole Foods**: Prioritize fresh seasonal vegetables, lentils, whole grains, and lean sources.

*Disclaimer: Calculations and recommendations are strictly informational estimates and do not replace personalized advice from certified dietitians or medical professionals.*`;
    }

    res.json({ reply: fallbackReply, source: "fallback" });
  } catch (error: any) {
    console.error("AI Assistant error:", error);
    res.status(500).json({ error: error.message || "Failed to process AI request." });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
