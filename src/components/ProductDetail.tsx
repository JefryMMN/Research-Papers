
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';
import { Paper } from '../types';

interface ProductDetailProps {
  product: Paper;
  onBack: () => void;
  onAddToCart: (paper: Paper) => void;
}

const ProductDetail: React.FC<ProductDetailProps> = ({ product, onBack, onAddToCart }) => {
  
  // Helper to split text by double newlines and render as paragraphs
  const renderParagraphs = (text: string, className: string = "") => {
    return text.split(/\n\n+/).map((para, index) => (
      <p key={index} className={`${className} mb-6 last:mb-0`}>
        {para.trim()}
      </p>
    ));
  };

  return (
    <div className="min-h-screen bg-white animate-fade-in-up pt-24 pb-24">
      <div className="max-w-[1000px] mx-auto px-6 md:px-12">
        {/* Navigation */}
        <div className="mb-12">
           <button 
              onClick={onBack}
              className="group flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-black transition-colors"
           >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 group-hover:-translate-x-1 transition-transform">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
              Back to Repository
           </button>
        </div>

        {/* Header */}
        <div className="mb-12 border-b border-gray-100 pb-12">
              <div className="flex flex-wrap gap-4 items-center mb-6">
                <span className="inline-block border border-black px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-black">
                    {product.category}
                </span>
                <span className="text-sm text-gray-500 font-mono">
                    {product.publicationDate}
                </span>
              </div>
              
              <h1 className="text-4xl md:text-6xl font-serif text-black mb-8 leading-tight">
                {product.title}
              </h1>
              
              <div className="flex flex-col gap-1 mb-8">
                  <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Authors</span>
                  <p className="text-lg text-black font-light">
                    {product.authors.join(', ')}
                  </p>
              </div>

              <div className="flex gap-4">
                 <button 
                   onClick={() => onAddToCart(product)}
                   className="px-10 py-4 bg-black text-white text-xs font-bold uppercase tracking-widest rounded-full hover:bg-gray-800 transition-colors shadow-lg flex items-center gap-2"
                 >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    Save to Library
                 </button>
                 <div className="flex items-center gap-2 px-6 py-4 border border-gray-200 rounded-full bg-white text-black whitespace-nowrap">
                    <span className="text-xs font-bold uppercase tracking-widest">Upvotes: {product.upvotes}</span>
                 </div>
              </div>
        </div>

        {/* Text Content */}
        <div className="prose prose-lg max-w-none text-gray-800 font-serif leading-loose">
            <h3 className="font-sans text-xs font-bold uppercase tracking-widest text-black mb-6 border-b border-gray-100 pb-2 inline-block">Description</h3>
            <div className="mb-12 text-lg font-light text-gray-600">
                {renderParagraphs(product.abstract)}
            </div>

            <h3 className="font-sans text-xs font-bold uppercase tracking-widest text-black mb-6 border-b border-gray-100 pb-2 inline-block">Why This Matters</h3>
            <div className="mb-8 text-lg font-light text-gray-600">
                {renderParagraphs(product.whyMatters)}
            </div>
            
            <div className="p-8 bg-gray-50 border-l-2 border-black my-12 font-sans text-sm text-gray-600">
                <p className="mb-2 font-bold text-black uppercase tracking-widest text-xs">Citation Metadata</p>
                <p><span className="font-bold">DOI:</span> {product.doi}</p>
                <p><span className="font-bold">Publication Date:</span> {product.publicationDate}</p>
                <p><span className="font-bold">Primary Category:</span> {product.category}</p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
