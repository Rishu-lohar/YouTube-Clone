const badWords = [
  "fuck",
  "shit",
  "bitch",
  "asshole",
];

export const containsBadWords = (text) => {
  return badWords.some((word) =>
    text.toLowerCase().includes(word)
  );
};

export const onlySpecialCharacters = (text) => {
  return /^[^a-zA-Z0-9]+$/.test(text.trim());
};       