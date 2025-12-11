/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/


import React from 'react';

const About: React.FC = () => {
  return (
    <section id="about" className="bg-white border-t border-gray-100">
      
      {/* Introduction */}
      <div className="py-24 px-6 md:px-12 max-w-[1200px] mx-auto flex flex-col items-center text-center">
        <h2 className="text-4xl md:text-5xl font-serif text-black leading-tight mb-8">
            Democratizing <br/> Human Knowledge.
        </h2>
        
        <div className="max-w-2xl text-lg md:text-xl text-gray-600 font-light leading-relaxed space-y-8">
            <p>
            Nexus was built on a fundamental truth: science belongs to everyone. In an era of paywalls and fragmented databases, we provide a unified, clean interface to discover the research that shapes our world.
            </p>
            <p>
            We believe that complex ideas deserve elegant presentation. By removing the noise, we let the data speak, connecting researchers, students, and the curious mind to the source of truth.
            </p>
        </div>
      </div>

      {/* Philosophy Blocks - No Images, Just Typography */}
      <div className="grid grid-cols-1 md:grid-cols-2 border-t border-gray-100">
        <div className="flex flex-col justify-center p-12 lg:p-24 bg-gray-50 border-b md:border-b-0 md:border-r border-gray-100">
           <span className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400 mb-6">Curation</span>
           <h3 className="text-3xl font-serif mb-6 text-black leading-tight">
             Signal over noise.
           </h3>
           <p className="text-gray-600 font-light leading-relaxed max-w-sm">
             With millions of papers published annually, finding relevance is the challenge. Our community-driven upvoting ensures the most impactful work rises to the top.
           </p>
        </div>
        <div className="flex flex-col justify-center p-12 lg:p-24 bg-white">
           <span className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400 mb-6">Access</span>
           <h3 className="text-3xl font-serif mb-6 text-black leading-tight">
             Open by default.
           </h3>
           <p className="text-gray-600 font-light leading-relaxed max-w-sm">
             We prioritize Open Access journals and preprints, ensuring that knowledge is not locked behind gates but free for the world to use and build upon.
           </p>
        </div>
      </div>
    </section>
  );
};

export default About;