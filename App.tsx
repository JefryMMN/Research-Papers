
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ProductGrid from './components/ProductGrid';
import ProductDetail from './components/ProductDetail';
import CartDrawer from './components/CartDrawer';
import Checkout from './components/Checkout';
import Footer from './components/Footer';
import Assistant from './components/Assistant';
import { initializeDatabase, saveUserPaper } from './constants';
import { Paper, ViewState } from './types';

const App: React.FC = () => {
  // --- State ---
  const [viewState, setViewState] = useState<ViewState>({ type: 'home' });
  const [papers, setPapers] = useState<Paper[]>([]);
  const [userUpvotes, setUserUpvotes] = useState<string[]>([]);
  const [readingList, setReadingList] = useState<Paper[]>([]);
  const [isReadingListOpen, setIsReadingListOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Submission Status State
  const [submissionSuccess, setSubmissionSuccess] = useState(false);

  // --- Initialization ---
  useEffect(() => {
    const initApp = async () => {
        // 1. Load Upvotes (Local per user)
        let loadedUpvotes: string[] = [];
        try {
            const result = await window.storage.get('nexus-user-upvotes');
            if (result && result.value) {
                loadedUpvotes = JSON.parse(result.value);
            }
        } catch (e) { console.error("Error loading upvotes:", e); }
        setUserUpvotes(loadedUpvotes);

        // 2. Load Library (Local per user)
        try {
            const result = await window.storage.get('nexus-library-items');
            if (result && result.value) {
                setReadingList(JSON.parse(result.value));
            }
        } catch (e) { console.error("Error loading library:", e); }

        // 3. Load Database (Shared + Static)
        // This uses the shared storage logic defined in constants.ts
        const dbPapers = await initializeDatabase();

        // 4. Sync Upvotes UI state
        // We inject the user's local upvote state into the in-memory paper list
        const syncedPapers = dbPapers.map(p => ({
            ...p,
            upvotes: (p.upvotes || 0) + (loadedUpvotes.includes(p.id) ? 1 : 0)
        }));

        setPapers(syncedPapers);
        setIsLoading(false);
    };

    // Use setTimeout to allow UI to paint "Loading" before heavy generation
    setTimeout(initApp, 50);
  }, []);

  // Persist Library changes
  useEffect(() => {
    if (!isLoading) {
        window.storage.set('nexus-library-items', JSON.stringify(readingList));
    }
  }, [readingList, isLoading]);

  // Persist Upvotes changes
  useEffect(() => {
    if (!isLoading) {
        window.storage.set('nexus-user-upvotes', JSON.stringify(userUpvotes));
    }
  }, [userUpvotes, isLoading]);

  // --- Actions ---

  const handleNavClick = (e: React.MouseEvent<HTMLElement>, targetId: string) => {
    e.preventDefault();
    if (targetId === 'submit') {
      setViewState({ type: 'submit' });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (targetId === '') {
        setViewState({ type: 'home' });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setViewState({ type: 'home' });
      setTimeout(() => {
        const element = document.getElementById(targetId);
        if (element) {
          const headerOffset = 85;
          const elementPosition = element.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.scrollY - headerOffset;
          window.scrollTo({ top: offsetPosition, behavior: "smooth" });
        }
      }, 100);
    }
  };

  const handlePaperClick = (paper: Paper) => {
    setViewState({ type: 'paper', paper });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToHome = () => {
    setViewState({ type: 'home' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAddToLibrary = (paper: Paper) => {
    if (!readingList.find(i => i.id === paper.id)) {
      setReadingList([...readingList, paper]);
    }
    setIsReadingListOpen(true);
  };

  const handleRemoveFromLibrary = (index: number) => {
    const newItems = [...readingList];
    newItems.splice(index, 1);
    setReadingList(newItems);
  };

  const handleUpvote = (paperId: string) => {
    const isAlreadyUpvoted = userUpvotes.includes(paperId);
    
    // Update local set of IDs user upvoted
    const newUpvoteIds = isAlreadyUpvoted 
        ? userUpvotes.filter(id => id !== paperId)
        : [...userUpvotes, paperId];
    
    setUserUpvotes(newUpvoteIds);

    // Update derived UI count instantly
    setPapers(prevPapers => {
        return prevPapers.map(p => {
            if (p.id === paperId) {
                return {
                    ...p,
                    upvotes: isAlreadyUpvoted ? Math.max(0, p.upvotes - 1) : p.upvotes + 1
                };
            }
            return p;
        });
    });
  };

  const handlePaperSubmit = async (newPaper: Paper) => {
      // 1. Persist to Shared Storage using the function from constants.ts
      // This ensures the paper is saved with shared: true visibility
      await saveUserPaper(newPaper);

      // 2. Reload Database from shared storage to ensure we have the latest data
      const allPapers = await initializeDatabase();

      // 3. Re-apply user upvotes to the fresh list so UI state persists
      const syncedPapers = allPapers.map(p => ({
            ...p,
            upvotes: (p.upvotes || 0) + (userUpvotes.includes(p.id) ? 1 : 0)
      }));
      setPapers(syncedPapers);

      // 4. Show simple success feedback
      setSubmissionSuccess(true);
      setViewState({ type: 'home' });

      // Hide toast after 4 seconds
      setTimeout(() => setSubmissionSuccess(false), 4000);
      
      setTimeout(() => {
          const element = document.getElementById('products');
          if (element) {
             element.scrollIntoView({ behavior: 'smooth' });
          }
      }, 100);
  };

  return (
    <div className="bg-white min-h-screen relative selection:bg-black selection:text-white">
      {/* Loading Overlay */}
      {isLoading && (
         <div className="fixed inset-0 bg-white z-[10000] flex flex-col items-center justify-center">
            <div className="w-12 h-12 border-2 border-gray-100 border-t-black rounded-full animate-spin mb-4"></div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-black animate-pulse">Initializing Nexus...</p>
         </div>
      )}

      {/* Success Toast */}
      <div className={`fixed top-24 left-1/2 -translate-x-1/2 z-[10000] transition-all duration-500 transform ${submissionSuccess ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0 pointer-events-none'}`}>
        <div className="bg-black text-white px-8 py-4 rounded-full shadow-2xl flex items-center gap-3">
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-green-400">
               <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
             </svg>
             <span className="text-sm font-bold tracking-wide">Paper Submitted Successfully!</span>
        </div>
      </div>

      <Navbar 
        onNavClick={handleNavClick} 
        cartCount={readingList.length}
        onOpenCart={() => setIsReadingListOpen(true)}
      />
      
      <CartDrawer 
        isOpen={isReadingListOpen} 
        onClose={() => setIsReadingListOpen(false)}
        items={readingList}
        onRemoveItem={handleRemoveFromLibrary}
        onItemClick={handlePaperClick}
      />
      
      {/* AI Assistant */}
      <Assistant papers={papers} />

      <main>
        {viewState.type === 'home' && (
          <>
            <Hero />
            <ProductGrid 
                papers={papers} 
                onProductClick={handlePaperClick}
                onUpvote={handleUpvote}
                userUpvotes={userUpvotes}
            />
          </>
        )}
        
        {viewState.type === 'submit' && (
           <Checkout 
             onBack={handleBackToHome}
             onSubmit={handlePaperSubmit}
           />
        )}

        {viewState.type === 'paper' && viewState.paper && (
          <ProductDetail 
            product={viewState.paper} 
            onBack={handleBackToHome}
            onAddToCart={handleAddToLibrary}
          />
        )}
      </main>

      <Footer onLinkClick={handleNavClick} />
    </div>
  );
};

export default App;
