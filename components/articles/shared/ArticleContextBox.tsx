import React from 'react';
import { LucideIcon, ArrowRight } from 'lucide-react';

interface ArticleContextBoxProps {
  icon: LucideIcon;
  text: string;
  linkUrl?: string;
  linkText?: string;
  children?: React.ReactNode;
}

const ArticleContextBox: React.FC<ArticleContextBoxProps> = ({
  icon: Icon,
  text,
  linkUrl,
  linkText,
  children,
}) => {
  return (
    <div className="mb-12 p-4 bg-blue-50 border border-blue-100 rounded-xl flex items-start gap-4 not-prose">
      <Icon className="text-secondary mt-1 shrink-0" size={20} />
      <div>
        <div
          className="text-sm text-secondary m-0 font-medium"
          dangerouslySetInnerHTML={{ __html: text }}
        />
        {linkUrl && linkText && (
          <a
            href={linkUrl}
            className="text-sm text-primary hover:text-secondary font-bold mt-1 inline-flex items-center gap-1"
          >
            {linkText} <ArrowRight size={14} />
          </a>
        )}
        {children}
      </div>
    </div>
  );
};

export default ArticleContextBox;
