/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';

interface UseTypewriterOptions {
  speed?: number;
  delay?: number;
  onComplete?: () => void;
}

export const useTypewriter = (text: string, options: UseTypewriterOptions = {}) => {
  const [displayText, setDisplayText] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const { speed = 60, delay = 0, onComplete } = options;

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;

    const startTyping = () => {
      if (displayText.length < text.length) {
        timeout = setTimeout(() => {
          setDisplayText(text.slice(0, displayText.length + 1));
        }, speed);
      } else {
        setIsComplete(true);
        if (onComplete) onComplete();
      }
    };

    const initialDelay = setTimeout(startTyping, displayText.length === 0 ? delay : 0);

    return () => {
      clearTimeout(timeout);
      clearTimeout(initialDelay);
    };
  }, [displayText, text, speed, delay, onComplete]);

  return { displayText, isComplete };
};
