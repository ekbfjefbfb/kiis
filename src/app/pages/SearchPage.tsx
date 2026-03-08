import { useState } from "react";
import { SearchIcon, Loader2, ArrowLeft, Bot, Globe } from "lucide-react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { searchService, SearchResult } from "../../services/search.service";

export default function SearchPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [aiSummary, setAiSummary] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || isSearching) return;

    setIsSearching(true);
    setResults([]);
    setAiSummary(null);

    try {
      const response = await searchService.searchWeb(query);
      setResults(response.results || []);
      setAiSummary(response.ai_summary || null);
    } catch (error) {
      // Silently handle error
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black text-white flex flex-col font-['Plus_Jakarta_Sans'] safe-area-inset overflow-hidden">
      {/* Header with Search Input */}
      <div className="bg-zinc-900/50 px-4 pt-12 pb-4 border-b border-white/5 sticky top-0 z-10 w-full backdrop-blur-lg">
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 flex items-center justify-center rounded-full active:bg-white/10 transition-colors"
            aria-label="Volver"
          >
            <ArrowLeft size={20} className="text-white" />
          </button>
          <h1 className="text-xl font-bold tracking-tight text-white">Buscar</h1>
        </div>

        <form onSubmit={handleSearch} className="relative">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 w-5 h-5" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="¿Qué necesitas investigar hoy?"
            className="w-full h-14 bg-zinc-900/40 backdrop-blur-xl border border-white/5 rounded-[2rem] pl-12 pr-12 text-base font-medium focus:outline-none focus:border-white/20 focus:bg-zinc-900/60 transition-all placeholder:text-zinc-700 text-white"
          />
          {isSearching && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              <Loader2 size={18} className="text-white animate-spin" />
            </div>
          )}
        </form>
      </div>

      {/* Results Area */}
      <div className="flex-1 overflow-y-auto p-4 pb-20 space-y-5 scrollbar-hide">
        <AnimatePresence>
          {!isSearching && results.length === 0 && !aiSummary && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full flex flex-col items-center justify-center pt-20"
            >
              <div className="w-20 h-20 bg-zinc-900/50 rounded-full flex items-center justify-center mb-4 border border-white/5">
                <Globe size={32} className="text-zinc-500" />
              </div>
              <p className="text-zinc-500 text-sm font-medium">Ingresa cualquier tema para buscar y resumir</p>
            </motion.div>
          )}

          {aiSummary && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-zinc-900/30 p-5 rounded-[2rem] border border-white/5"
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
                  <Bot size={18} className="text-black" />
                </div>
                <h2 className="text-sm font-bold tracking-tight text-white">Resumen</h2>
              </div>
              <p className="text-sm text-white/90 leading-relaxed whitespace-pre-wrap">
                {aiSummary}
              </p>
            </motion.div>
          )}

          {results.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-3"
            >
              <h2 className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest pl-1 mt-6">Fuentes Web</h2>
              {results.map((result, i) => (
                <a
                  key={i}
                  href={result.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block bg-zinc-900/30 p-4 rounded-[2rem] border border-white/5 active:bg-zinc-900/50 transition-all outline-none"
                >
                  <p className="text-[10px] font-bold tracking-widest uppercase text-zinc-500 mb-1 truncate">{result.source || result.url}</p>
                  <h3 className="text-[15px] font-semibold tracking-tight text-white mb-1.5 line-clamp-2">{result.title}</h3>
                  <p className="text-xs text-zinc-500 line-clamp-3 leading-relaxed">{result.snippet}</p>
                </a>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
