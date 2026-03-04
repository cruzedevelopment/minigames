export type DigitChar = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9';
export const allDigits: DigitChar[] = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

export function generateSecretPin(length: number): DigitChar[] {
  const pool = [...allDigits];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, length);
}
