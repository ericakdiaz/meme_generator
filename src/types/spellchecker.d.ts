declare module "spellchecker" {
  export default class SpellChecker {
    static checkSpelling(text: string): Array<{ start: number; end: number }>;
    static getCorrectionsForMisspelling(word: string): string[];
    static isMisspelled(word: string): boolean;
    static getAvailableDictionaries(): string[];
  }
}
