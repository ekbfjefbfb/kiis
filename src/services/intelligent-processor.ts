/**
 * Sistema de Procesamiento Inteligente
 * Clasifica y extrae información estructurada de transcripciones de clases
 */

import { groqService } from './groq.service';

export interface RelevanceClassification {
  relevance: 'IMPORTANTE' | 'SECUNDARIO' | 'IRRELEVANTE';
  reason: string;
  confidence: number; // 0-1
}

export interface ExtractedData {
  concepts?: string[];
  tasks?: TaskExtraction[];
  dates?: DateExtraction[];
  exams?: ExamExtraction[];
  definitions?: string[];
  instructions?: string[];
}

export interface TaskExtraction {
  description: string;
  dueDate?: string;
  priority: 'high' | 'medium' | 'low';
}

export interface DateExtraction {
  event: string;
  date: string;
  type: 'exam' | 'deadline' | 'event';
}

export interface ExamExtraction {
  topic: string;
  date?: string;
  coverage: string[];
}

export interface ChunkAnalysis {
  chunk: string;
  classification: RelevanceClassification;
  extractedData?: ExtractedData;
}

export interface ProcessedTranscript {
  originalText: string;
  chunks: ChunkAnalysis[];
  summary: {
    importantChunks: number;
    secondaryChunks: number;
    irrelevantChunks: number;
  };
  consolidatedData: {
    allTasks: TaskExtraction[];
    allDates: DateExtraction[];
    allExams: ExamExtraction[];
    keyConcepts: string[];
    keyDefinitions: string[];
  };
}

class IntelligentProcessor {
  private readonly CHUNK_SIZE_WORDS = 150; // ~30-60 segundos de habla
  private readonly GROQ_API_KEY = (import.meta as any).env?.VITE_GROQ_API_KEY as string | undefined;

  /**
   * Divide el texto en chunks inteligentes
   */
  chunkTranscript(text: string): string[] {
    const words = text.split(/\s+/);
    const chunks: string[] = [];
    
    for (let i = 0; i < words.length; i += this.CHUNK_SIZE_WORDS) {
      const chunk = words.slice(i, i + this.CHUNK_SIZE_WORDS).join(' ');
      if (chunk.trim()) {
        chunks.push(chunk.trim());
      }
    }
    
    return chunks;
  }

