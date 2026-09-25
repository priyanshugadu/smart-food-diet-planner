import React, { useState, useRef, useEffect } from 'react';
import {
  BotMessageSquare,
  Send,
  Sparkles,
  Info,
  User,
  Trash2,
  Lightbulb,
} from 'lucide-react';
import { UserProfile } from '../types';
import { MEDICAL_DISCLAIMER } from '../utils/nutritionCalculations';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

interface AiAssistantViewProps {
  profile: UserProfile;
}

const buildOfflineReply = (question: string, profile: UserProfile): string => {
  const q = question.toLowerCase();
  const calories = profile.target_calories || 2200;
  const protein = profile.target_protein || 100;
  const diet = (profile.dietary_preference || 'balanced').toLowerCase();
  const allergies = (profile.allergies || []).map((a) => a.toLowerCase());
  const avoidsPeanuts = allergies.some((a) => a.includes('peanut'));
  const veg = diet.includes('vegetarian') || diet.includes('vegan');

  if (q.includes('breakfast')) return `### Smart Breakfast Ideas 🥣

• **Paneer/besan chilla + curd**
• **Vegetable oats + curd/Greek yogurt**
• **Idli + sambar**

For your saved target of **${calories} kcal/day**, aim for a protein-rich breakfast that fits your overall plan.

*Educational nutrition guidance only; portions and nutrition values are estimates.*`;

  if (q.includes('protein') || q.includes('muscle') || q.includes('high-protein')) {
    const sources = veg
      ? 'paneer, tofu, soy chunks, dal, rajma, chole and curd/Greek yogurt'
      : 'eggs, chicken, fish, paneer, tofu, soy chunks, dal and curd/Greek yogurt';
    return `### High-Protein Options 💪

Useful protein sources for your diet include **${sources}**.

Your saved target is approximately **${protein}g protein/day**. Spread protein across several meals rather than relying on one meal.

*Educational guidance only; nutrition values are approximate.*`;
  }

  if (q.includes('snack')) {
    const options = avoidsPeanuts
      ? 'roasted makhana, roasted chana, fruit with curd, sprouts chaat, or paneer/tofu'
      : 'roasted makhana, roasted chana, sprouts chaat, fruit with curd, or a measured nut portion';
    return `### Healthy Snack Ideas 🍎

Try **${options}** and choose a portion that fits your remaining calories.
${avoidsPeanuts ? '\\n⚠️ Your profile lists a peanut allergy, so peanuts are not included.' : ''}

*Educational nutrition guidance only.*`;
  }

  if (q.includes('lunch') || q.includes('dinner') || q.includes('meal')) {
    return `### Balanced Indian Meal 🍛

• **Protein:** ${veg ? 'dal, paneer, tofu, soy or curd' : 'dal, paneer/tofu, eggs, chicken or fish'}
• **Carbs:** roti, rice or other whole grains
• **Vegetables:** make vegetables a major part of the plate
• **Hydration:** drink water through the day

Keep portions aligned with your **${calories} kcal/day** and **${protein}g protein/day** targets.`;
  }

  if (q.includes('calorie') || q.includes('kcal')) {
    return `### Calorie Planning 🔢

Your saved daily target is **${calories} kcal**.

A flexible example:
• Breakfast: 20–25%
• Lunch: 25–30%
• Dinner: 25–30%
• Snacks: 15–25%

These are planning ranges, not strict medical rules.`;
  }

  return `### Smart Nutrition Assistant 💡

I can help with:
• Indian meal ideas
• Protein and calorie planning
• Healthy snacks and food swaps
• Vegetarian/vegan options
• Meal timing and portion ideas

Your saved targets are **${calories} kcal/day** and **${protein}g protein/day**.

Try asking: “suggest a high-protein breakfast”.`;
};

const PROMPT_CHIPS = [
  'Suggest a high-protein breakfast',
  'Give me a vegetarian lunch under my calorie target',
  'What are top Indian protein sources?',
  'Suggest healthy Indian evening snacks',
  'How to distribute my 2200 kcal across 5 meals?',
];

