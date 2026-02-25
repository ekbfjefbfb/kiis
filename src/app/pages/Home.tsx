import { useState, useEffect } from "react";
import { Mic, Square, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { clsx } from "clsx";
import { Link } from "react-router";
import { audioService } from "../../services/audio.service";
import { aiService } from "../../services/ai.service";
import { notesService } from "../../services/notes.service";
import { databaseService } from "../../services/database.service";

export default function Home() {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcription, setTranscription] = useState("");
  const [recentNotes, setRecentNotes] = useState<any[]>([]);

  useEffect(() => {
    loadRecentNotes();
  }, []);

  useEffect(() => {
    let interval: any;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      setRecordingTime(0);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const loadRecentNotes = async () => {
    await notesService.loadNotes();
    const notes = notesService.getNotes().slice(0, 5);
    setRecentNotes(notes);
  };

  const handleRecord = async () => {
    if (isRecording) {
      // Stop recording
      try {
        const audioBlob = await audioService.stopAudioRecording();
        setIsRecording(false);
        setIsProcessing(true);

        // Simulate AI processing
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Create note with AI analysis
        const now = new Date();
        const timestamp = now.toLocaleString("en-US", { 
          month: "short",
          day: "numeric",
          hour: "2-digit", 
          minute: "2-digit" 
        });

        // Simulate AI analysis
        const analysis = {
          subject: "Mathematics",
          important: ["Exam on Friday about derivatives"],
          summary: ["Basic derivatives", "Chain rule", "Composite functions"],
          tasks: ["Do exercises 1-10 page 45"],
          exams: [{ date: "Friday", topic: "Derivatives" }],
          keyPoints: ["Derivative measures rate of change"]
        };

        const note = await notesService.createNote(
          `${analysis.subject} - ${timestamp}`,
          analysis.subject,
          { name: "Auto-detected", phone: "", email: "" },
          `Recording from ${timestamp}\n\n⭐ Important:\n${analysis.important.join('\n')}\n\n📝 Summary:\n${analysis.summary.join('\n')}\n\n✏️ Tasks:\n${analysis.tasks.join('\n')}`,
          "importante"
        );

        // Save audio
        const audioId = note.id + "_audio";
        await databaseService.saveAudio(audioId, audioBlob);
        await notesService.updateNote(note.id, { hasAudio: true, audioId });

        setIsProcessing(false);
        await loadRecentNotes();
        setTranscription("");
      } catch (error) {
        console.error("Error:", error);
        setIsRecording(false);
        setIsProcessing(false);
        alert("Error saving recording");
      }
    } else {
      // Start recording
      const hasPermission = await audioService.requestPermissions();
      if (!hasPermission) {
        alert("Microphone permission needed");
        return;
      }

      try {
        await audioService.startAudioRecording();
        setIsRecording(true);
        setTranscription("Listening...");
      } catch (error) {
        console.error("Error:", error);
        alert("Error starting recording");
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getTimeAgo = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    return "Just now";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white p-6 pb-24">
      {/* Header */}
      <header className="mb-8">
        <h2 className="text-gray-500 text-sm font-medium uppercase tracking-wide mb-1">
          {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
        </h2>
        <h1 className="text-2xl font-bold text-gray-900">Quick Record</h1>
      </header>

      {/* Recording Button */}
      <div className="flex flex-col items-center justify-center mb-12">
        <AnimatePresence mode="wait">
          {isProcessing ? (
            <motion.div
              key="processing"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="text-center"
            >
              <div className="w-32 h-32 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
                <Loader2 size={48} className="text-indigo-600 animate-spin" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Analyzing...</h3>
              <p className="text-sm text-gray-500">AI is organizing your note</p>
            </motion.div>
          ) : (
            <motion.button
              key="record"
              onClick={handleRecord}
              whileTap={{ scale: 0.95 }}
              className={clsx(
                "w-32 h-32 rounded-full flex items-center justify-center shadow-2xl transition-all mb-4",
                isRecording 
                  ? "bg-red-500 animate-pulse" 
                  : "bg-indigo-600 hover:bg-indigo-700"
              )}
            >
              {isRecording ? (
                <Square size={48} className="text-white fill-white" />
              ) : (
                <Mic size={48} className="text-white" />
              )}
            </motion.button>
          )}
        </AnimatePresence>

        {!isProcessing && (
          <div className="text-center">
            {isRecording ? (
              <>
                <h3 className="text-lg font-semibold text-red-600 mb-1">RECORDING</h3>
                <p className="text-2xl font-mono font-bold text-gray-900">{formatTime(recordingTime)}</p>
                {transcription && (
                  <p className="text-sm text-gray-500 mt-2 italic">{transcription}</p>
                )}
              </>
            ) : (
              <>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">TAP TO RECORD</h3>
                <p className="text-sm text-gray-500">Start recording your class notes</p>
              </>
            )}
          </div>
        )}
      </div>

      {/* Recent Notes */}
      {!isRecording && !isProcessing && recentNotes.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Notes</h3>
          <div className="space-y-3">
            {recentNotes.map((note) => (
              <Link
                key={note.id}
                to={`/note/${note.id}`}
                className="block"
              >
                <motion.div
                  whileTap={{ scale: 0.98 }}
                  className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold text-gray-900">{note.className}</h4>
                    <span className="text-xs text-gray-500">{getTimeAgo(note.createdAt)}</span>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2">{note.content}</p>
                  {note.hasAudio && (
                    <div className="mt-2 flex items-center gap-1 text-xs text-indigo-600">
                      <Mic size={12} />
                      <span>Audio recording</span>
                    </div>
                  )}
                </motion.div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isRecording && !isProcessing && recentNotes.length === 0 && (
        <div className="text-center py-12">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mic size={32} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No notes yet</h3>
          <p className="text-sm text-gray-500">Tap the button above to start recording</p>
        </div>
      )}
    </div>
  );
}
