import { eciKnowledgeBase } from './mock';

// Enhanced string matching
function containsKeywords(text, keywords) {
  const lowerText = text.toLowerCase();
  return keywords.some(keyword => lowerText.includes(keyword.toLowerCase()));
}

// Find best matching answer from knowledge base
export function findAnswer(userQuery) {
  const query = userQuery.toLowerCase().trim();
  
  // Enhanced keyword mapping with multiple variations
  const keywordMap = [
    { keywords: ['what is eci', 'define eci', 'eci definition', 'what eci'], index: 0 },
    { keywords: ['what does eci do', 'eci function', 'eci purpose', 'what eci does'], index: 1 },
    { keywords: ['why is eci important', 'eci importance', 'why eci', 'importance of eci'], index: 2 },
    { keywords: ['core principle', 'main principle', 'key principle', 'principle of eci'], index: 3 },
    { keywords: ['ensure data integrity', 'how eci ensure', 'data integrity ensure', 'ensure integrity'], index: 4 },
    { keywords: ['reconcile', 'reconciliation', 'how often', 'reconcile data', 'frequency'], index: 5 },
    { keywords: ['what type of data', 'data types', 'type of data', 'what data'], index: 6 },
    { keywords: ['what systems feed', 'upstream systems', 'feed data', 'source systems'], index: 7 },
    { keywords: ['real-time data', 'receive data', 'how receive', 'receive real-time'], index: 8 },
    { keywords: ['miss event', 'missing event', 'missed event', 'source system misses'], index: 9 },
    { keywords: ['partyidentification api', 'party identification', 'id lookup', 'what is party'], index: 10 },
    { keywords: ['why partyidentification', 'why party identification', 'why is party', 'why party api'], index: 11 },
    { keywords: ['types of lookup', 'lookup types', 'what types', 'support lookup', 'lookups support'], index: 12 },
    { keywords: ['400 error', 'bad request', 'error 400', '400'], index: 13 },
    { keywords: ['500 error', 'internal server', 'error 500', '500'], index: 14 },
    { keywords: ['what is data integrity', 'define data integrity', 'data integrity definition'], index: 15 },
    { keywords: ['real-time changes', 'handle real-time', 'real time change'], index: 16 },
    { keywords: ['delayed events', 'delayed event', 'upstream delayed'], index: 17 },
    { keywords: ['high reliability', 'reliability', 'maintain reliability'], index: 18 },
    { keywords: ['what is identity resolution', 'identity resolution', 'define identity'], index: 19 },
    { keywords: ['support identity', 'how support identity', 'eci support identity'], index: 20 },
    { keywords: ['data not found', 'not found', 'data missing'], index: 21 },
    { keywords: ['inconsistent data', 'data inconsistent', 'inconsistency'], index: 22 },
    { keywords: ['escalate', 'escalation', 'when escalate'], index: 23 },
    { keywords: ['how query', 'how should i query', 'query eci'], index: 24 },
    { keywords: ['bulk queries', 'bulk query', 'bulk usage'], index: 25 },
    { keywords: ['master system', 'is eci master', 'master'], index: 26 }
  ];

  // Try keyword matching first
  for (const mapping of keywordMap) {
    if (containsKeywords(query, mapping.keywords)) {
      return eciKnowledgeBase[mapping.index].answer;
    }
  }

  // Try partial matching with questions
  for (let i = 0; i < eciKnowledgeBase.length; i++) {
    const item = eciKnowledgeBase[i];
    const questionWords = item.question.toLowerCase().split(' ');
    const queryWords = query.split(' ');
    
    // Count matching words
    let matchCount = 0;
    for (const qWord of queryWords) {
      if (qWord.length > 3 && questionWords.some(w => w.includes(qWord) || qWord.includes(w))) {
        matchCount++;
      }
    }
    
    // If more than 40% words match, return this answer
    if (matchCount > 0 && matchCount / queryWords.length > 0.4) {
      return item.answer;
    }
  }

  // Default response
  return "I'm not sure about that specific question. Could you please rephrase or ask about:\n\n• ECI overview and core principles\n• Data integrity and reconciliation\n• PartyIdentification API\n• Error handling (400/500 errors)\n• Identity resolution\n• System reliability\n• Troubleshooting tips\n\nTry asking questions like 'What is ECI?' or 'How does ECI ensure data integrity?'";
}