export const AiAssistantView: React.FC<AiAssistantViewProps> = ({ profile }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: `Hello ${profile.full_name || 'there'}! I am your Smart Diet Assistant. I can help with meal ideas, protein, calories, snacks and Indian recipes. Your saved target is ${profile.target_calories || 2200} kcal/day. How can I assist you today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [inputPrompt, setInputPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSendMessage = async (promptText: string) => {
    const textToSend = promptText.trim();
    if (!textToSend || loading) return;

    const userMsg: Message = {
      id: String(Date.now()),
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputPrompt('');
    setLoading(true);

    try {
      // GitHub Pages is static hosting, so the browser-safe local assistant is
      // always available. If a hosted backend is configured, use it first.
      const apiUrl = (import.meta.env.VITE_AI_API_URL || '').trim();
      let reply = '';

      if (apiUrl) {
        try {
          const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              message: textToSend,
              prompt: textToSend,
              userProfile: profile,
              profileContext: profile,
            }),
          });
          if (response.ok) {
            const data = await response.json();
            reply = data.reply || '';
          }
        } catch {
          // Use the local assistant below when the hosted API is unavailable.
        }
      }

      const assistantMsg: Message = {
        id: String(Date.now() + 1),
        sender: 'assistant',
        text: reply || buildOfflineReply(textToSend, profile),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: 'reset',
        sender: 'assistant',
        text: `Chat reset. Ask me anything about healthy meal swaps, macro splits, or Indian recipes!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      {/* Medical Disclaimer Alert */}
      <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200/80 flex items-start gap-2.5 text-xs text-amber-900">
        <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Educational & Informational Advisory:</strong> {MEDICAL_DISCLAIMER}
        </p>
      </div>

      {/* Main Chat Container */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs flex flex-col h-[650px] overflow-hidden">
        {/* Chat Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-600 text-white flex items-center justify-center shadow-xs">
              <BotMessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <span>AI Diet & Nutrition Assistant</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
              </h4>
              <p className="text-[11px] text-slate-500">
                Calibrated for: <strong className="text-slate-700 capitalize">{profile.dietary_preference}</strong> •{' '}
                <strong className="text-slate-700">{profile.target_calories || 2200} kcal</strong>
              </p>
            </div>
          </div>

          <button
            onClick={handleClearChat}
            title="Reset conversation"
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors text-xs flex items-center gap-1"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Clear</span>
          </button>
        </div>

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${
                msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
              }`}
            >
              {/* Avatar */}
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                  msg.sender === 'user'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gradient-to-tr from-violet-600 to-indigo-600 text-white'
                }`}
              >
                {msg.sender === 'user' ? (
                  <User className="w-4 h-4" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
              </div>

              {/* Message Bubble */}
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-emerald-600 text-white rounded-tr-none'
                    : 'bg-slate-100/90 text-slate-800 rounded-tl-none border border-slate-200/50 whitespace-pre-wrap'
                }`}
              >
                <p>{msg.text}</p>
                <span
                  className={`block text-[10px] mt-1.5 text-right font-medium ${
                    msg.sender === 'user' ? 'text-emerald-200' : 'text-slate-400'
                  }`}
                >
                  {msg.timestamp}
                </span>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 text-xs text-slate-400 pl-11 animate-pulse">
              <Sparkles className="w-4 h-4 text-violet-500 animate-spin" />
              <span>Analyzing dietary targets & composing meal advice...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Prompt Chips */}
        <div className="p-3 bg-slate-50/80 border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto text-[11px]">
          <span className="text-slate-400 font-semibold shrink-0 pl-1 flex items-center gap-1">
            <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
            Suggestions:
          </span>
          {PROMPT_CHIPS.map((chip, idx) => (
            <button
              key={idx}
              disabled={loading}
              onClick={() => handleSendMessage(chip)}
              className="px-2.5 py-1 rounded-full bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 font-medium whitespace-nowrap border border-slate-200 transition-colors shrink-0"
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage(inputPrompt);
          }}
          className="p-3 bg-white border-t border-slate-100 flex items-center gap-2"
        >
          <input
            id="ai-assistant-input"
            type="text"
            placeholder="Ask about calorie deficits, Indian recipes, protein sources..."
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            disabled={loading}
            className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900"
          />

          <button
            id="ai-assistant-send-btn"
            type="submit"
            disabled={!inputPrompt.trim() || loading}
            className="p-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl transition-colors shadow-xs"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
