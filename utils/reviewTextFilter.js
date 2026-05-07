const SENSITIVE_WORDS = [
  '傻逼',
  '垃圾',
  '诈骗',
  '骗子',
  '滚蛋',
  '死全家'
];

function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function maskWord(word) {
  if (word.length <= 1) return '*';
  return '*'.repeat(word.length);
}

function filterSensitiveWords(text) {
  const src = String(text || '').trim();
  if (!src) return { cleanText: '', hitWords: [] };

  let cleanText = src;
  const hitWords = [];

  SENSITIVE_WORDS.forEach((word) => {
    const reg = new RegExp(escapeRegExp(word), 'gi');
    if (reg.test(cleanText)) {
      hitWords.push(word);
      cleanText = cleanText.replace(reg, maskWord(word));
    }
  });

  return {
    cleanText,
    hitWords: [...new Set(hitWords)]
  };
}

module.exports = {
  filterSensitiveWords
};
