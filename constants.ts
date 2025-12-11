/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
console.log("🧠 SUPABASE URL:", import.meta.env.VITE_SUPABASE_URL);
console.log("🧠 SUPABASE KEY:", import.meta.env.VITE_SUPABASE_ANON_KEY ? "✅ Exists" : "❌ Missing");

import React from 'react';
import { Paper, JournalArticle } from './types';
import { supabase } from './supabaseClient';

// Declare custom window.storage API
declare global {
  interface Window {
    storage: {
      get: (key: string, shared?: boolean) => Promise<{ value: string } | null>;
      set: (key: string, value: string, shared?: boolean) => Promise<void>;
    };
  }
}

// --- POLYFILL: Ensure window.storage exists ---
if (typeof window !== 'undefined' && !window.storage) {
  window.storage = {
    get: async (key: string) => {
      try {
        const value = localStorage.getItem(key);
        return value ? { value } : null;
      } catch (e) {
        console.warn('Nexus Storage Get Error:', e);
        return null;
      }
    },
    set: async (key: string, value: string) => {
      try {
        localStorage.setItem(key, value);
      } catch (e) {
        console.warn('Nexus Storage Set Error:', e);
      }
    },
  };
}

export const BRAND_NAME = 'Nexus';

export const JOURNAL_ARTICLES: JournalArticle[] = [
  {
    id: 1,
    title: 'The Future of Open Access',
    date: 'Dec 12, 2024',
    excerpt:
      'How blockchain and decentralized systems are reshaping the publication landscape.',
    content: React.createElement(
      'p',
      null,
      'The landscape of scientific publishing is undergoing a seismic shift...'
    ),
  },
  {
    id: 2,
    title: 'Citation Metrics vs. Impact',
    date: 'Nov 05, 2024',
    excerpt:
      'Moving beyond h-index to understand the true societal impact of research.',
    content: React.createElement(
      'p',
      null,
      'For decades, the h-index has been the gold standard, but it fails to capture...'
    ),
  },
  {
    id: 3,
    title: 'The "Simple" Transformer',
    date: 'Oct 20, 2024',
    excerpt:
      'Why architectural simplicity often leads to the most robust breakthroughs.',
    content: React.createElement(
      'p',
      null,
      'Looking back at the landmark paper "Attention is All You Need", we see a pattern...'
    ),
  },
];

// --- SEED DATA: Real Papers (Base) ---
const REAL_PAPERS: Paper[] = [
  {
    id: 'sub-global-001',
    title: 'The Impact of Generative AI on Scientific Discovery',
    authors: ['Nexus Community', 'Alex Chen', 'Maria Rodriguez'],
    abstractPreview:
      'An extensive analysis of how Large Language Models are accelerating hypothesis generation and data analysis across biology and physics.',
    abstract: `This paper explores the transformative role of Generative AI (GenAI) in the scientific method...`,
    publicationDate: '2025',
    category: 'Artificial Intelligence',
    doi: '10.1038/nexus.2025.001',
    whyMatters:
      'This work is crucial because it documents the paradigm shift currently occurring in science...',
    upvotes: 128,
    timestamp: 1740000000000,
  },
];

// --- GENERATION CONSTANTS ---
const TARGET_COUNT = 5000;
const USER_PAPERS_KEY = 'shared-papers';
const ADJECTIVES = ['Critical', 'Novel', 'Systematic', 'Unified'];
const TOPICS = ['Transformer Architecture', 'Quantum Entanglement'];
const CONTEXTS = ['using Deep Learning', 'in Low-Resource Settings'];
const METHODS = ['Framework', 'Analysis', 'Architecture'];
const FINDINGS = [
  'we identified a 15% reduction in latency.',
  'we discovered previously unobserved correlations.',
];
const CATEGORIES = [
  'Machine Learning',
  'Artificial Intelligence',
  'Mathematics',
];
const FIRST_NAMES = ['Arjun', 'Meera', 'Li', 'Elena'];
const LAST_NAMES = ['Menon', 'Wang', 'Smith', 'Patel'];

// --- RANDOM GENERATOR (for large dataset) ---
const generate10kPapers = (): Paper[] => {
  const generated: Paper[] = [];
  const now = Date.now();
  for (let i = 0; i < TARGET_COUNT; i++) {
    const title = `${ADJECTIVES[i % ADJECTIVES.length]} ${
      TOPICS[i % TOPICS.length]
    } ${CONTEXTS[i % CONTEXTS.length]}: A ${METHODS[i % METHODS.length]}`;
    generated.push({
      id: `gen-${i}`,
      title,
      authors: [
        `${FIRST_NAMES[i % FIRST_NAMES.length]} ${
          LAST_NAMES[(i + 1) % LAST_NAMES.length]
        }`,
      ],
      abstractPreview: 'Automatically generated research paper...',
      abstract: 'This is an AI-generated placeholder paper for simulation.',
      publicationDate: `202${i % 5}`,
      category: CATEGORIES[i % CATEGORIES.length],
      doi: `10.1038/nx.${i}`,
      whyMatters: 'Demonstrates scalable AI-driven paper synthesis.',
      upvotes: 0,
      timestamp: now - i * 10000000,
    });
  }
  return generated;
};

