export type KeyGlyph = 'Q' | 'W' | 'E' | 'R' | 'A' | 'S' | 'D';
export type KeyOutcome = 'done' | 'fail' | '';

export const availableGlyphs: KeyGlyph[] = ['Q', 'W', 'E', 'R', 'A', 'S', 'D'];

export const randomGlyph = (): KeyGlyph =>
  availableGlyphs[Math.floor(Math.random() * availableGlyphs.length)];
