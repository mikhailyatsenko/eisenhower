/**
 * The Latin letter of a key press, lower case. On a Latin layout it comes
 * from the key itself; on others, like Cyrillic, from the physical key.
 */
export const keyLetter = ({ key, code }: KeyboardEvent) =>
  /^[a-z]$/i.test(key)
    ? key.toLowerCase()
    : (/^Key([A-Z])$/.exec(code)?.[1].toLowerCase() ?? null);
