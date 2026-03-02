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
    } catch (error) {
      console.error("Error loading analysis:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-background px-6 pb-32">
      {/* Header */}
      <header className="sticky top-0 bg-background/95 backdrop-blur-sm z-10 py-6 -mx-6 px-6 border-b border-border/50">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-muted rounded-xl transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <div className="flex-1">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              Análisis Inteligente
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">{noteTitle}</p>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="mt-6">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-foreground mb-4" />
            <p className="text-sm text-muted-foreground">Analizando contenido...</p>
          </div>
        ) : (
          <IntelligentAnalysis
            analysis={analysis}
            isProcessing={false}
            progress={100}
          />
        )}
      </div>

      {/* Chunks Detail (Optional) */}
      {analysis && !isLoading && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-6"
        >
          <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wide mb-4">
            Fragmentos Analizados ({analysis.chunks.length})
          </h2>
          <div className="space-y-3">
            {analysis.chunks.map((chunk, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-xl border ${
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
                        ? 'bg-green-500/20 text-green-600'
                        : chunk.classification.relevance === 'SECUNDARIO'
                        ? 'bg-yellow-500/20 text-yellow-600'
                        : 'bg-red-500/20 text-red-600'
                    }`}
                  >
                    {chunk.classification.relevance}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {Math.round(chunk.classification.confidence * 100)}% confianza
                  </span>
                </div>
                <p className="text-sm text-foreground leading-relaxed mb-2">
                  {chunk.chunk}
                </p>
                <p className="text-xs text-muted-foreground italic">
                  {chunk.classification.reason}
                </p>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
