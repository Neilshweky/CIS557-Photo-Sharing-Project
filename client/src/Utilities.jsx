function dateDiff(date) {
  const diffTime = Math.abs(new Date() - date);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

const { localStorage } = window;

async function asyncForEach(array, callback) {
  const promises = [];
  for (let index = 0; index < array.length; index += 1) {
    promises.push(callback(array[index], index, array));
  }
  await Promise.all(promises);
}

export {
  dateDiff, localStorage, asyncForEach,
};
