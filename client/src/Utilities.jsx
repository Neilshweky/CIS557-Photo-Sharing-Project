function dateDiff(date) {
  const diffTime = Math.abs(new Date() - date);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

const API_URL = process.env.API_URL || 'http://localhost:8080';

export { dateDiff, API_URL };