// --- FETCH REAL PAPERS FROM ARXIV ---
export async function fetchArxivPapers(
  maxResults = 500,
  category = 'cs.AI'
): Promise<Paper[]> {
  try {
    const response = await fetch(
      `https://export.arxiv.org/api/query?search_query=cat:${category}&start=0&max_results=${maxResults}`
    );
    const text = await response.text();

    // Parse XML to JSON
    const parser = new DOMParser();
    const xml = parser.parseFromString(text, 'application/xml');
    const entries = Array.from(xml.getElementsByTagName('entry'));

    return entries.map((entry, index) => {
      const title = entry.getElementsByTagName('title')[0]?.textContent || '';
      const summary = entry.getElementsByTagName('summary')[0]?.textContent || '';
      const authors = Array.from(entry.getElementsByTagName('author')).map(
        (a) => a.getElementsByTagName('name')[0]?.textContent || ''
      );
      const published =
        entry.getElementsByTagName('published')[0]?.textContent || '';
      const id = entry.getElementsByTagName('id')[0]?.textContent || '';

      return {
        id: `arxiv-${category}-${index}`,
        title,
        authors,
        abstractPreview: summary.slice(0, 150) + '...',
        abstract: summary,
        publicationDate: published,
        category: category,
        doi: id,
        whyMatters: 'Fetched from arXiv for open access research visibility.',
        upvotes: 0,
        timestamp: Date.now() - index * 10000,
      };
    });
  } catch (error) {
    console.error('Failed to fetch from arXiv:', error);
    return [];
  }
}

// --- LOCAL STORAGE HELPERS ---
const loadUserPapers = async (): Promise<Paper[]> => {
  try {
    const result = await window.storage.get(USER_PAPERS_KEY, true);
    return result?.value ? JSON.parse(result.value) : [];
  } catch (e) {
    console.warn('Failed to load user papers', e);
    return [];
  }
};

// --- SAVE PAPER (Local + Supabase) ---
export const saveUserPaper = async (paper: Paper) => {
  try {
    // Local Save
    const result = await window.storage.get(USER_PAPERS_KEY, true);
    const papers: Paper[] = result?.value ? JSON.parse(result.value) : [];
    if (!papers.some((p) => p.id === paper.id)) {
      papers.unshift(paper);
      await window.storage.set(USER_PAPERS_KEY, JSON.stringify(papers), true);
    }

    // Supabase Save
    const { error } = await supabase.from('papers').insert([paper]);
    if (error) throw error;

    console.log('✅ Paper saved to Supabase');
  } catch (e) {
    console.error('❌ Failed to save paper:', e);
  }
};

// --- INITIALIZE DATABASE (Global + Realtime + arXiv + Generated) ---
export const initializeDatabase = async (): Promise<Paper[]> => {
  try {
    // 1️⃣ Fetch from Supabase (community papers)
    const { data: globalPapers, error } = await supabase
      .from('papers')
      .select('*')
      .order('timestamp', { ascending: false });

    if (error) throw error;

    // 2️⃣ Fetch from arXiv (real published papers)
    const arxivCategories = ['cs.AI', 'cs.CL', 'cs.LG', 'physics.optics', 'math.PR'];
    const arxivPapersNested = await Promise.all(
      arxivCategories.map((cat) => fetchArxivPapers(1000, cat))
    );
    const arxivPapers = arxivPapersNested.flat();

    // 3️⃣ Load user/local + generated
    const userPapers = await loadUserPapers();
    const generated = generate10kPapers();

    // 4️⃣ Merge everything
    const allPapers = [
      ...(globalPapers || []),
      ...arxivPapers,
      ...userPapers,
      ...REAL_PAPERS,
      ...generated,
    ];

    // 5️⃣ Enable realtime updates
    supabase
      .channel('public:papers')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'papers' },
        (payload) => {
          const newPaper = payload.new as Paper;
          console.log('🆕 New paper detected:', newPaper);
          allPapers.unshift(newPaper);
        }
      )
      .subscribe();

    return allPapers;
  } catch (e) {
    console.error('❌ Failed to load papers:', e);
    return [...REAL_PAPERS, ...generate10kPapers()];
  }
};

export const PAPERS: Paper[] = REAL_PAPERS;