  /**
   * Clasifica un chunk como IMPORTANTE, SECUNDARIO o IRRELEVANTE
   */
  async classifyChunk(chunk: string): Promise<RelevanceClassification> {
    if (!this.GROQ_API_KEY) {
      return this.fallbackClassification(chunk);
    }

    const prompt = `Analiza este fragmento de clase y clasifícalo.

FRAGMENTO:
"${chunk}"

Clasifícalo como:
- IMPORTANTE: conceptos clave, definiciones, tareas, fechas de examen, instrucciones del profesor
- SECUNDARIO: ejemplos largos, aclaraciones, repeticiones de conceptos ya mencionados
- IRRELEVANTE: bromas, conversaciones fuera del tema, comentarios personales

Responde SOLO con un JSON en este formato exacto:
{
  "relevance": "IMPORTANTE" | "SECUNDARIO" | "IRRELEVANTE",
  "reason": "breve explicación",
  "confidence": 0.95
}`;

    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.3,
          max_tokens: 200,
        }),
      });

      if (!response.ok) {
        console.warn('Groq API error, usando fallback');
        return this.fallbackClassification(chunk);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content || '{}';
      
      // Extraer JSON del contenido
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          relevance: parsed.relevance || 'SECUNDARIO',
          reason: parsed.reason || 'Clasificación automática',
          confidence: parsed.confidence || 0.7,
        };
      }
      
      return this.fallbackClassification(chunk);
    } catch (error) {
      console.error('Error clasificando chunk:', error);
      return this.fallbackClassification(chunk);
    }
  }

  /**
   * Extrae información estructurada de un chunk IMPORTANTE
   */
  async extractStructuredData(chunk: string): Promise<ExtractedData> {
    if (!this.GROQ_API_KEY) {
      return this.fallbackExtraction(chunk);
    }

    const prompt = `Extrae información estructurada de este fragmento de clase.

FRAGMENTO:
"${chunk}"

Extrae:
- Conceptos clave mencionados
- Tareas asignadas (con fecha si se menciona)
- Fechas importantes (exámenes, entregas)
- Definiciones
- Instrucciones del profesor

Responde SOLO con un JSON en este formato exacto:
{
  "concepts": ["concepto1", "concepto2"],
  "tasks": [{"description": "tarea", "dueDate": "fecha o null", "priority": "high|medium|low"}],
  "dates": [{"event": "evento", "date": "fecha", "type": "exam|deadline|event"}],
  "exams": [{"topic": "tema", "date": "fecha o null", "coverage": ["tema1", "tema2"]}],
  "definitions": ["definición1"],
  "instructions": ["instrucción1"]
}`;

    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.2,
          max_tokens: 500,
        }),
      });

      if (!response.ok) {
        return this.fallbackExtraction(chunk);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content || '{}';
      
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          concepts: parsed.concepts || [],
          tasks: parsed.tasks || [],
          dates: parsed.dates || [],
          exams: parsed.exams || [],
          definitions: parsed.definitions || [],
          instructions: parsed.instructions || [],
        };
      }
      
      return this.fallbackExtraction(chunk);
    } catch (error) {
      console.error('Error extrayendo datos:', error);
      return this.fallbackExtraction(chunk);
    }
  }

  /**
   * Procesa una transcripción completa
   */
  async processTranscript(transcript: string, onProgress?: (progress: number) => void): Promise<ProcessedTranscript> {
    const chunks = this.chunkTranscript(transcript);
    const analyses: ChunkAnalysis[] = [];
    
    let importantCount = 0;
    let secondaryCount = 0;
    let irrelevantCount = 0;

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      
      // Clasificar relevancia
      const classification = await this.classifyChunk(chunk);
      
      // Extraer datos si es importante
      let extractedData: ExtractedData | undefined;
      if (classification.relevance === 'IMPORTANTE') {
        extractedData = await this.extractStructuredData(chunk);
        importantCount++;
      } else if (classification.relevance === 'SECUNDARIO') {
        secondaryCount++;
      } else {
        irrelevantCount++;
      }

      analyses.push({
        chunk,
        classification,
        extractedData,
      });

      // Reportar progreso
      if (onProgress) {
        onProgress(((i + 1) / chunks.length) * 100);
      }
    }

    // Consolidar datos
    const consolidatedData = this.consolidateData(analyses);

    return {
      originalText: transcript,
      chunks: analyses,
      summary: {
        importantChunks: importantCount,
        secondaryChunks: secondaryCount,
        irrelevantChunks: irrelevantCount,
      },
      consolidatedData,
    };
  }

  /**
   * Consolida datos de todos los chunks importantes
   */
  private consolidateData(analyses: ChunkAnalysis[]) {
    const allTasks: TaskExtraction[] = [];
    const allDates: DateExtraction[] = [];
    const allExams: ExamExtraction[] = [];
    const keyConcepts: string[] = [];
    const keyDefinitions: string[] = [];

    for (const analysis of analyses) {
      if (analysis.extractedData) {
        const data = analysis.extractedData;
        
        if (data.tasks) allTasks.push(...data.tasks);
        if (data.dates) allDates.push(...data.dates);
        if (data.exams) allExams.push(...data.exams);
        if (data.concepts) keyConcepts.push(...data.concepts);
        if (data.definitions) keyDefinitions.push(...data.definitions);
      }
    }

    // Eliminar duplicados
    return {
      allTasks: this.deduplicateTasks(allTasks),
      allDates: this.deduplicateDates(allDates),
      allExams: this.deduplicateExams(allExams),
      keyConcepts: [...new Set(keyConcepts)],
      keyDefinitions: [...new Set(keyDefinitions)],
    };
  }

  private deduplicateTasks(tasks: TaskExtraction[]): TaskExtraction[] {
    const seen = new Set<string>();
    return tasks.filter(task => {
      const key = task.description.toLowerCase().trim();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  private deduplicateDates(dates: DateExtraction[]): DateExtraction[] {
    const seen = new Set<string>();
    return dates.filter(date => {
      const key = `${date.event}-${date.date}`.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  private deduplicateExams(exams: ExamExtraction[]): ExamExtraction[] {
    const seen = new Set<string>();
    return exams.filter(exam => {
      const key = exam.topic.toLowerCase().trim();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  /**
   * Clasificación fallback basada en palabras clave
   */
  private fallbackClassification(chunk: string): RelevanceClassification {
    const lowerChunk = chunk.toLowerCase();
    
    // Palabras clave importantes
    const importantKeywords = [
      'examen', 'tarea', 'importante', 'deben estudiar', 'entra en',
      'definimos', 'concepto', 'fecha límite', 'entregar', 'evalúa',
      'parcial', 'final', 'proyecto', 'trabajo', 'leer capítulo'
    ];
    
    // Palabras irrelevantes
    const irrelevantKeywords = [
      'jaja', 'perdí el bus', 'ayer', 'mi perro', 'el fin de semana',
      'por cierto', 'fuera del tema'
    ];

    const hasImportant = importantKeywords.some(kw => lowerChunk.includes(kw));
    const hasIrrelevant = irrelevantKeywords.some(kw => lowerChunk.includes(kw));

    if (hasImportant) {
      return {
        relevance: 'IMPORTANTE',
        reason: 'Contiene palabras clave importantes',
        confidence: 0.8,
      };
    }

    if (hasIrrelevant) {
      return {
        relevance: 'IRRELEVANTE',
        reason: 'Conversación fuera del tema',
        confidence: 0.7,
      };
    }

    return {
      relevance: 'SECUNDARIO',
      reason: 'Contenido general de clase',
      confidence: 0.6,
    };
  }

  /**
   * Extracción fallback basada en regex
   */
  private fallbackExtraction(chunk: string): ExtractedData {
    const tasks: TaskExtraction[] = [];
    const dates: DateExtraction[] = [];
    const concepts: string[] = [];

    // Detectar tareas
    const taskPatterns = [
      /(?:tarea|hacer|lean|estudien|completen)\s+(.+?)(?:\.|$)/gi,
      /(?:para el|entregar el)\s+(\w+)/gi,
    ];

    for (const pattern of taskPatterns) {
      const matches = chunk.matchAll(pattern);
      for (const match of matches) {
        if (match[1]) {
          tasks.push({
            description: match[1].trim(),
            priority: 'medium',
          });
        }
      }
    }

    // Detectar fechas
    const datePatterns = [
      /(?:examen|parcial|final)\s+(?:el|para el)?\s*(\w+)/gi,
    ];

    for (const pattern of datePatterns) {
      const matches = chunk.matchAll(pattern);
      for (const match of matches) {
        if (match[1]) {
          dates.push({
            event: 'Examen',
            date: match[1],
            type: 'exam',
          });
        }
      }
    }

    return { tasks, dates, concepts };
  }
}

export const intelligentProcessor = new IntelligentProcessor();
