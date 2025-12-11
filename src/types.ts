/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';

export interface Paper {
  id: string;
  title: string;
  authors: string[];
  abstractPreview: string;
  abstract: string;
  publicationDate: string;
  category: string;
  doi: string; // DOI or ArXiv ID
  whyMatters: string;
  upvotes: number;
  timestamp: number; // For sorting
}

// Alias for backward compatibility if needed
export type Product = Paper;

export interface JournalArticle {
  id: number;
  title: string;
  date: string;
  excerpt: string;
  content: React.ReactNode;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export type ViewState = 
  | { type: 'home' }
  | { type: 'paper', paper: Paper }
  | { type: 'journal', article: JournalArticle }
  | { type: 'submit' };