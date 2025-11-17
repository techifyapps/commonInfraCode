import { eciKnowledgeBase } from './mock';

// Simple string similarity function
function similarity(s1, s2) {
  const longer = s1.length > s2.length ? s1 : s2;
  const shorter = s1.length > s2.length ? s2 : s1;
  const longerLength = longer.length;
  if (longerLength === 0) return 1.0;
  return (longerLength - editDistance(longer, shorter)) / longerLength;
}

function editDistance(s1, s2) {
  s1 = s1.toLowerCase();
  s2 = s2.toLowerCase();
  const costs = [];
  for (let i = 0; i <= s1.length; i++) {
    let lastValue = i;
    for (let j = 0; j <= s2.length; j++) {
      if (i === 0) {
        costs[j] = j;
      } else if (j > 0) {
        let newValue = costs[j - 1];
        if (s1.charAt(i - 1) !== s2.charAt(j - 1)) {
          newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
        }
        costs[j - 1] = lastValue;
        lastValue = newValue;
      }
    }
    if (i > 0) costs[s2.length] = lastValue;
  }
  return costs[s2.length];
}

// Find best matching answer from knowledge base
export function findAnswer(userQuery) {
  const query = userQuery.toLowerCase().trim();
  
  // Direct keyword matching for better accuracy
  const keywords = {
    'what is eci': 0,
    'what does eci do': 1,
    'why is eci important': 2,
    'core principle': 3,
    'data integrity': 3,
    'how does eci ensure': 4,
    'reconcile': 5,
    'how often': 5,
    'what type of data': 6,
    'what systems feed': 7,
    'upstream systems': 7,
    'real-time data': 8,
    'receive data': 8,
    'miss event': 9,
    'missing event': 9,
    'partyidentification api': 10,
    'party identification': 10,
    'id lookup': 10,
    'why is partyidentification': 11,
    'lookups': 12,
    'types of lookup': 12,
    '400 error': 13,
    'bad request': 13,
    '500 error': 14,
    'internal server': 14,
    'what is data integrity': 15,
    'real-time changes': 16,
    'delayed events': 17,
    'high reliability': 18,
    'what is identity resolution': 19,
    'identity resolution': 19,
    'support identity': 20,
    'data not found': 21,
    'inconsistent data': 22,
    'escalate': 23,
    'how should i query': 24,
    'bulk queries': 25,
    'master system': 26
  };

  // Check for keyword matches
  for (const [keyword, index] of Object.entries(keywords)) {
    if (query.includes(keyword)) {
      return eciKnowledgeBase[index].answer;
    }
  }

  // Fall back to similarity matching
  let bestMatch = null;
  let bestScore = 0;

  eciKnowledgeBase.forEach(item => {
    const score = similarity(query, item.question.toLowerCase());
    if (score > bestScore) {
      bestScore = score;
      bestMatch = item;
    }
  });

  // If similarity is too low, return default message
  if (bestScore < 0.3) {
    return "I'm not sure about that specific question. Could you please rephrase or ask about ECI overview, data integrity, PartyIdentification API, error handling, identity resolution, or troubleshooting?";
  }

  return bestMatch.answer;
}
