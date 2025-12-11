

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useEffect } from 'react';
import { BRAND_NAME } from '../constants';

interface NavbarProps {
  onNavClick: (e: React.MouseEvent<HTMLElement>, targetId: string) => void;
  cartCount: number;
  onOpenCart: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onNavClick, cartCount, onOpenCart }) => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLinkClick = (e: React.MouseEvent<HTMLElement>, targetId: string) => {
    onNavClick(e, targetId);
  };

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-[9999] transition-all duration-500 ease-in-out px-4 md:px-8 flex items-center justify-between ${
        scrolled 
          ? 'bg-white/98 backdrop-blur-lg py-3 border-b border-gray-100 shadow-sm' 
          : 'bg-white py-5 border-b border-transparent'
      }`}
    >
      {/* Branding */}
      <a 
        href="#" 
        onClick={(e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
            onNavClick(e, ''); 
        }}
        className="text-xl md:text-3xl font-serif font-bold tracking-tight text-black flex-shrink-0"
      >
        {BRAND_NAME}
      </a>
      
      {/* Action Buttons */}
      <div className="flex items-center gap-2 md:gap-6">
        <button
           onClick={(e) => handleLinkClick(e, 'submit')}
           className="flex items-center gap-2 text-[10px] md:text-sm font-bold bg-black text-white px-3 py-2 md:px-8 md:py-3 rounded-full hover:bg-gray-800 transition-all shadow-md whitespace-nowrap"
        >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3 h-3 md:w-4 md:h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            <span className="hidden xs:inline">Submit Paper</span>
            <span className="xs:hidden">Submit</span>
        </button>

        <button 
          onClick={(e) => { e.preventDefault(); onOpenCart(); }}
          className="flex items-center gap-1 md:gap-2 text-[10px] md:text-sm font-bold bg-white border border-black text-black px-3 py-2 md:px-6 md:py-3 rounded-full hover:bg-black hover:text-white transition-all shadow-sm whitespace-nowrap"
        >
          <span className="hidden xs:inline">Library</span>
          <span className="xs:hidden">Library</span>
          <span>({cartCount})</span>
        </button>
      </div>
    </nav>
  );
};

export default Navbar;