import React from 'react';

interface LinkifyProps {
  text: string;
}

export const Linkify: React.FC<LinkifyProps> = ({ text }) => {
  // Regex to match URLs starting with http:// or https://
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = text.split(urlRegex);

  return (
    <>
      {parts.map((part, i) => {
        if (part.match(urlRegex)) {
          return (
            <a
              key={i}
              href={part}
              target="_blank"
              rel="noopener noreferrer"
              className="break-all text-blue-600 underline hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
              onClick={(e) => e.stopPropagation()}
              data-no-dnd="true"
            >
              {part}
            </a>
          );
        }
        return part;
      })}
    </>
  );
};
