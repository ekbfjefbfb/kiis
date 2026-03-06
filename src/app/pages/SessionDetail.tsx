import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { ChevronLeft, Calendar, Clock, Sparkles, CheckCircle2, Trash2, MapPin, Zap } from "lucide-react";
import { agendaService, SessionWithItems, AgendaItem } from "../../services/agenda.service";

export default function SessionDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [session, setSession] = useState<SessionWithItems | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'summary' | 'tasks' | 'transcript'>('summary');

  useEffect(() => {
    loadSession();
  }, [id]);

  const loadSession = async () => {
    if (!id) return;
    try {
      setIsLoading(true);
      const data = await agendaService.getSession(id);
      setSession(data);
    } catch (error) {
      console.error(error);
      navigate("/dashboard");
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleTask = async (item: AgendaItem) => {
    if (!id) return;
    const prev = session;
    if (session) {
      setSession({
        ...session,
        items: session.items.map(i => i.id === item.id ? { ...i, status: i.status === 'done' ? 'pending' : 'done' } : i)
      });
    }
    try {
      const newStatus = item.status === 'done' ? 'pending' : 'done';
      await agendaService.updateItem(id, item.id, { status: newStatus });
    } catch (error) {
      setSession(prev);
    }
  };

  if (isLoading) return (
    <div className="fixed inset-0 bg-black flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-white/5 border-t-white rounded-full animate-spin" />
    </div>
  );

  if (!session) return null;

  const tasks = session.items.filter(i => i.item_type === 'task');
  const summaries = session.items.filter(i => i.item_type === 'summary');

  return (
    <div className="fixed inset-0 bg-black text-white flex flex-col font-['Plus_Jakarta_Sans'] safe-area-inset overflow-hidden">
      <header className="px-8 pt-16 pb-6 flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="w-10 h-10 -ml-2 flex items-center justify-center rounded-full active:bg-white/10 transition-colors">
          <ChevronLeft size={24} />
        </button>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-600">Sesión de Agenda</span>
        </div>
        <div className="w-10" />
      </header>

      <main className="flex-1 overflow-y-auto scrollbar-hide px-8 pt-4 pb-32 space-y-10">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tighter leading-tight italic mb-4">{session.class_name}</h1>
          <div className="flex flex-wrap gap-4 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
            <div className="flex items-center gap-1.5">
              <Calendar size={12} />
              <span>{new Date(session.session_datetime).toLocaleDateString("es-ES", { day: 'numeric', month: 'short' })}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock size={12} />
              <span>{new Date(session.session_datetime).toLocaleTimeString("es-ES", { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            {session.teacher_name && (
              <div className="flex items-center gap-1.5">
                <MapPin size={12} />
                <span>{session.teacher_name}</span>
              </div>
            )}
          </div>
        </div>

        {/* Custom Tabs */}
        <div className="flex p-1 bg-zinc-900/50 rounded-2xl">
          {[
            { id: 'summary', label: 'Resumen' },
            { id: 'tasks', label: `Tareas (${tasks.length})` },
            { id: 'transcript', label: 'Notas' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${
                activeTab === tab.id ? 'bg-white text-black shadow-lg' : 'text-zinc-500'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="space-y-8">
          {activeTab === 'summary' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {summaries.map(s => (
                <div key={s.id} className="bg-zinc-900/30 border border-white/5 rounded-[2.5rem] p-8 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-6 opacity-10"><Zap size={32} /></div>
                  <p className="text-xl text-white/90 leading-relaxed font-medium italic">"{s.content}"</p>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'tasks' && (
            <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {tasks.map(t => (
                <button
                  key={t.id}
                  onClick={() => handleToggleTask(t)}
                  className={`w-full p-6 rounded-[2rem] border flex items-center justify-between transition-all ${
                    t.status === 'done' ? 'bg-zinc-900/10 border-white/5 opacity-40' : 'bg-zinc-900/30 border-white/10'
                  }`}
                >
                  <div className="flex items-center gap-5">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                      t.status === 'done' ? 'bg-indigo-500 border-indigo-500' : 'border-zinc-700'
                    }`}>
                      {t.status === 'done' && <CheckCircle2 size={14} className="text-white" />}
                    </div>
                    <span className={`text-lg font-bold tracking-tight ${t.status === 'done' ? 'line-through text-zinc-500' : 'text-white'}`}>
                      {t.content}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}

          {activeTab === 'transcript' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="bg-zinc-900/10 border border-white/5 rounded-[2.5rem] p-8">
                <p className="text-base text-zinc-400 leading-relaxed font-medium whitespace-pre-wrap">
                  {session.live_transcript || "Sin transcripción disponible."}
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
