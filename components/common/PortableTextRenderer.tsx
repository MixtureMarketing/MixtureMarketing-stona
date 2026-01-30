import React from 'react';
import { PortableText, PortableTextComponents } from '@portabletext/react';
import Image from './Image';
import { urlFor } from '../../services/cmsService'; // I need to check if this exists or create it

import { SanityBody } from '../../types/sanity';

const components: PortableTextComponents = {
  types: {
    image: ({ value }) => {
      return (
        <figure className="my-10 overflow-hidden rounded-2xl border border-gray-100 shadow-sm">
          <Image
            src={urlFor(value).url()}
            alt={value.alt || 'Zdjęcie artykułu'}
            className="w-full h-auto object-cover"
            width={800}
            height={450}
          />
          {value.caption && (
            <figcaption className="p-4 bg-gray-50 text-xs text-gray-500 font-medium text-center italic border-t border-gray-100">
              {value.caption}
            </figcaption>
          )}
        </figure>
      );
    },
    code: ({ value }) => (
      <pre className="bg-dark text-white p-6 rounded-xl overflow-x-auto my-8 font-mono text-sm shadow-xl border border-white/10 custom-scrollbar">
        <code>{value.code}</code>
      </pre>
    ),
  },
  block: {
    h2: ({ children }) => <h2 className="text-3xl font-bold text-dark mt-16 mb-6">{children}</h2>,
    h3: ({ children }) => <h3 className="text-2xl font-bold text-dark mt-12 mb-4">{children}</h3>,
    normal: ({ children }) => (
      <p className="text-gray-700 leading-relaxed mb-6 text-lg">{children}</p>
    ),
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-primary pl-6 py-2 my-8 italic text-gray-600 text-xl bg-blue-50/30 rounded-r-xl">
        {children}
      </blockquote>
    ),
  },
  list: {
    bullet: ({ children }) => (
      <ul className="list-disc list-inside space-y-3 mb-8 ml-4">{children}</ul>
    ),
    number: ({ children }) => (
      <ol className="list-decimal list-inside space-y-3 mb-8 ml-4">{children}</ol>
    ),
  },
  listItem: {
    bullet: ({ children }) => <li className="text-gray-700 text-lg leading-relaxed">{children}</li>,
    number: ({ children }) => <li className="text-gray-700 text-lg leading-relaxed">{children}</li>,
  },
  marks: {
    strong: ({ children }) => <strong className="font-black text-dark">{children}</strong>,
    link: ({ children, value }) => {
      const rel = !value.href.startsWith('/') ? 'noreferrer noopener' : undefined;
      const target = !value.href.startsWith('/') ? '_blank' : undefined;
      return (
        <a
          href={value.href}
          rel={rel}
          target={target}
          className="text-primary font-bold underline decoration-primary/30 hover:decoration-primary transition-all"
        >
          {children}
        </a>
      );
    },
  },
};

interface PortableTextRendererProps {
  value: SanityBody;
}

const PortableTextRenderer: React.FC<PortableTextRendererProps> = ({ value }) => {
  return <PortableText value={value} components={components} />;
};

export default PortableTextRenderer;
