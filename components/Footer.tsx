
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/


import React, { useState } from 'react';

interface FooterProps {
  onLinkClick: (e: React.MouseEvent<HTMLElement>, targetId: string) => void;
}

const Footer: React.FC<FooterProps> = ({ onLinkClick }) => {
  const [subscribeStatus, setSubscribeStatus] = useState<'idle' | 'loading' | 'success'>('idle');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const validateEmail = (email: string) => {
    // Robust email regex pattern
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return regex.test(email);
  };

  const handleSubscribe = () => {
    if (!email) {
        setError('Email is required.');
        return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    setSubscribeStatus('loading');
    setError('');
    
    setTimeout(() => {
      setSubscribeStatus('success');
      setEmail('');
    }, 1500);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (error) setError('');
  };

  return (
    <footer className="bg-gray-50 pt-24 pb-12 px-6 text-gray-600 border-t border-gray-100">
      <div className="max-w-[1800px] mx-auto grid grid-cols-1 md:grid-cols-12 gap-12">
        
        <div className="md:col-span-4">
          <h4 className="text-2xl font-serif text-black mb-6">Nexus</h4>
          <p className="max-w-xs font-light leading-relaxed">
            Accelerating discovery through open access. 
            Connect, cite, and create.
          </p>
        </div>

        <div className="md:col-span-4">
          <h4 className="font-bold text-black mb-6 tracking-widest text-xs uppercase">Platform</h4>
          <ul className="space-y-4 font-light text-sm">
            <li><a href="#products" onClick={(e) => onLinkClick(e, 'products')} className="hover:text-black transition-colors underline-offset-4 hover:underline">Browse Papers</a></li>
            <li><a href="#products" onClick={(e) => onLinkClick(e, 'products')} className="hover:text-black transition-colors underline-offset-4 hover:underline">Categories</a></li>
            <li><a href="#submit" onClick={(e) => onLinkClick(e, 'submit')} className="hover:text-black transition-colors underline-offset-4 hover:underline">Submit Paper</a></li>
          </ul>
        </div>
        
        <div className="md:col-span-4">
          <h4 className="font-bold text-black mb-6 tracking-widest text-xs uppercase">Weekly Digest</h4>
          <div className="flex flex-col gap-4">
            <div className="relative">
              <input 
                type="email" 
                placeholder="researcher@university.edu" 
                value={email}
                onChange={handleEmailChange}
                disabled={subscribeStatus === 'loading' || subscribeStatus === 'success'}
                className={`w-full bg-transparent border-b py-2 text-lg outline-none transition-colors placeholder-gray-400 text-black disabled:opacity-50 ${
                  error ? 'border-red-500' : 'border-gray-300 focus:border-black'
                }`} 
              />
              {error && <span className="absolute -bottom-5 left-0 text-[10px] text-red-500 font-medium">{error}</span>}
            </div>
            
            <button 
              onClick={handleSubscribe}
              disabled={subscribeStatus !== 'idle' || !email}
              className="self-start text-xs font-bold uppercase tracking-widest mt-2 hover:text-black disabled:cursor-default disabled:hover:text-gray-400 disabled:opacity-50 transition-opacity"
            >
              {subscribeStatus === 'idle' && 'Subscribe'}
              {subscribeStatus === 'loading' && 'Processing...'}
              {subscribeStatus === 'success' && 'Subscribed'}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-[1800px] mx-auto mt-20 pt-8 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center text-[10px] uppercase tracking-widest opacity-60">
        <p>© 2025 Nexus Research Platform</p>
      </div>
    </footer>
  );
};

export default Footer;
