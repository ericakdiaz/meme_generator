declare module "nspell" {
  interface Spellchecker {
    correct: (word: string) => boolean;
    suggest: (word: string) => string[];
  }
  function nspell(dictionary: any): Spellchecker;
  export default nspell;
}

declare module "dictionary-en" {
  interface Dictionary {
    aff: Buffer;
    dic: Buffer;
  }

  function dictionary(
    callback: (error: Error | null, dict: Dictionary) => void
  ): void;
  export default dictionary;
}
