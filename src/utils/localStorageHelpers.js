// Create or Update
export const setItem = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};

// Read
export const getItem = (key) => {
  const value = localStorage.getItem(key);
  return value ? JSON.parse(value) : null;
};

// Delete
export const removeItem = (key) => {
  localStorage.removeItem(key);
};

// Clear all
export const clear = () => {
  localStorage.clear();
};
