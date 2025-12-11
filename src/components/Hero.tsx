/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';
import InteractiveBackground from './InteractiveBackground';

const Hero: React.FC = () => {
  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    const element = document.getElementById(targetId);
    if (element) {
      const headerOffset = 85;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
    }
  };

  return (
    <section className="relative w-full h-[90vh] min-h-[600px] overflow-hidden bg-white text-black pt-20 flex flex-col justify-center">
      
      {/* Dynamic Interactive Layer */}
      <InteractiveBackground />

      {/* Content Overlay */}
      <div className="relative z-10 flex flex-col justify-center items-center text-center px-6">
        <div className="animate-fade-in-up max-w-5xl mx-auto pointer-events-none">
          <span className="block text-xs font-bold uppercase tracking-[0.2em] text-gray-500 mb-6 border border-gray-200 px-4 py-2 rounded-full mx-auto w-fit bg-white pointer-events-auto">
            Open Access Repository
          </span>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif font-medium text-black tracking-tight mb-8 pointer-events-auto">
            Discover Groundbreaking <br/> <span className="italic text-gray-500">Research Papers.</span>
          </h1>
          <p className="max-w-xl mx-auto text-lg md:text-xl text-gray-600 font-light leading-relaxed mb-12 pointer-events-auto">
            Connect with the ideas that shape our future. <br/>
            A curated, community-driven platform for scientific discovery.
          </p>
          
          <div className="flex gap-4 justify-center pointer-events-auto">
              <a 
                href="#products" 
                onClick={(e) => handleNavClick(e, 'products')}
                className="px-10 py-4 bg-black text-white text-sm font-semibold uppercase tracking-widest rounded-full hover:bg-gray-800 transition-all duration-300 shadow-xl"
              >
                Explore Papers
              </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;