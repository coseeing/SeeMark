const sum = (a, b) => {
  // throw an error if inputs are not numbers
  if (typeof a !== 'number' || typeof b !== 'number') {
    throw new TypeError('Both arguments must be numbers');
  }
  return a + b;
};

export default sum;
