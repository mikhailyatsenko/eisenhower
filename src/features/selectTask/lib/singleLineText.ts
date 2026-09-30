/** A task's text is one line: a line break, pasted or typed, becomes a space */
export const singleLineText = (text: string) => text.replace(/[\r\n]+/g, ' ');
