
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useMemo, useEffect } from 'react';
import { Paper } from '../types';
import ProductCard from './ProductCard';

const DEFAULT_CATEGORIES = [
  'All', 
  'Machine Learning', 
  'Artificial Intelligence', 
  'Natural Language Processing', 
  'Distributed Systems', 
  'Cyber Security', 
  'Physics', 
  'Biology', 
  'Mathematics', 
  'Information Theory',
  'Social Science'
];

interface ProductGridProps {
  papers: Paper[];
  onProductClick: (paper: Paper) => void;
  onUpvote: (id: string) => void;
  userUpvotes: string[];
}

type SortOption = 'upvotes' | 'latest';

const ProductGrid: React.FC<ProductGridProps> = ({ papers, onProductClick, onUpvote, userUpvotes }) => {
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [displayCount, setDisplayCount] = useState(20);
  const [sortOption, setSortOption] = useState<SortOption>('upvotes');

  // Dynamic Categories: Merge default with any custom categories from papers
  const categories = useMemo(() => {
    const existingCategories = new Set(papers.map(p => p.category));
    // Merge defaults with existing, using Set to remove duplicates
    const merged = Array.from(new Set([...DEFAULT_CATEGORIES, ...Array.from(existingCategories)]));
    return merged.sort((a: string, b: string) => {
        if (a === 'All') return -1;
        if (b === 'All') return 1;
        return a.localeCompare(b);
    });
  }, [papers]);

  const processedPapers = useMemo(() => {
    let result = [...papers];
    
    // 1. Filter by Category
    if (activeCategory !== 'All') {
      result = result.filter(p => p.category === activeCategory);
    }
    
    // 2. Filter by Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p => 
        p.title.toLowerCase().includes(q) || 
        p.authors.some(a => a.toLowerCase().includes(q)) ||
        p.abstract.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.whyMatters.toLowerCase().includes(q)
      );
    }

    // 3. Sort
    result.sort((a, b) => {
        if (sortOption === 'upvotes') {
             // PRIORITY 1: Upvotes (Desc)
             const votesDiff = (b.upvotes || 0) - (a.upvotes || 0);
             if (votesDiff !== 0) return votesDiff;
             
             // PRIORITY 2: ID (Stability)
             return a.id.localeCompare(b.id);
        } else { // latest
             // PRIORITY 0: User Submissions (sub-*)
             const isSubA = a.id.startsWith('sub-');
             const isSubB = b.id.startsWith('sub-');
             if (isSubA && !isSubB) return -1;
             if (!isSubA && isSubB) return 1;

             // PRIORITY 1: Real Papers vs Generated
             // Real papers do not start with 'gen-'
             const isGenA = a.id.startsWith('gen-');
             const isGenB = b.id.startsWith('gen-');
             if (!isGenA && isGenB) return -1;
             if (isGenA && !isGenB) return 1;

             // PRIORITY 2: Timestamp (Desc)
             const timeDiff = (b.timestamp || 0) - (a.timestamp || 0);
             if (timeDiff !== 0) return timeDiff;
             
             return a.id.localeCompare(b.id);
        }
    });

    return result;
  }, [activeCategory, searchQuery, sortOption, papers]);

  useEffect(() => {
      setDisplayCount(20);
  }, [activeCategory, searchQuery, sortOption]);

  const handleLoadMore = () => {
      setDisplayCount(prev => prev + 20);
  };

  const visiblePapers = processedPapers.slice(0, displayCount);

  return (
    <section id="products" className="py-24 px-6 md:px-12 bg-white">
      <div className="max-w-[1800px] mx-auto">
        
        {/* Header Area */}
        <div className="flex flex-col items-center text-center mb-16 space-y-8">
          <h2 className="text-4xl md:text-5xl font-serif text-black tracking-tight">
            {sortOption === 'upvotes' ? 'Most Upvoted Research' : 'Latest Papers'}
          </h2>
          
          <div className="flex flex-col items-center gap-6 w-full">
            
            {/* Sort Toggle */}
            <div className="flex bg-gray-50 p-1 rounded-full border border-gray-100">
                <button
                    onClick={() => setSortOption('upvotes')}
                    className={`px-6 py-3 text-[10px] uppercase font-bold tracking-widest rounded-full transition-all ${
                        sortOption === 'upvotes' ? 'bg-black text-white shadow-md' : 'text-gray-400 hover:text-black'
                    }`}
                >
                    Most Upvoted
                </button>
                <button
                    onClick={() => setSortOption('latest')}
                    className={`px-6 py-3 text-[10px] uppercase font-bold tracking-widest rounded-full transition-all ${
                        sortOption === 'latest' ? 'bg-black text-white shadow-md' : 'text-gray-400 hover:text-black'
                    }`}
                >
                    Latest
                </button>
            </div>

            {/* Categories */}
            <div className="flex flex-wrap justify-center gap-4 w-full max-w-5xl">
                {categories.map(cat => (
                <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`text-[10px] uppercase tracking-widest font-bold px-6 py-2 transition-all duration-300 rounded-full border border-gray-100 ${
                    activeCategory === cat 
                        ? 'bg-black text-white shadow-lg border-black' 
                        : 'text-gray-400 border border-gray-100 hover:border-black hover:text-black'
                    }`}
                >
                    {cat}
                </button>
                ))}
            </div>

            {/* Search */}
            <div className="w-full max-w-2xl relative pt-4 border-t border-gray-100">
                <input 
                type="text" 
                placeholder="Search by title, author, or keywords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-full px-8 py-4 text-black outline-none focus:border-black transition-all shadow-sm placeholder:text-gray-400"
                />
            </div>
            
            <p className="text-gray-500 font-light text-xs mt-2">
                Showing {visiblePapers.length} of {processedPapers.length} papers
            </p>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {visiblePapers.length > 0 ? (
            visiblePapers.map(paper => (
              <ProductCard 
                  key={paper.id} 
                  product={paper} 
                  onClick={onProductClick}
                  onUpvote={onUpvote}
                  isUpvoted={userUpvotes.includes(paper.id)}
              />
            ))
          ) : (
            <div className="col-span-full py-20 text-center">
              <p className="text-gray-400 italic">No papers matched your search.</p>
            </div>
          )}
        </div>

        {/* Load More */}
        {visiblePapers.length < processedPapers.length && (
            <div className="flex justify-center mt-20">
                <button 
                    onClick={handleLoadMore}
                    className="px-10 py-4 bg-black text-white rounded-full uppercase tracking-widest text-sm font-bold hover:bg-gray-800 transition-colors shadow-lg flex items-center gap-2"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                    </svg>
                    Load More Papers
                </button>
            </div>
        )}
      </div>
    </section>
  );
};

export default ProductGrid;
