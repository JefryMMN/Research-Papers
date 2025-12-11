/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/


import React from 'react';
import { JournalArticle } from '../types';

interface JournalDetailProps {
  article: JournalArticle;
  onBack: () => void;
}

const JournalDetail: React.FC<JournalDetailProps> = ({ article, onBack }) => {
  return (
    <div className="min-h-screen bg-white animate-fade-in-up pt-24">
       <div className="max-w-3xl mx-auto px-6 md:px-12 pb-32">
          
             <div className="flex justify-between items-center mb-16 border-b border-gray-200 pb-8">
                <button 
                  onClick={onBack}
                  className="group flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-black transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 group-hover:-translate-x-1 transition-transform">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                  </svg>
                  Back to Insights
                </button>
                <span className="text-xs font-bold uppercase tracking-widest text-gray-400">{article.date}</span>
             </div>

             <h1 className="text-4xl md:text-6xl font-serif text-black mb-12 leading-tight text-center">
               {article.title}
             </h1>

             <div className="prose prose-stone prose-lg mx-auto font-light leading-loose text-gray-700">
               {article.content}
             </div>
             
             <div className="mt-16 pt-12 border-t border-gray-200 flex justify-center">
                 <span className="text-2xl font-serif italic text-black">Nexus</span>
             </div>
       </div>
    </div>
  );
};

export default JournalDetail;