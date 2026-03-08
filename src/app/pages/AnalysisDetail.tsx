import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { ArrowLeft, Loader2 } from "lucide-react";
import { motion } from "motion/react";
import { intelligentProcessor, ProcessedTranscript } from "../../services/intelligent-processor";
import { notesService } from "../../services/notes.service";
import IntelligentAnalysis from "../components/IntelligentAnalysis";

export default function AnalysisDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [analysis, setAnalysis] = useState<ProcessedTranscript | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [noteTitle, setNoteTitle] = useState("");

  useEffect(() => {
    loadAnalysis();
  }, [id]);

  const loadAnalysis = async () => {
    if (!id) return;
    
    try {
      setIsLoading(true);
      
      // Cargar nota del backend
      const note = await notesService.getNoteById(id);
      setNoteTitle(note.title || "Nota");
      
      // Procesar transcripción con sistema inteligente
      if (note.transcript) {
        const processed = await intelligentProcessor.processTranscript(note.transcript);
        setAnalysis(processed);
      }
    } catch {
      // Silently handle error
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-['Plus_Jakarta_Sans'] overflow-hidden">
      {/* Header */}
      <header className="sticky top-0 bg-black/95 backdrop-blur-sm z-10 py-6 -mx-6 px-6 border-b border-white/5">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 flex items-center justify-center rounded-full active:bg-white/10 transition-colors"
            aria-label="Volver"
          >
            <ArrowLeft size={20} className="text-white" />
          </button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Análisis Inteligente
            </h1>
            <p className="text-sm text-zinc-500 mt-0.5">{noteTitle}</p>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto px-6 pt-6 pb-20 scrollbar-hide">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-white mb-4" />
            <p className="text-sm text-zinc-500">Analizando contenido...</p>
          </div>
        ) : (
          <IntelligentAnalysis
            analysis={analysis}
            isProcessing={false}
            progress={100}
          />
        )}

        {/* Chunks Detail (Optional) */}
        {analysis && !isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-8"
          >
            <h2 className="text-sm font-bold text-zinc-500 uppercase tracking-wide mb-4">
              Fragmentos Analizados ({analysis.chunks.length})
            </h2>
            <div className="space-y-3">
              {analysis.chunks.map((chunk, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-2xl border ${
                    chunk.classification.relevance === 'IMPORTANTE'
                      ? 'bg-green-500/5 border-green-500/20'
                      : chunk.classification.relevance === 'SECUNDARIO'
                      ? 'bg-yellow-500/5 border-yellow-500/20'
                      : 'bg-red-500/5 border-red-500/20'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`text-xs font-bold px-2 py-1 rounded-lg ${
                        chunk.classification.relevance === 'IMPORTANTE'
                          ? 'bg-green-500/20 text-green-500'
                          : chunk.classification.relevance === 'SECUNDARIO'
                          ? 'bg-yellow-500/20 text-yellow-500'
                          : 'bg-red-500/20 text-red-500'
                      }`}
                    >
                      {chunk.classification.relevance}
                    </span>
                    <span className="text-xs text-zinc-500">
                      {Math.round(chunk.classification.confidence * 100)}% confianza
                    </span>
                  </div>
                  <p className="text-sm text-white leading-relaxed mb-2">
                    {chunk.chunk}
                  </p>
                  <p className="text-xs text-zinc-500 italic">
                    {chunk.classification.reason}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}
