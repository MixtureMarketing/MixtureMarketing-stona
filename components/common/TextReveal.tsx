import React, { useEffect, useRef, useState } from 'react';

interface TextRevealProps {
  children: string | React.ReactNode;
  className?: string;
  delay?: number; // Initial delay before animation starts in ms
  stagger?: number; // Delay between each word in ms
}

const TextReveal: React.FC<TextRevealProps> = ({
  children,
  className = '',
  delay = 0,
  stagger = 50,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px',
      },
    );

    const currentRef = ref.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, []);

  // If children is not a string, render it as is inside the reveal container logic
  // but strictly speaking this component is designed for string splitting.
  // We'll process strings primarily.
  const processText = (text: string) => {
    return text.split(' ').map((word, i) => (
      <span
        key={i}
        className="inline-block overflow-hidden align-bottom"
        style={{ marginRight: '0.25em' }} // Gap between words
      >
        <span
          className={`reveal-text-item block`}
          style={{
            animationDelay: isVisible ? `${delay + i * stagger}ms` : '999s',
            animationPlayState: isVisible ? 'running' : 'paused',
          }}
        >
          {word}
        </span>
      </span>
    ));
  };

  // Handle nested React Nodes recursively or just flatten simple strings
  const content = typeof children === 'string' ? processText(children) : children;

  return (
    <span ref={ref} className={`${className} inline-block leading-tight`}>
      {content}
    </span>
  );
};

export default TextReveal;
