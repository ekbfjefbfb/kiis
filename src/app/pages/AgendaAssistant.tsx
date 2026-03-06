import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router";
import { ArrowLeft, Mic, Send, Sparkles, Square, Volume2 } from "lucide-react";
import { classManager } from "../../services/class-manager";
import { aiService } from "../../services/ai.service";
import { audioService } from "../../services/audio.service";

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  actions?: Array<{ type: string; data: any }>;
}

export default function AgendaAssistant() {
  const navigate = useNavigate();
  const location = useLocation();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isRecordingAudio, setIsRecordingAudio] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [showPostSaveCta, setShowPostSaveCta] = useState(false);
  const [saveNeedsFormat, setSaveNeedsFormat] = useState(false);
  const [saveNeedsFormatText, setSaveNeedsFormatText] = useState<string | null>(null);
  const [lastError, setLastError] = useState<string | null>(null);
  const [lastSentText, setLastSentText] = useState<string | null>(null);
  const [authRequired, setAuthRequired] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const lastAssistantRef = useRef<string>("");
  const didAutoSendRef = useRef(false);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages, isProcessing]);

  useEffect(() => {
    const loadContext = () => {
      const pending = classManager.getPendingTasks();
      const today = new Date().toISOString().split('T')[0];

      if (messages.length === 0) {
        setMessages([{
          id: 'welcome',
          role: 'assistant',
          content: `Hola. Tienes ${pending.filter(t => t.dueDate === today).length} compromisos en tu agenda hoy. ¿Cómo te ayudo a organizarte?`
        }]);
      }
    };
    loadContext();
  }, []);

  const extractTaskLines = (text: string): string[] => {
    const lines = text
      .split(/\r?\n/)
      .map(l => l.trim())
      .filter(Boolean);

    const candidates = lines
      .map(l => l.replace(/^(-|•|\d+\)|\d+\.|\*)\s+/, "").trim())
      .filter(l => l.length >= 6);

    const unique: string[] = [];
    for (const c of candidates) {
      if (unique.length >= 5) break;
      const key = c.toLowerCase();
      if (!unique.some(u => u.toLowerCase() === key)) unique.push(c);
    }
    return unique;
  };

  const saveAssistantAsTasks = (message: Message) => {
    const structuredTasks = (message.actions || []).find(a => a.type === 'tasks')?.data as
      | Array<{ title?: string; due_date?: string; priority?: 'low' | 'medium' | 'high' }>
      | undefined;

    const items: Array<{ text: string; dueDate?: string; priority?: 'low' | 'medium' | 'high' }> = structuredTasks?.map(t => ({
      text: (t?.title || '').trim(),
      dueDate: t?.due_date,
      priority: t?.priority,
    })).filter(t => t.text.length > 0) || [];

    const fallbackTextItems: Array<{ text: string; dueDate?: string; priority?: 'low' | 'medium' | 'high' }> =
      items.length === 0
        ? extractTaskLines(message.content).map(t => ({ text: t, dueDate: undefined, priority: undefined }))
        : [];

    const finalItems = items.length > 0 ? items : fallbackTextItems;

    if (finalItems.length === 0) {
      setSaveStatus('No encontré tareas claras para guardar.');
      setShowPostSaveCta(false);
      setSaveNeedsFormat(true);
      setSaveNeedsFormatText(message.content);
      setTimeout(() => setSaveStatus(null), 2500);
      return;
    }

    const cls = classManager.suggestCurrentClass() || classManager.getClasses()[0] || null;
    if (!cls) {
      setSaveStatus('Primero crea/graba una clase para poder guardar tareas.');
      setShowPostSaveCta(false);
      setTimeout(() => setSaveStatus(null), 2500);
      return;
    }

    const base = new Date();
    base.setDate(base.getDate() + 1);
    const defaultDueDate = base.toISOString().split('T')[0];

    const mapPriority = (p?: string): 1 | 2 | 3 => {
      if (p === 'high') return 3;
      if (p === 'low') return 1;
      return 2;
    };

    const toSave = finalItems.slice(0, 5);

    for (const item of toSave) {
      classManager.addTask({
        text: item.text,
        dueDate: item.dueDate || defaultDueDate,
        priority: mapPriority(item.priority),
        completed: false,
        classId: cls.id,
      });
    }

    setSaveStatus(`Guardado: ${toSave.length} tarea${toSave.length === 1 ? '' : 's'}.`);
    setShowPostSaveCta(true);
    setSaveNeedsFormat(false);
    setSaveNeedsFormatText(null);
    setTimeout(() => {
      setSaveStatus(null);
      setShowPostSaveCta(false);
    }, 5000);
  };

  const reformulateAsList = async () => {
    const base = saveNeedsFormatText?.trim();
    if (!base || isProcessing) return;
    setSaveNeedsFormat(false);
    setSaveNeedsFormatText(null);
    await sendMessage(
      [
        'Convierte lo siguiente en una lista corta de tareas accionables.',
        'Formato obligatorio: 3 a 5 bullets, cada bullet una tarea clara.',
        'No expliques nada, solo la lista.',
        '',
        base,
      ].join('\n')
    );
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get('q');
    const autosend = params.get('autosend');
    if (!q) return;

    setInput(q);
    if (autosend === '1' && !didAutoSendRef.current) {
      const key = `assistant_autosend:${q}`;
      const alreadySent = (() => {
        try {
          return sessionStorage.getItem(key) === '1';
        } catch {
          return false;
        }
      })();

      if (!alreadySent) {
        didAutoSendRef.current = true;
        try {
          sessionStorage.setItem(key, '1');
        } catch {
          // no-op
        }
        setTimeout(() => {
          sendMessage(q);
        }, 0);
      }
    }
  }, [location.search]);

  useEffect(() => {
    return () => {
      try {
        audioService.stopRecording();
        audioService.stopSpeaking();
      } catch {
        // no-op
      }
    };
  }, []);

  const toggleListening = async () => {
    if (isListening) {
      if (isRecordingAudio) {
        try {
          const audioBlob = await audioService.stopAudioRecording();
          const transcription = await aiService.transcribe(audioBlob);
          setInput(prev => (prev ? prev + " " : "") + transcription);
        } catch (e) {
          console.error(e);
        } finally {
          setIsRecordingAudio(false);
          setIsListening(false);
        }
        return;
      }

      audioService.stopRecording();
      setIsListening(false);
      return;
    }

    const ok = await audioService.requestPermissions();
    if (!ok) return;

    setIsListening(true);
    audioService.startRecording(
      (text) => setInput(text),
      async (err) => {
        if (String(err).toLowerCase().includes('no soporta')) {
          try {
            await audioService.startAudioRecording();
            setIsRecordingAudio(true);
          } catch (e) {
            console.error(e);
            setIsListening(false);
            setIsRecordingAudio(false);
          }
        } else {
          setIsListening(false);
        }
      }
    );
  };

  const speakLastAssistant = () => {
    const text = lastAssistantRef.current.trim();
    if (!text) return;

    if (audioService.isSpeaking()) {
      audioService.stopSpeaking();
      setIsSpeaking(false);
      return;
    }

    setIsSpeaking(true);
    audioService.speak(text, () => setIsSpeaking(false));
  };

  const sendMessage = async (text: string) => {
    if (!text.trim() || isProcessing) return;

    setLastError(null);
    setAuthRequired(false);
    setLastSentText(text);

    const userMessage: Message = { id: Date.now().toString(), role: 'user', content: text };
    const assistantId = (Date.now() + 1).toString();
    setMessages(prev => [
      ...prev,
      userMessage,
      { id: assistantId, role: 'assistant', content: "" },
    ]);
    setInput("");
    setIsProcessing(true);

    try {
      const tasks = classManager.getPendingTasks();
      const recordings = classManager.getAllRecordings();
      const today = new Date().toISOString().split('T')[0];
      const todayRecordings = recordings.filter(r => r.date.startsWith(today));
      
      const context = `
        Estado de la Agenda:
        - Compromisos Pendientes: ${tasks.map(t => `${t.text} (Fecha: ${t.dueDate})`).join(', ')}
        - Sesiones Capturadas Hoy: ${todayRecordings.map(r => r.summary).join(' | ')}
        - Clases en el Calendario: ${classManager.getClasses().map(c => c.name).join(', ')}
      `;

      let aiResponse = "";
      
      const prompt = `${context}\n\nConsulta sobre la Agenda: ${text}`;

      const result = await aiService.chatStructured(prompt, [], (token) => {
        aiResponse += token;
        setMessages(prev => prev.map(m => (m.id === assistantId ? { ...m, content: aiResponse } : m)));
      });

      aiResponse = result.text;

      if (!aiResponse) throw new Error("No response from AI");

      lastAssistantRef.current = aiResponse;
      setMessages(prev => prev.map(m => (
        m.id === assistantId ? { ...m, content: aiResponse, actions: result.actions as any } : m
      )));

      if (autoSpeak) {
        setIsSpeaking(true);
        audioService.speak(aiResponse, () => setIsSpeaking(false));
      }
    } catch (e) {
      console.error("Assistant error:", e);

      const msg = e instanceof Error ? e.message : "Error";
      const needsAuth = msg.includes('[401]') || msg.toLowerCase().includes('unauthorized');
      setAuthRequired(needsAuth);
      setLastError(needsAuth ? "Sesión expirada. Inicia sesión para continuar." : msg);

      setMessages(prev => prev.map(m => (
        m.id === assistantId
          ? { ...m, content: needsAuth ? "Sesión expirada. Inicia sesión para continuar." : "No pude completar tu solicitud. Puedes reintentar." }
          : m
      )));
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black text-white flex flex-col font-['Plus_Jakarta_Sans'] overflow-hidden">
      <header className="flex-none px-6 pt-10 pb-4 border-b border-white/5 bg-black/80 backdrop-blur-xl z-20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate("/")}
              className="h-10 px-3 bg-zinc-900 rounded-2xl flex items-center justify-center active:scale-95 transition-transform"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="leading-none">
              <div className="text-sm font-bold">Agenda AI</div>
              <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Asistente Inteligente</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {saveStatus && (
              <div className="hidden sm:block text-[11px] font-bold text-zinc-500 uppercase tracking-widest px-3">
                {saveStatus}
              </div>
            )}
            <button
              onClick={() => setAutoSpeak(v => !v)}
              className={`h-10 px-3 rounded-2xl text-[11px] font-bold border transition-colors active:scale-95 ${
                autoSpeak ? 'bg-white text-black border-white/10' : 'bg-zinc-900 text-zinc-300 border-white/5'
              }`}
            >
              Voz
            </button>
            <button
              onClick={speakLastAssistant}
              className="h-10 w-10 bg-zinc-900 rounded-2xl flex items-center justify-center border border-white/5 active:scale-95"
              aria-label="Leer respuesta"
            >
              {isSpeaking ? <Square size={18} /> : <Volume2 size={18} />}
            </button>
          </div>
        </div>
      </header>

      {/* Chat - Área scrollable */}
      <main 
        ref={scrollRef} 
        className="flex-1 overflow-y-auto px-7 py-8 space-y-8 scroll-smooth no-scrollbar"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        <div className="min-h-full flex flex-col justify-end">
          <div className="space-y-8 pb-4">
            {messages.map((m, idx) => (
              <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div 
                  className={`max-w-[85%] p-4 rounded-[2rem] ${
                    m.role === 'user' 
                      ? 'bg-zinc-900 text-zinc-300 self-end rounded-tr-none' 
                      : 'bg-white/5 text-white self-start rounded-tl-none border border-white/5'
                  }`}
                >
                  {m.role === 'assistant' && m.content.trim().length === 0 && isProcessing && idx === messages.length - 1 ? (
                    <div className="flex items-center gap-1 h-[22px]">
                      <span className="w-1.5 h-1.5 rounded-full bg-zinc-500/60 animate-pulse" />
                      <span className="w-1.5 h-1.5 rounded-full bg-zinc-500/60 animate-pulse [animation-delay:120ms]" />
                      <span className="w-1.5 h-1.5 rounded-full bg-zinc-500/60 animate-pulse [animation-delay:240ms]" />
                    </div>
                  ) : (
                    <p className="text-[15px] leading-relaxed whitespace-pre-wrap break-words">{m.content}</p>
                  )}
                  {m.role === 'assistant' && m.id !== 'welcome' && m.content.trim().length > 0 && (
                    <div className="mt-4 flex items-center gap-2">
                      <button
                        onClick={() => saveAssistantAsTasks(m)}
                        className="h-9 px-3 bg-zinc-900 text-zinc-300 rounded-2xl text-[11px] font-bold border border-white/5 active:scale-95"
                      >
                        Agendar
                      </button>
                      {saveStatus && (
                        <div className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest">
                          {saveStatus}
                        </div>
                      )}
                      {saveNeedsFormat && saveNeedsFormatText === m.content && (
                        <button
                          onClick={reformulateAsList}
                          disabled={isProcessing}
                          className="h-9 px-3 bg-white text-black rounded-2xl text-[11px] font-bold active:scale-95 disabled:opacity-50"
                        >
                          Convertir en Tareas
                        </button>
                      )}
                      {showPostSaveCta && saveStatus?.startsWith('Guardado:') && (
                        <button
                          onClick={() => navigate('/')}
                          className="h-9 px-3 bg-white text-black rounded-2xl text-[11px] font-bold active:scale-95"
                        >
                          Ver Agenda
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer - Área fija abajo */}
      <footer className="flex-none p-6 pb-10 bg-black/80 backdrop-blur-xl border-t border-white/5">
        {(lastError || authRequired) && (
          <div className="mb-3 flex items-center justify-between gap-3">
            <div className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest truncate">
              {lastError}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {authRequired ? (
                <button
                  onClick={() => navigate('/login', { replace: true })}
                  className="h-9 px-3 bg-white text-black rounded-2xl text-[11px] font-bold active:scale-95"
                >
                  Iniciar sesión
                </button>
              ) : (
                <button
                  onClick={() => lastSentText && sendMessage(lastSentText)}
                  disabled={!lastSentText || isProcessing}
                  className="h-9 px-3 bg-zinc-900 text-zinc-300 rounded-2xl text-[11px] font-bold border border-white/5 active:scale-95 disabled:opacity-50"
                >
                  Reintentar
                </button>
              )}
            </div>
          </div>
        )}

        <div className="relative flex items-center gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage(input)}
            placeholder="Pregunta algo..."
            className="flex-1 h-14 bg-zinc-900 rounded-full px-6 text-sm focus:outline-none border border-white/5 focus:border-white/20 transition-all"
          />
          <button
            onClick={toggleListening}
            disabled={isProcessing}
            className={`h-14 w-14 rounded-2xl flex items-center justify-center border transition-colors active:scale-95 ${
              isListening ? 'bg-red-500/20 text-red-500 border-red-500/20' : 'bg-zinc-900 text-zinc-300 border-white/5'
            }`}
            aria-label="Dictar"
          >
            {isListening ? <Square size={18} /> : <Mic size={18} />}
          </button>
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || isProcessing}
            className={`h-14 px-4 rounded-2xl flex items-center justify-center transition-all ${
              isProcessing ? 'bg-zinc-900 animate-pulse' : 'bg-white text-black'
            }`}
          >
            <Send size={20} />
          </button>
        </div>
      </footer>
    </div>
  );
}
