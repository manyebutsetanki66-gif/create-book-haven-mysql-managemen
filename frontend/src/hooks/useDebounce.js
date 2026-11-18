/*
 * useDebounce - returns the value only after the user stops typing for a moment,
 * so we do not send a request to the server for every single key press.
 */
import { useState, useEffect } from 'react';

export default function useDebounce(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer); // cleanup: cancel the old timer when the value changes
  }, [value, delay]);
  return debounced;
}
