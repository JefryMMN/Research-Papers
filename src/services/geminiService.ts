
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/


import { GoogleGenAI } from "@google/genai";
import { Paper } from '../src/types';

const getSystemInstruction = (papers: Paper[]) => {
  // To avoid token limits, we prioritize User Papers and Real Papers, then top rated generated ones.
  // We limit the context to ~50 papers.
  
  const userPapers = papers.filter(p => p.id.startsWith('sub-'));
  const realPapers = papers.filter(p => !p.id.startsWith('gen-') && !p.id.startsWith('sub-'));
  const generatedPapers = papers.filter(p => p.id.startsWith('gen-')).slice(0, 20);

  const contextPapers = [...userPapers, ...realPapers, ...generatedPapers];

  const paperContext = contextPapers.map(p => 
    `- "${p.title}" by ${p.authors.join(', ')} (${p.publicationDate}). Category: ${p.category}. Abstract: ${p.abstractPreview}`
  ).join('\n');

  let instruction = `You are the Research Assistant for "Nexus", a curated discovery platform for scientific papers. 
  Your tone is academic, precise, helpful, and concise. 
  
  Here is a subset of our current library (User submissions and top papers):
  ${paperContext}
  
  Answer user questions about these papers, summarize them, or suggest connections between them.
  If asked about topics not in the list, you can provide general scientific knowledge but gently mention you are searching the Nexus database.
  Keep answers brief (under 3-4 sentences) to fit the chat UI, unless asked to elaborate.`;

  if (userPapers.length > 0) {
    instruction += `\n\nNote: The user has personally submitted specific papers to the repository (titles: ${userPapers.map(p => p.title).join(', ')}). Be especially helpful if they ask about these.`;
  }

  return instruction;
};

// Use export to expose functionality
export const sendMessageToGemini = async (history: {role: string, text: string}[], newMessage: string, papers: Paper[]): Promise<string> => {
  try {
    // API key check. Direct access of process.env.API_KEY is preferred.
    if (!process.env.API_KEY) {
      return "I'm sorry, I cannot connect to the research database right now. (Missing API Key)";
    }

    // Always use initialization as requested.
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Call generateContent via ai.models
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        ...history.map(h => ({
          role: h.role === 'model' ? 'model' : 'user',
          parts: [{ text: h.text }]
        })),
        { role: 'user', parts: [{ text: newMessage }] }
      ],
      config: {
        systemInstruction: getSystemInstruction(papers),
      }
    });

    // Directly access text property from response.
    return response.text || "I was unable to generate a response.";

  } catch (error) {
    console.error("Gemini API Error:", error);
    return "I apologize, but I am unable to retrieve that information from the archives at this moment.";
  }
};
