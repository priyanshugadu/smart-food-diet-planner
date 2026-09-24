import React, { useState, useRef, useEffect } from 'react';
import {
  BotMessageSquare,
  Send,
  Sparkles,
  Info,
  User,
  Trash2,
  RefreshCw,
  AlertCircle,
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
      text: `Hello ${profile.full_name || 'there'}! I am your Smart Diet Assistant. I've calibrated my suggestions for your goal (${profile.fitness_goal.replace('_', ' ')}), daily target (${profile.target_calories || 2200} kcal), and dietary preference (${profile.dietary_preference}). How can I assist your nutrition plan today?`,
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
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: textToSend,
          profileContext: {
            name: profile.full_name,
            age: profile.age,
            gender: profile.gender,
            weight: profile.weight,
            height: profile.height,
            goal: profile.fitness_goal,
            diet: profile.dietary_preference,
            allergies: profile.allergies,
            calories: profile.target_calories,
            protein: profile.target_protein,
          },
        }),
      });

      if (!response.ok) {
        throw new Error('AI service error');
      }

      const data = await response.json();
      const assistantMsg: Message = {
        id: String(Date.now() + 1),
        sender: 'assistant',
        text: data.reply || 'Here is your nutritional guidance based on your profile.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      // Graceful fallback response
      const fallbackMsg: Message = {
        id: String(Date.now() + 1),
        sender: 'assistant',
        text: `Here is a healthy recommendation for your ${profile.fitness_goal.replace('_', ' ')} goal (${profile.dietary_preference}):\n\n• Focus on lean protein (Paneer, Tofu, Soya chunks, Lentils, or Eggs/Chicken)\n• Incorporate complex carbs like rolled oats, brown rice, or whole wheat rotis\n• Drink at least 2.5L water and avoid refined sugars.\n\n(Note: Generated via smart offline nutrition fallback)`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
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
