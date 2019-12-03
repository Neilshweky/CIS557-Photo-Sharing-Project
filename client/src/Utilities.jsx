function dateDiff(date) {
  const diffTime = Math.abs(new Date() - date);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

const API_URL = process.env.API_URL || 'http://localhost:8080';
console.log('HERE I AM LOOK OVER HERE PLZ', API_URL);
export { dateDiff, API_URL };
