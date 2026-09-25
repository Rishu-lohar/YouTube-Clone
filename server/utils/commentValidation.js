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
  return /^[^\p{L}\p{N}]+$/u.test(text.trim());
};

export const hasRepeatedSpecialCharacters = (text) => {
  return /([^\p{L}\p{N}\s])\1{3,}/u.test(text);
};