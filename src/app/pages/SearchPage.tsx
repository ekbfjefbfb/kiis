import { useState } from "react";
import { SearchIcon, Loader2, ArrowLeft, Bot, Globe } from "lucide-react";
import { Link, useNavigate } from "react-router";
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
      console.error("Search failed:", error);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background text-foreground transition-colors duration-300">
      {/* Header with Search Input */}
      <div className="bg-card px-4 pt-6 pb-4 border-b border-border shadow-sm sticky top-0 z-10 w-full transition-colors duration-300">
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center text-secondary-foreground hover:bg-secondary/80 outline-none focus:ring-1 focus:ring-ring transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">Búsqueda Web e IA</h1>
        </div>

        <form onSubmit={handleSearch} className="relative">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="¿Qué necesitas investigar hoy?"
            className="w-full bg-secondary border border-border rounded-2xl py-3.5 pl-12 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-ring focus:bg-background text-foreground transition-all placeholder:text-muted-foreground"
          />
          {isSearching && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              <Loader2 size={18} className="text-foreground animate-spin" />
            </div>
          )}
        </form>
      </div>

      {/* Results Area */}
      <div className="flex-1 overflow-y-auto p-4 pb-20 space-y-5 bg-background">
        <AnimatePresence>
          {!isSearching && results.length === 0 && !aiSummary && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full flex flex-col items-center justify-center pt-20"
            >
              <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center mb-4 border border-border">
                <Globe size={32} className="text-muted-foreground" />
              </div>
              <p className="text-muted-foreground text-sm font-medium">Ingresa cualquier tema para buscar y resumir con IA</p>
            </motion.div>
          )}

          {aiSummary && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card p-5 rounded-2xl border border-border shadow-sm"
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-full bg-foreground flex items-center justify-center">
                  <Bot size={18} className="text-background" />
                </div>
                <h2 className="text-sm font-bold tracking-tight text-foreground">Resumen IA</h2>
              </div>
              <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">
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
              <h2 className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest pl-1 mt-6">Fuentes Web</h2>
              {results.map((result, i) => (
                <a
                  key={i}
                  href={result.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block bg-card p-4 rounded-2xl border border-border shadow-sm hover:border-foreground/30 transition-all outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <p className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground mb-1 truncate">{result.source || result.url}</p>
                  <h3 className="text-[15px] font-semibold tracking-tight text-foreground mb-1.5 line-clamp-2">{result.title}</h3>
                  <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">{result.snippet}</p>
                </a>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
