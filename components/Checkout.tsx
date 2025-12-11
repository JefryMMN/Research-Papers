
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState } from 'react';
import { Paper } from '../types';

interface CheckoutProps {
  onBack: () => void;
  onSubmit: (paper: Paper) => void;
}

type SourceType = 'arxiv' | 'pubmed' | 'doi' | 'biorxiv' | 'medrxiv' | 'manual' | null;

const Checkout: React.FC<CheckoutProps> = ({ onBack, onSubmit }) => {
  const [inputValue, setInputValue] = useState('');
  const [formData, setFormData] = useState({
    whyMatters: '',
    manualTitle: '',
    manualAuthors: '',
    description: '',
    manualDate: '',
    manualSource: '',
    manualLink: ''
  });
  
  const [status, setStatus] = useState<'idle' | 'fetching' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [detectedSource, setDetectedSource] = useState<SourceType>(null);
  const [isManual, setIsManual] = useState(false);
  const [fetchedData, setFetchedData] = useState<Partial<Paper> | null>(null);

  const detectSource = (input: string): SourceType => {
    const lower = input.toLowerCase();
    if (lower.includes('arxiv.org') || /^\d{4}\.\d{4,5}(v\d+)?$/.test(input)) return 'arxiv';
    if (lower.includes('pubmed') || /^\d{8}$/.test(input)) return 'pubmed';
    if (lower.includes('biorxiv.org')) return 'biorxiv';
    if (lower.includes('medrxiv.org')) return 'medrxiv';
    if (/^10\.\d{4,9}\/[-._;()/:a-zA-Z0-9]+$/.test(input) || lower.includes('doi.org')) return 'doi';
    return null;
  };

  const formatAbstract = (text: string): string => {
    if (!text) return "";
    let cleaned = text;
    cleaned = cleaned.replace(/<[^>]*>?/gm, '');
    cleaned = cleaned.replace(/^abstract[:.]?\s*/i, '');
    cleaned = cleaned.replace(/\s+/g, ' ');
    return cleaned.trim();
  };

  const fetchWithFallback = async (url: string): Promise<string> => {
    try {
      const response = await fetch(url);
      if (response.ok) return await response.text();
    } catch (directError) {
      console.warn("Direct fetch network error, attempting proxies...", directError);
    }

    try {
      const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
      const response = await fetch(proxyUrl);
      if (response.ok) return await response.text();
    } catch (proxyError) {
      console.warn("Primary proxy failed, attempting secondary...", proxyError);
    }

    try {
      const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(url)}`;
      const response = await fetch(proxyUrl);
      if (response.ok) return await response.text();
    } catch (secProxyError) {
      console.warn("Secondary proxy failed.", secProxyError);
    }

    throw new Error("Failed to fetch data from source (CORS/Network error).");
  };

  // --- Fetch Functions ---

  const fetchArxiv = async (id: string) => {
    console.log(`[Fetch] ArXiv ID: ${id}`);
    const cleanId = id.replace(/.*arxiv.org\/abs\//, '').replace(/^arXiv:/i, '').trim();
    const url = `https://export.arxiv.org/api/query?id_list=${cleanId}`;
    
    try {
      const str = await fetchWithFallback(url);
      const xml = new window.DOMParser().parseFromString(str, "text/xml");
      const entry = xml.querySelector("entry");
      
      if (!entry) throw new Error("Paper not found on arXiv.");

      const title = entry.querySelector("title")?.textContent?.replace(/\n/g, ' ').trim() || "Untitled";
      const rawAbstract = entry.querySelector("summary")?.textContent || "";
      const abstract = formatAbstract(rawAbstract);
      
      const authors = Array.from(entry.querySelectorAll("author name")).map(node => node.textContent || "");
      const published = entry.querySelector("published")?.textContent?.substring(0, 4) || new Date().getFullYear().toString();
      const category = entry.querySelector("primary_category")?.getAttribute("term") || "Preprint";

      return {
        title,
        abstract,
        authors,
        publicationDate: published,
        doi: `arXiv:${cleanId}`,
        category
      };
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const fetchPubMed = async (id: string) => {
    console.log(`[Fetch] PubMed ID: ${id}`);
    const pmid = id.replace(/.*pubmed.ncbi.nlm.nih.gov\//, '').replace(/\//g, '').trim();
    const url = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&id=${pmid}&retmode=xml`;

    try {
      const str = await fetchWithFallback(url);
      const xml = new window.DOMParser().parseFromString(str, "text/xml");
      
      const article = xml.querySelector("PubmedArticle");
      if (!article) throw new Error("Paper not found on PubMed.");

      const title = article.querySelector("ArticleTitle")?.textContent || "Untitled";
      const abstractText = article.querySelector("AbstractText")?.textContent || "Abstract not available.";
      const abstract = formatAbstract(abstractText);

      const authorList = article.querySelectorAll("Author");
      const authors = Array.from(authorList).map(a => {
        const last = a.querySelector("LastName")?.textContent || "";
        const init = a.querySelector("Initials")?.textContent || "";
        return `${last} ${init}`.trim();
      }).filter(n => n);

      const pubDate = article.querySelector("PubDate Year")?.textContent || 
                      article.querySelector("PubDate MedlineDate")?.textContent?.substring(0,4) || 
                      new Date().getFullYear().toString();

      return {
        title,
        abstract,
        authors,
        publicationDate: pubDate,
        doi: `PMID:${pmid}`,
        category: "Medicine/Biology"
      };
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const fetchCrossRef = async (doiInput: string) => {
    console.log(`[Fetch] CrossRef DOI: ${doiInput}`);
    const cleanDoi = doiInput.replace(/.*doi.org\//, '').trim();
    const url = `https://api.crossref.org/works/${cleanDoi}`;

    try {
      const str = await fetchWithFallback(url);
      
      let data;
      try {
        data = JSON.parse(str);
      } catch (parseError) {
        console.warn("CrossRef response was not JSON:", str.substring(0, 100));
        throw new Error("Paper not found on CrossRef (Invalid Response).");
      }

      const item = data.message;
      if (!item) throw new Error("No metadata found in CrossRef response.");

      return {
        title: item.title?.[0] || "Untitled",
        abstract: item.abstract ? formatAbstract(item.abstract) : "Abstract not available via CrossRef.",
        authors: item.author?.map((a: any) => `${a.given} ${a.family}`) || ["Unknown Author"],
        publicationDate: item.issued?.['date-parts']?.[0]?.[0]?.toString() || new Date().getFullYear().toString(),
        doi: cleanDoi,
        category: item.subject?.[0] || "Research"
      };
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const fetchRxiv = async (input: string, server: 'biorxiv' | 'medrxiv') => {
    console.log(`[Fetch] ${server}: ${input}`);
    
    const doiMatch = input.match(/10\.1101\/\d{4}\.\d{2}\.\d{2}\.\d+/);
    
    if (!doiMatch) {
      throw new Error(`Could not extract valid DOI from ${server} input.`);
    }
    
    const doi = doiMatch[0].replace(/v\d+$/, ''); 
    console.log(`[Fetch] Extracted DOI: ${doi}`);
  
    const url = `https://api.biorxiv.org/details/${server}/${doi}`;
    console.log(`[Fetch] API URL: ${url}`);
  
    try {
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`${server} API returned ${response.status}`);
      }
      
      let data;
      try {
        data = await response.json();
      } catch (e) {
        throw new Error("Invalid JSON response from Rxiv API");
      }

      console.log(`[Fetch] API Response:`, data);
      
      if (!data.collection || data.collection.length === 0) {
        throw new Error(`Paper not found on ${server}.`);
      }
      
      const item = data.collection[data.collection.length - 1];
  
      return {
        title: item.title || "Untitled",
        abstract: item.abstract ? formatAbstract(item.abstract) : "No abstract available.",
        authors: item.authors ? item.authors.split(';').map((a: string) => a.trim()) : ["Unknown Author"],
        publicationDate: item.date ? item.date.substring(0, 4) : new Date().getFullYear().toString(),
        doi: item.doi || doi,
        category: item.category || (server === 'biorxiv' ? "Biology" : "Medicine")
      };
    } catch (error: any) {
      console.error(`[${server} Error]`, error);
      throw error;
    }
  };

  const handleFetch = async () => {
    if (!inputValue) return;
    
    setStatus('fetching');
    setErrorMessage('');
    const source = detectSource(inputValue);
    setDetectedSource(source);

    try {
      let data;
      if (source === 'arxiv') {
        data = await fetchArxiv(inputValue);
      } else if (source === 'pubmed') {
        data = await fetchPubMed(inputValue);
      } else if (source === 'biorxiv' || source === 'medrxiv' || source === 'doi') {
         if (inputValue.includes('10.1101/')) {
            try {
               data = await fetchRxiv(inputValue, 'biorxiv');
            } catch (bioError) {
               console.log("Not found on BioRxiv, trying MedRxiv...");
               try {
                 data = await fetchRxiv(inputValue, 'medrxiv');
               } catch (medError) {
                 console.log("Not found on MedRxiv, falling back to CrossRef...");
                 data = await fetchCrossRef(inputValue);
               }
            }
         } else {
            data = await fetchCrossRef(inputValue);
         }
      } else {
        if (inputValue.startsWith('10.')) {
           data = await fetchCrossRef(inputValue);
        } else {
           throw new Error("Could not detect source type. Please use Manual Entry.");
        }
      }

      if (data) {
        setFetchedData(data);
        setFormData(prev => ({
          ...prev,
          manualTitle: data.title || '',
          manualAuthors: data.authors ? data.authors.join(', ') : '',
          description: data.abstract || '',
          manualDate: data.publicationDate || '',
          manualSource: data.category || '',
          manualLink: data.doi || ''
        }));
        setStatus('success');
      }
    } catch (error: any) {
      console.error("Fetch Pipeline Failed:", error);
      setStatus('error');
      
      let msg = "Failed to fetch paper details.";
      if (error.message.includes('not found')) {
         msg = "Paper not found. Please check the ID/URL.";
      } else if (error.message.includes('CORS') || error.message.includes('Network')) {
         msg = "Network error. Please try again or use Manual Entry.";
      }
      
      if (inputValue.includes('10.1101/')) {
         msg = "Paper details not found on bioRxiv, medRxiv, or CrossRef.";
      }

      setErrorMessage(msg);
    }
  };

  const handleSubmit = () => {
    // UPDATED VALIDATION LIMITS
    // Description: Approx 5 paragraphs -> ~1200+ chars
    // Why Matters: Approx 3 paragraphs -> ~500+ chars
    const isDescriptionValid = formData.description.length >= 1200;
    const isWhyMattersValid = formData.whyMatters.length >= 500;

    if (!isDescriptionValid || !isWhyMattersValid) {
        setErrorMessage("Please ensure Description (5 paras) and Impact (3 paras) meet length requirements.");
        return;
    }

    if (isManual) {
       if (!formData.manualTitle || !formData.manualAuthors || !formData.description) {
           setErrorMessage("Please fill in all required fields.");
           return;
       }
    } else {
        if (!fetchedData) {
            setErrorMessage("Please fetch paper details first.");
            return;
        }
    }

    const paper: Paper = {
      id: `sub-${Date.now()}`,
      title: isManual ? formData.manualTitle : fetchedData!.title!,
      authors: isManual ? formData.manualAuthors.split(',').map(s => s.trim()) : fetchedData!.authors!,
      abstractPreview: formData.description.substring(0, 150) + '...',
      abstract: formData.description,
      publicationDate: isManual ? formData.manualDate : fetchedData!.publicationDate!,
      category: isManual ? (formData.manualSource || 'Uncategorized') : fetchedData!.category!,
      doi: isManual ? formData.manualLink : fetchedData!.doi!,
      whyMatters: formData.whyMatters,
      upvotes: 0,
      timestamp: Date.now()
    };

    onSubmit(paper);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errorMessage) setErrorMessage('');
  };

  return (
    <div className="min-h-screen bg-white animate-fade-in-up pt-24 pb-24">
      <div className="max-w-2xl mx-auto px-6">
        
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

        <h1 className="text-4xl font-serif text-black mb-12">Submit a Paper</h1>

        {/* Toggle Mode */}
        <div className="flex gap-8 border-b border-gray-100 mb-12">
            <button 
                onClick={() => setIsManual(false)}
                className={`pb-4 text-xs font-bold uppercase tracking-widest transition-colors ${
                    !isManual ? 'text-black border-b-2 border-black' : 'text-gray-400 hover:text-black'
                }`}
            >
                Smart Submission
            </button>
            <button 
                onClick={() => setIsManual(true)}
                className={`pb-4 text-xs font-bold uppercase tracking-widest transition-colors ${
                    isManual ? 'text-black border-b-2 border-black' : 'text-gray-400 hover:text-black'
                }`}
            >
                Manual Entry
            </button>
        </div>

        <div className="space-y-12">
            
            {/* Smart Fetch Input */}
            {!isManual && (
                <div className="space-y-4 animate-fade-in-up">
                    <div className="flex justify-between items-end">
                        <label className="text-xs font-bold uppercase tracking-widest text-black">Smart Input</label>
                        {detectedSource && (
                            <span className="text-[10px] font-bold uppercase tracking-widest bg-gray-100 px-2 py-1 rounded text-gray-600">
                                Detected: {detectedSource}
                            </span>
                        )}
                    </div>
                    <div className="flex gap-2">
                        <input 
                            type="text" 
                            placeholder="e.g. 1706.03762 or doi:10.1038/..."
                            value={inputValue}
                            onChange={(e) => {
                                setInputValue(e.target.value);
                                setDetectedSource(detectSource(e.target.value));
                                setStatus('idle');
                                setErrorMessage('');
                            }}
                            className={`flex-1 bg-gray-50 border p-4 rounded-lg outline-none transition-colors ${
                                status === 'error' ? 'border-red-300 bg-red-50' : 'border-gray-100 focus:border-black'
                            }`}
                        />
                        <button
                            onClick={handleFetch}
                            disabled={!inputValue || status === 'fetching'}
                            className="bg-black text-white px-6 rounded-lg hover:bg-gray-800 disabled:opacity-50 transition-colors"
                        >
                             {status === 'fetching' ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                             ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                                </svg>
                             )}
                        </button>
                    </div>
                    <p className="text-xs text-gray-400">
                        Enter an arXiv URL, DOI, PubMed ID, bioRxiv/medRxiv URL to auto-fetch.
                    </p>
                    
                    {/* Error Message for Smart Mode */}
                    {status === 'error' && errorMessage && (
                        <div className="p-4 bg-red-50 border-l-2 border-red-500 text-red-700 text-sm">
                            {errorMessage}
                        </div>
                    )}
                </div>
            )}

            {/* Manual / Edited Fields */}
            {(isManual || status === 'success') && (
                <div className="space-y-8 animate-fade-in-up">
                    
                    {!isManual && (
                        <div className="p-4 bg-green-50 border-l-2 border-green-500 text-green-800 text-sm flex items-center justify-between">
                            <span>Successfully fetched metadata. Please review and add details below.</span>
                            <button onClick={() => { setStatus('idle'); setFetchedData(null); setInputValue(''); setFormData({ ...formData, description: '', whyMatters: ''}); }} className="underline">Clear</button>
                        </div>
                    )}

                    {isManual && (
                        <>
                             <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-black">Paper Title *</label>
                                <input 
                                    type="text" 
                                    name="manualTitle"
                                    value={formData.manualTitle}
                                    onChange={handleInputChange}
                                    className="w-full bg-white border border-gray-200 p-4 rounded-lg outline-none focus:border-black transition-colors"
                                    placeholder="Enter full title..."
                                />
                             </div>
                             <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-black">Authors *</label>
                                <input 
                                    type="text" 
                                    name="manualAuthors"
                                    value={formData.manualAuthors}
                                    onChange={handleInputChange}
                                    className="w-full bg-white border border-gray-200 p-4 rounded-lg outline-none focus:border-black transition-colors"
                                    placeholder="Comma separated names..."
                                />
                             </div>
                        </>
                    )}

                    {/* Description - Required for BOTH modes now */}
                    <div className="space-y-2">
                        <div className="flex justify-between">
                             <label className="text-xs font-bold uppercase tracking-widest text-black">
                                Description * (Min 1200 chars - approx 5 paragraphs)
                             </label>
                             <span className={`text-xs font-bold ${formData.description.length < 1200 ? 'text-red-400' : 'text-green-500'}`}>
                                {formData.description.length} / 1200+
                             </span>
                        </div>
                        <textarea 
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            rows={12}
                            className={`w-full bg-white border p-4 rounded-lg outline-none focus:border-black transition-colors leading-relaxed ${
                                formData.description.length > 0 && formData.description.length < 1200 
                                ? 'border-red-200 focus:border-red-500' 
                                : 'border-gray-200'
                            }`}
                            placeholder="Provide a detailed description (approx. 5 paragraphs)..."
                        />
                         {formData.description.length > 0 && formData.description.length < 1200 && (
                            <p className="text-xs text-red-500">Description must be at least 5 paragraphs (1200+ characters).</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between">
                             <label className="text-xs font-bold uppercase tracking-widest text-black">Why This Matters * (Min 500 chars - approx 3 paragraphs)</label>
                             <span className={`text-xs font-bold ${
                                 formData.whyMatters.length < 500 
                                 ? 'text-red-400' 
                                 : 'text-green-500'
                             }`}>
                                {formData.whyMatters.length} / 500+
                             </span>
                        </div>
                        <textarea 
                            name="whyMatters"
                            value={formData.whyMatters}
                            onChange={handleInputChange}
                            rows={6}
                            className={`w-full bg-white border p-4 rounded-lg outline-none focus:border-black transition-colors ${
                                formData.whyMatters.length > 0 && formData.whyMatters.length < 500 ? 'border-red-300' : 'border-gray-200'
                            }`}
                            placeholder="Explain in 3 paragraphs why this work is groundbreaking..."
                        />
                         {formData.whyMatters.length > 0 && formData.whyMatters.length < 500 && (
                            <p className="text-xs text-red-500">Impact statement must be at least 3 paragraphs (500+ characters).</p>
                        )}
                    </div>

                    {isManual && (
                         <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-black">Publication Date</label>
                                <input 
                                    type="text" 
                                    name="manualDate"
                                    value={formData.manualDate}
                                    onChange={handleInputChange}
                                    className="w-full bg-white border border-gray-200 p-4 rounded-lg outline-none focus:border-black transition-colors"
                                    placeholder="YYYY"
                                />
                             </div>
                             <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-black">Category</label>
                                <input 
                                    type="text" 
                                    name="manualSource"
                                    value={formData.manualSource}
                                    onChange={handleInputChange}
                                    className="w-full bg-white border border-gray-200 p-4 rounded-lg outline-none focus:border-black transition-colors"
                                    placeholder="e.g. Biology"
                                />
                             </div>
                             <div className="col-span-2 space-y-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-black">External Link / DOI</label>
                                <input 
                                    type="text" 
                                    name="manualLink"
                                    value={formData.manualLink}
                                    onChange={handleInputChange}
                                    className="w-full bg-white border border-gray-200 p-4 rounded-lg outline-none focus:border-black transition-colors"
                                    placeholder="https://..."
                                />
                             </div>
                         </div>
                    )}
                    
                    {/* General Error Message at bottom */}
                    {errorMessage && status !== 'error' && (
                        <div className="p-4 bg-red-50 border-l-2 border-red-500 text-red-700 text-sm">
                            {errorMessage}
                        </div>
                    )}

                    <div className="pt-8">
                        <button 
                            onClick={handleSubmit}
                            className="w-full py-5 bg-black text-white rounded-full uppercase tracking-widest text-sm font-bold hover:bg-gray-800 transition-all shadow-xl hover:shadow-2xl hover:scale-[1.01]"
                        >
                            Submit Paper
                        </button>
                    </div>
                </div>
            )}
            
            {isManual && (
                <div className="pt-8 text-center">
                    <button onClick={() => setIsManual(false)} className="text-gray-400 hover:text-black underline text-sm">
                        Back to Smart Submission
                    </button>
                </div>
            )}
            
            {!isManual && status === 'idle' && (
                 <div className="pt-8 text-center">
                    <button onClick={() => setIsManual(true)} className="text-gray-400 hover:text-black underline text-sm font-bold uppercase tracking-widest">
                        Can't find your paper? Enter manually
                    </button>
                </div>
            )}

        </div>
      </div>
    </div>
  );
};

export default Checkout;
