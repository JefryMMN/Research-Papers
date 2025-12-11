
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';
import { Paper } from '../types';

interface ProductCardProps {
  product: Paper;
  onClick: (paper: Paper) => void;
  onUpvote: (id: string) => void;
  isUpvoted: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onClick, onUpvote, isUpvoted }) => {
  
  const handleUpvoteClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      onUpvote(product.id);
  };

  return (
    <div 
        className="group flex flex-col justify-between cursor-pointer border border-gray-200 hover:border-black hover:shadow-xl transition-all duration-300 bg-white p-10 h-full min-h-[480px] rounded-[3rem]" 
        onClick={() => onClick(product)}
    >
      <div className="flex flex-col">
        {/* Header: Category & Date */}
        <div className="flex justify-between items-start mb-6">
             <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 border border-gray-100 px-3 py-1 rounded-full">
                 {product.category}
             </span>
             <span className="text-xs font-mono text-gray-400">{product.publicationDate}</span>
        </div>

        {/* Title */}
        <h3 className="text-2xl font-serif font-medium text-black mb-4 leading-tight group-hover:underline decoration-1 underline-offset-4">
            {product.title}
        </h3>
        
        {/* Authors */}
        <p className="text-xs text-gray-500 font-medium mb-6 italic px-2">
            {product.authors.slice(0, 3).join(', ')} {product.authors.length > 3 && `+ ${product.authors.length - 3} others`}
        </p>
        
        <div className="w-full h-px bg-gray-100 mb-6 mx-2"></div>

        {/* Description Section */}
        <div className="mb-6 px-2">
            <h4 className="text-xs font-bold uppercase tracking-widest text-black mb-3 border-b border-gray-100 pb-1 inline-block">
                Description
            </h4>
            <p className="text-sm text-gray-600 line-clamp-4 leading-relaxed">
                {product.abstractPreview}
            </p>
        </div>

        {/* Impact Section */}
        <div className="px-2">
            <h4 className="text-xs font-bold uppercase tracking-widest text-black mb-3 border-b border-gray-100 pb-1 inline-block">
                Why This Matters
            </h4>
            <p className="text-sm text-gray-600 line-clamp-3 leading-relaxed italic">
                {product.whyMatters}
            </p>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="mt-8 pt-6 border-t border-gray-100 flex justify-between items-center px-2">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-black group-hover:text-gray-600 transition-colors">
            <span>Read Paper</span>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3" />
            </svg>
          </div>

          <button 
                onClick={handleUpvoteClick}
                className={`flex items-center gap-2 px-5 py-2.5 border rounded-full transition-all duration-200 whitespace-nowrap ${
                    isUpvoted 
                    ? 'bg-black text-white border-black' 
                    : 'bg-white text-black border-gray-200 hover:border-black'
                }`}
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill={isUpvoted ? "currentColor" : "none"} viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5L12 3m0 0l7.5 7.5M12 3v18" />
                </svg>
                <span className="text-xs font-bold">Upvotes: {product.upvotes}</span>
            </button>
      </div>
    </div>
  );
}

export default ProductCard;
