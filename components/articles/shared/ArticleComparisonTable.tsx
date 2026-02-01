import React from 'react';
import SectionHeader from '../../common/SectionHeader';

interface ComparisonRow {
  [key: string]: string | React.ReactNode;
}

interface ArticleComparisonTableProps {
  title: string;
  subtitle?: string;
  headers: string[];
  rows: ComparisonRow[];
  highlightCol?: number;
}

const ArticleComparisonTable: React.FC<ArticleComparisonTableProps> = ({
  title,
  subtitle,
  headers,
  rows,
}) => {
  return (
    <div className="my-24">
      <SectionHeader title={title} subtitle={subtitle} align="left" />
      <div className="overflow-x-auto rounded-3xl border border-gray-200 shadow-2xl mt-10 not-prose">
        <table className="w-full text-left bg-white border-collapse">
          <thead className="bg-[#0F172A] text-white">
            <tr>
              {headers.map((header, i) => (
                <th
                  key={i}
                  className={`p-6 text-xs font-black uppercase tracking-widest ${
                    i === 0 ? 'opacity-70' : 'text-primary'
                  }`}
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {rows.map((row, i) => {
              const values = Object.values(row);
              return (
                <tr key={i} className="hover:bg-gray-50 transition-colors">
                  {values.map((val, j) => (
                    <td
                      key={j}
                      className={`p-6 ${
                        j === 0
                          ? 'font-bold text-dark bg-gray-50/30'
                          : j === 1
                            ? 'bg-primary/5 font-bold'
                            : 'text-gray-600'
                      }`}
                    >
                      {val}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ArticleComparisonTable;
