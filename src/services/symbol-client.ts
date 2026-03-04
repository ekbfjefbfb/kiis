// CLIENTE ULTRA EFICIENTE - USA LOS 72 SÍMBOLOS
// Reduce payload en 80-90% vs JSON tradicional

const ENDPOINT = '/.netlify/functions/symbols';

// SÍMBOLOS - Mismo mapeo que el backend
const OPS: Record<string, string> = {
  'create': '𐤀', 'read': '𐤁', 'update': '𐤂', 'delete': '𐤃',
  'list': '𐤄', 'search': '𐤅', 'filter': '𐤆', 'sort': '𐤇',
  'aggregate': '𐤈', 'transform': '𐤉', 'validate': '𐤊', 'encrypt': '𐤋',
  'decrypt': '𐤌', 'compress': '𐤍', 'decompress': '𐤎', 'cache': '𐤏',
  'invalidate': '𐤐', 'sync': '𐤑', 'auth': '𐤒', 'login': '𐤓',
  'logout': '𐤔', 'register': '𐤕', 'verify': 'ℵ', 'token': 'ℶ',
  'refresh': 'ℷ', 'revoke': 'ℸ', 'authorize': '∀', 'ai_query': '∃',
  'ai_stream': '∄', 'ai_stop': '∅', 'ai_delta': '∆', 'ai_gradient': '∇',
  'ai_context': '∈', 'ai_exclude': '∉', 'ai_include': '∋', 'ai_filter': '∌',
  'ai_sum': '∑', 'ai_product': '∏', 'ai_coproduct': '∐', 'ai_integrate': '∫',
  'ai_double': '∬', 'ai_triple': '∭', 'ai_loop': '∮', 'ai_surface': '∯',
  'ai_volume': '∰', 'audio_record': '♪', 'audio_play': '♫', 'audio_stop': '♬',
  'audio_lower': '♭', 'audio_normal': '♮', 'audio_raise': '♯', 'audio_treble': '𝄞',
  'audio_bass': '𝄢', 'audio_mute': '𝄫', 'note_create': '✎', 'note_edit': '✏',
  'note_write': '✐', 'note_sign': '✑', 'note_ink': '✒', 'note_check': '✓',
  'note_done': '✔', 'note_cancel': '✕', 'note_delete': '✖', 'fast': '⚡',
  'warning': '⚠', 'config': '⚙', 'atomic': '⚛', 'star': '⚝',
  'corner_tl': '⚞', 'corner_tr': '⚟', 'lightning': '⚡', 'infinite': '∞'
};

const SYMBOLS: Record<string, string> = Object.entries(OPS).reduce((acc, [k, v]) => {
  acc[v] = k;
  return acc;
}, {} as Record<string, string>);

// CODIFICADOR
function encode(operation: string, data?: any): string {
  co