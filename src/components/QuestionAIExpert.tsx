import React, { useState, useRef, useEffect } from "react";
import { Sparkles, Send, GraduationCap, ArrowRight, HelpCircle, CheckSquare, BrainCircuit, RefreshCw } from "lucide-react";

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  createdAt: string;
}

interface QuestionAIExpertProps {
  user: any;
  addToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export default function QuestionAIExpert({ user, addToast }: QuestionAIExpertProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "m0",
      sender: "ai",
      text: `Hello! I am **UniVault AI Expert**, your resident academic tutor.

How can I help you prepare today? I can:
1. **Predict future test questions** based on past curriculum patterns.
2. **Explain hard syllabus concepts** with easy examples.
3. **Recommend specific exam sheets** based on your target department.

Try clicking a quick prompt below or typing your question!`,
      createdAt: new Date().toISOString()
    }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto Scroll Chat Bubble
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const quickPrompts = [
    { title: "Predict Networks Questions", query: "Predict typical final year networks questions from 2024 to 2025" },
    { title: "Explain Normalized Normalization", query: "Explain BCNF Normalization vs 3NF with simple tables" },
    { title: "Recommend Study Resources", query: "Suggest the best question papers for Thermodynamics and Electrical Engineering" }
  ];

  const sendMessage = async (promptText: string) => {
    if (!promptText.trim()) return;
    if (!user) {
      addToast("Please login or join UniVault to chat with the AI Study Expert.", "error");
      return;
    }

    const userMsg: Message = {
      id: "um-" + Date.now(),
      sender: "user",
      text: promptText,
      createdAt: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputMessage("");
    setIsSending(true);

    try {
      const token = localStorage.getItem("univault_token");
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ message: promptText })
      });
      const data = await res.json();
      if (res.ok) {
        const aiMsg: Message = {
          id: "aim-" + Date.now(),
          sender: "ai",
          text: data.message,
          createdAt: new Date().toISOString()
        };
        setMessages(prev => [...prev, aiMsg]);
      } else {
        addToast(data.error || "Failed to interface with AI Tutor.", "error");
      }
    } catch (e) {
      addToast("AI Assistant sleep status. Network disconnect.", "error");
    } finally {
      setIsSending(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputMessage);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 outline-none animate-in fade-in slide-in-from-bottom-3 duration-300">
      
      {/* Side Quick Prompt Selectors (1 Column on Desktop) */}
      <div className="lg:col-span-1 space-y-5 text-left">
        
        {/* Tutor profile specs */}
        <div className="bg-slate-900 border border-slate-850 rounded-2xl p-5 text-white shadow-xl relative overflow-hidden">
          <div className="absolute right-0 bottom-0 select-none opacity-10 pointer-events-none scale-150 transform translate-x-3 translate-y-3">
            <BrainCircuit className="h-24 w-24 text-white" />
          </div>
          
          <div className="relative z-10 space-y-3">
            <div className="p-2 bg-white/20 rounded-xl inline-block">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Resident AI Tutor</h3>
              <p className="text-[10px] font-mono text-blue-400">POWERED BY GEMINI 3.5</p>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              Designed with semantic text algorithms, providing predicted trends and questions extraction instantly!
            </p>
          </div>
        </div>

        {/* Heuristic Suggestion Piles */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Quick Study Prompts</h4>
          <p className="text-[11px] text-slate-500">Pick a pre-formatted query to test predictions:</p>
          <div className="space-y-2">
            {quickPrompts.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => sendMessage(p.query)}
                className="w-full text-left p-3.5 bg-slate-50 dark:bg-slate-950 hover:bg-blue-50/50 dark:hover:bg-blue-950/20 rounded-xl border border-slate-205 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-850 transition-all text-xs"
              >
                <div className="flex items-start">
                  <ArrowRight className="h-3.5 w-3.5 shrink-0 text-blue-500 mr-2 mt-0.5" />
                  <span className="font-semibold text-slate-800 dark:text-slate-200 leading-snug">{p.title}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* Main Chat Interface (3 Columns on Desktop) */}
      <div className="lg:col-span-3 flex flex-col justify-between bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm h-[550px]">
        
        {/* Header bar */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/10 flex items-center justify-between text-left">
          <div className="flex items-center space-x-3">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
            <div>
              <span className="text-sm font-bold text-slate-800 dark:text-slate-200">UniVault AI Workspace Chat</span>
              <p className="text-[10px] text-slate-400 font-mono">Status: Connected to curriculum model files</p>
            </div>
          </div>
          <button 
            onClick={() => setMessages(prev => [prev[0]])}
            className="p-1 px-2.5 text-[10px] font-mono border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500"
            title="Reset Chat and context"
          >
            Clear Thread
          </button>
        </div>

        {/* Chat message bubbles */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {messages.map((m) => {
            const isAI = m.sender === "ai";
            return (
              <div 
                key={m.id}
                className={`flex w-full items-start gap-3.5 ${isAI ? "" : "flex-row-reverse"}`}
              >
                {/* Profile Pic */}
                <div className={`p-2 rounded-xl shrink-0 ${isAI ? "bg-blue-600 text-white" : "bg-slate-200 dark:bg-slate-800"}`}>
                  {isAI ? <Sparkles className="h-4 w-4" /> : <GraduationCap className="h-4 w-4 text-slate-600 dark:text-slate-300" />}
                </div>

                {/* Bubble card */}
                <div className="flex flex-col text-left max-w-lg">
                  <div className={`p-4 rounded-2xl text-xs leading-relaxed space-y-2 whitespace-pre-wrap ${
                    isAI 
                      ? "bg-slate-50 dark:bg-slate-950 dark:bg-slate-800/20 text-slate-800 dark:text-slate-200 border border-slate-200/50 dark:border-slate-800/50" 
                      : "bg-blue-600 text-white font-sans font-medium"
                  }`}>
                    {m.text}
                  </div>
                  <span className={`text-[9px] font-mono text-slate-400 mt-1 pl-2 ${isAI ? "" : "text-right pr-2"}`}>
                    {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            );
          })}

          {isSending && (
            <div className="flex w-full items-start gap-3.5">
              <div className="p-2 rounded-xl bg-blue-600 text-white animate-bounce">
                <Sparkles className="h-4 w-4" />
              </div>
              <div className="flex flex-col text-left">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 text-slate-500 text-xs flex items-center space-x-2">
                  <RefreshCw className="h-3.5 w-3.5 animate-spin text-blue-500" />
                  <span>Curating predictions & syllabus database insights...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={scrollRef}></div>
        </div>

        {/* Input Bar Form */}
        <form onSubmit={handleSubmit} className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/10 flex items-center gap-2">
          <input
            type="text"
            placeholder={user ? "Ask anything about final exam patterns, syllabus details, predictions..." : "Please sign in to interface with AI Study Experts."}
            disabled={!user || isSending}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            className="flex-1 px-4 py-3 rounded-xl bg-white dark:bg-slate-950 border border-slate-205 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs text-slate-800 dark:text-slate-100"
          />
          <button
            type="submit"
            disabled={!user || isSending || !inputMessage.trim()}
            className="p-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white rounded-xl transition shadow-lg shadow-blue-500/15"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>

      </div>

    </div>
  );
}
