function dateDiff(date) {
  const diffTime = Math.abs(new Date() - date);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

export default dateDiff;
