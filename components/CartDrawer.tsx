/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';
import { Paper } from '../types';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: Paper[];
  onRemoveItem: (index: number) => void;
  onItemClick: (paper: Paper) => void;
}

const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose, items, onRemoveItem, onItemClick }) => {
  
  const handleExportCitations = () => {
    if (items.length === 0) return;

    const bibtex = items.map(paper => {
      // Create a professional BibTeX key
      const surname = paper.authors[0].split(' ').pop()?.replace(/[^a-zA-Z]/g, '').toLowerCase() || 'author';
      const citeKey = `${surname}${paper.publicationDate}`;
      
      // Handle arXiv formatting properly
      const isArxiv = /^\d{4}\.\d{4,5}/.test(paper.doi) || paper.doi.toLowerCase().includes('arxiv');
      
      let entry = `@article{${citeKey},\n`;
      entry += `  title={${paper.title}},\n`;
      entry += `  author={${paper.authors.join(' and ')}},\n`;
      entry += `  year={${paper.publicationDate}},\n`;
      entry += `  journal={${isArxiv ? 'arXiv Preprint' : 'Nexus Research Repository'}},\n`;
      
      if (isArxiv) {
        entry += `  eprint={${paper.doi.replace(/arXiv:/i, '')}},\n`;
        entry += `  archivePrefix={arXiv},\n`;
        entry += `  url={https://arxiv.org/abs/${paper.doi.replace(/arXiv:/i, '')}}\n`;
      } else {
        entry += `  url={https://doi.org/${paper.doi}}\n`;
      }
      
      entry += `}`;
      return entry;
    }).join('\n\n');

    const blob = new Blob([bibtex], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'citations.bib';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/20 backdrop-blur-sm z-[10000] transition-opacity duration-500 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div 
        className={`fixed inset-y-0 right-0 w-full md:w-[450px] bg-white z-[10001] shadow-2xl transform transition-transform duration-500 ease-in-out border-l border-gray-100 flex flex-col ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
             <button 
                onClick={onClose}
                className="p-2 hover:bg-gray-50 rounded-full transition-colors group"
                aria-label="Back to Repository"
             >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 group-hover:-translate-x-1 transition-transform">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
             </button>
             <h2 className="text-xl font-serif text-black">Library ({items.length})</h2>
          </div>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-black transition-colors p-2 hidden sm:block"
            aria-label="Close library"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
              <div className="p-8 bg-gray-50 rounded-full mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-12 h-12 text-gray-300">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                </svg>
              </div>
              <p className="font-light text-gray-500">Your research library is empty.</p>
              <button 
                onClick={onClose}
                className="text-xs font-bold uppercase tracking-widest text-black underline underline-offset-8 decoration-1"
              >
                Browse Repository
              </button>
            </div>
          ) : (
            items.map((item, idx) => (
              <div 
                key={`${item.id}-${idx}`} 
                onClick={() => { onItemClick(item); onClose(); }}
                className="flex flex-col gap-2 p-6 border border-gray-100 rounded-xl hover:border-black cursor-pointer transition-all animate-fade-in-up group bg-white hover:shadow-lg"
              >
                <div className="flex justify-between items-start">
                    <h3 className="font-serif text-black leading-tight text-base mb-1 font-bold group-hover:underline transition-all">{item.title}</h3>
                    <button 
                        onClick={(e) => { e.stopPropagation(); onRemoveItem(idx); }}
                        className="text-gray-400 hover:text-red-600 transition-colors ml-4 p-1 rounded-full hover:bg-red-50"
                        aria-label="Remove from list"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                            <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                        </svg>
                    </button>
                </div>
                <p className="text-sm text-gray-500 italic">{item.authors[0]} et al. ({item.publicationDate})</p>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-8 border-t border-gray-100 bg-gray-50 flex flex-col gap-4">
          <button 
             onClick={handleExportCitations}
             disabled={items.length === 0}
             className="w-full py-5 bg-black text-white uppercase tracking-widest text-xs font-bold rounded-full hover:bg-gray-800 transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
             Export BibTeX
          </button>
          <button 
             onClick={onClose}
             className="w-full py-5 border border-black text-black uppercase tracking-widest text-xs font-bold rounded-full hover:bg-black hover:text-white transition-colors"
          >
             Close Library
          </button>
        </div>
      </div>
    </>
  );
};

// @fix: Add default export statement.
export default CartDrawer;