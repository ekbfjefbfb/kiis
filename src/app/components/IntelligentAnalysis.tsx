import { motion } from "motion/react";
import { CheckCircle2, AlertCircle, XCircle, Loader2 } from "lucide-react";
import { ProcessedTranscript } from "../../services/intelligent-processor";

interface IntelligentAnalysisProps {
  analysis: ProcessedTranscript | null;
  isProcessing: boolean;
  progress: number;
}

export default function IntelligentAnalysis({ 
  analysis, 
  isProcessing, 
  progress 
}: IntelligentAnalysisProps) {
  
  if (isProcessing) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-muted/30 rounded-2xl p-6 border border-border/50"
      >
        <div className="flex items-center gap-3 mb-4">
          <Loader2 className="w-5 h-5 animate-spin text-foreground" />
          <h3 className="text-lg font-semibold text-foreground">Analizando contenido...</h3>
        </div>
        <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
          <motion.div
            className="h-full bg-foreground"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
        <p className="text-sm text-muted-foreground mt-2">{Math.round(progress)}% completado</p>
      </motion.div>
    );
  }

  if (!analysis) return null;

  const { summary, consolidatedData } = analysis;
  const totalChunks = summary.importantChunks + summary.secondaryChunks + summary.irrelevantChunks;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Resumen de Clasificación */}
      <div className="bg-muted/30 rounded-2xl p-5 border border-border/50">
        <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wide mb-4">
          Clasificación Inteligente
        </h3>
        <div className="grid grid-cols-3 gap-3">
          <div className="flex flex-col items-center p-3 bg-green-500/10 rounded-xl border border-green-500/20">
            <CheckCircle2 className="w-5 h-5 text-green-600 mb-1" />
            <span className="text-2xl font-bold text-green-600">{summary.importantChunks}</span>
            <span className="text-xs text-green-600/80 font-medium">Importante</span>
          </div>
          <div className="flex flex-col items-center p-3 bg-yellow-500/10 rounded-xl border border-yellow-500/20">
            <AlertCircle className="w-5 h-5 text-yellow-600 mb-1" />
            <span className="text-2xl font-bold text-yellow-600">{summary.secondaryChunks}</span>
            <span className="text-xs text-yellow-600/80 font-medium">Secundario</span>
          </div>
          <div className="flex flex-col items-center p-3 bg-red-500/10 rounded-xl border border-red-500/20">
            <XCircle className="w-5 h-5 text-red-600 mb-1" />
            <span className="text-2xl font-bold text-red-600">{summary.irrelevantChunks}</span>
            <span className="text-xs text-red-600/80 font-medium">Irrelevante</span>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-3 text-center">
          {totalChunks} fragmentos analizados • {Math.round((summary.importantChunks / totalChunks) * 100)}% relevante
        </p>
      </div>

      {/* Tareas Extraídas */}
      {consolidatedData.allTasks.length > 0 && (
        <div className="bg-muted/30 rounded-2xl p-5 border border-border/50">
          <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wide mb-3">
            ✏️ Tareas Detectadas ({consolidatedData.allTasks.length})
          </h3>
          <div className="space-y-2">
            {consolidatedData.allTasks.map((task, idx) => (
              <div key={idx} className="flex items-start gap-3 p-3 bg-background rounded-xl">
                <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                  task.priority === 'high' ? 'bg-red-500' :
                  task.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                }`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground">{task.description}</p>
                  {task.dueDate && (
                    <p className="text-xs text-muted-foreground mt-1">📅 {task.dueDate}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Fechas Importantes */}
      {consolidatedData.allDates.length > 0 && (
        <div className="bg-muted/30 rounded-2xl p-5 border border-border/50">
          <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wide mb-3">
            📅 Fechas Importantes ({consolidatedData.allDates.length})
          </h3>
          <div className="space-y-2">
            {consolidatedData.allDates.map((date, idx) => (
              <div key={idx} className="flex items-center gap-3 p-3 bg-background rounded-xl">
                <span className={`text-xs font-bold px-2 py-1 rounded-lg ${
                  date.type === 'exam' ? 'bg-red-500/20 text-red-600' :
                  date.type === 'deadline' ? 'bg-yellow-500/20 text-yellow-600' :
                  'bg-blue-500/20 text-blue-600'
                }`}>
                  {date.type === 'exam' ? 'EXAMEN' : date.type === 'deadline' ? 'ENTREGA' : 'EVENTO'}
                </span>
                <div className="flex-1">
                  <p className="text-sm text-foreground font-medium">{date.event}</p>
                  <p className="text-xs text-muted-foreground">{date.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Exámenes */}
      {consolidatedData.allExams.length > 0 && (
        <div className="bg-muted/30 rounded-2xl p-5 border border-border/50">
          <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wide mb-3">
            📝 Exámenes ({consolidatedData.allExams.length})
          </h3>
          <div className="space-y-3">
            {consolidatedData.allExams.map((exam, idx) => (
              <div key={idx} className="p-4 bg-background rounded-xl border border-border/30">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-semibold text-foreground">{exam.topic}</h4>
                  {exam.date && (
                    <span className="text-xs font-medium text-red-600 bg-red-500/10 px-2 py-1 rounded-lg">
                      {exam.date}
                    </span>
                  )}
                </div>
                {exam.coverage.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {exam.coverage.map((topic, i) => (
                      <span key={i} className="text-xs bg-muted px-2 py-1 rounded-md text-muted-foreground">
                        {topic}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Conceptos Clave */}
      {consolidatedData.keyConcepts.length > 0 && (
        <div className="bg-muted/30 rounded-2xl p-5 border border-border/50">
          <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wide mb-3">
            💡 Conceptos Clave ({consolidatedData.keyConcepts.length})
          </h3>
          <div className="flex flex-wrap gap-2">
            {consolidatedData.keyConcepts.map((concept, idx) => (
              <span key={idx} className="text-sm bg-indigo-500/10 text-indigo-600 px-3 py-1.5 rounded-full border border-indigo-500/20">
                {concept}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Definiciones */}
      {consolidatedData.keyDefinitions.length > 0 && (
        <div className="bg-muted/30 rounded-2xl p-5 border border-border/50">
          <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wide mb-3">
            📖 Definiciones ({consolidatedData.keyDefinitions.length})
          </h3>
          <div className="space-y-2">
            {consolidatedData.keyDefinitions.map((def, idx) => (
              <div key={idx} className="p-3 bg-background rounded-xl">
                <p className="text-sm text-foreground leading-relaxed">{def}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
