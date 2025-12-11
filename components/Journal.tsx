
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/


import React from 'react';
import { JOURNAL_ARTICLES } from '../constants';
import { JournalArticle } from '../types';

interface JournalProps {
  onArticleClick: (article: JournalArticle) => void;
}

const Journal: React.FC<JournalProps> = ({ onArticleClick }) => {
  return (
    <section id="journal" className="bg-white py-32 px-6 md:px-12 border-t border-gray-100">
      <div className="max-w-[1800px] mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-20 pb-8 border-b border-black">
            <div>
                <span className="block text-xs font-bold uppercase tracking-[0.2em] text-gray-400 mb-4">Editorial</span>
                <h2 className="text-4xl md:text-6xl font-serif text-black">Research Insights</h2>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {JOURNAL_ARTICLES.map((article) => (
                <div key={article.id} className="group cursor-pointer flex flex-col text-left p-6 border border-gray-100 hover:border-black transition-colors" onClick={() => onArticleClick(article)}>
                    <div className="flex flex-col flex-1 text-left">
                        <span className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">{article.date}</span>
                        <h3 className="text-2xl font-serif text-black mb-4 leading-tight group-hover:underline decoration-1 underline-offset-4">{article.title}</h3>
                        <p className="text-gray-600 font-light leading-relaxed">{article.excerpt}</p>
                        
                        <div className="mt-8 text-xs font-bold uppercase tracking-widest text-black underline underline-offset-4 decoration-1">Read Article</div>
                    </div>
                </div>
            ))}
        </div>
      </div>
    </section>
  );
};

export default Journal;