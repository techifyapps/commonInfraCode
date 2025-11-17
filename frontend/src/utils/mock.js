// ECI Knowledge Base for RAG System
export const eciKnowledgeBase = [
  {
    question: "What is ECI?",
    answer: "ECI stands for Enriched Customer Information. It is the real-time customer data read layer that aggregates and exposes the latest customer information from multiple upstream systems."
  },
  {
    question: "What does ECI do?",
    answer: "ECI aggregates and exposes the latest customer information from multiple upstream systems, providing a single, consistent, and accurate customer profile for downstream systems."
  },
  {
    question: "Why is ECI important?",
    answer: "ECI provides a single, consistent, and accurate customer profile for downstream systems, ensuring data integrity across the organization."
  },
  {
    question: "What is the core principle of ECI?",
    answer: "Data Integrity is the core principle of ECI. It ensures customer data is correct, complete, and consistent across systems."
  },
  {
    question: "How does ECI ensure data integrity?",
    answer: "ECI runs automated reconciliation processes to detect missing, out-of-sync, or incorrect customer events. It performs daily reconciliation jobs to validate with source-of-truth systems like ECIF."
  },
  {
    question: "How often does ECI reconcile data?",
    answer: "ECI performs a daily reconciliation job to validate with source-of-truth systems (e.g., ECIF)."
  },
  {
    question: "What type of data does ECI provide?",
    answer: "ECI provides real-time customer demographics, contact information, accounts, status indicators, identifiers, flags, and event-driven updates."
  },
  {
    question: "What systems feed data into ECI?",
    answer: "Examples include ECIF, OCIF, core banking systems, event streams, and customer master data systems."
  },
  {
    question: "How does ECI receive real-time data?",
    answer: "Data is received through event streams (Kafka or similar), APIs, and synchronized feeds."
  },
  {
    question: "What happens if a source system misses an event?",
    answer: "The daily reconciliation job identifies the missing event and re-aligns customer data."
  },
  {
    question: "What is the PartyIdentification API?",
    answer: "It is an ID lookup API for mapping customer identifiers across platforms such as ECIF, OCIF, and other party data domains."
  },
  {
    question: "Why is the PartyIdentification API used?",
    answer: "To exchange and match customer IDs between systems such as ECIF, OCIF, and other party data domains, ensuring consistent identity resolution."
  },
  {
    question: "What types of lookups does PartyIdentification API support?",
    answer: "It supports Customer Number, Party ID, ECIF ID, OCIF ID, and cross-system identifier mapping."
  },
  {
    question: "What does a 400 error indicate?",
    answer: "A 400 Bad Request usually means the input ID is not found, customer data is inactive, or payload/lookup parameters are invalid. Verify that the input ID exists and is active in the source system."
  },
  {
    question: "What does a 500 error indicate?",
    answer: "A 500 Internal Server Error generally means the issue is not on the API side. The problem might be in APIC (API Connect) routing or configuration. Check APIC logs, routing paths, gateway configuration, or network connectivity."
  },
  {
    question: "What is data integrity in ECI?",
    answer: "Data integrity in ECI means ensuring customer data is correct, complete, and consistent across systems through mechanisms like daily reconciliation, duplicate detection, event timestamp validation, sequence ordering, and ID mapping consistency checks."
  },
  {
    question: "Does ECI handle real-time changes?",
    answer: "Yes, ECI processes events in near real-time."
  },
  {
    question: "What if an upstream system sends delayed events?",
    answer: "The reconciliation job corrects and aligns data when delayed events are received."
  },
  {
    question: "How does ECI maintain high reliability?",
    answer: "Through monitoring, event sequencing, reconciliation, and upstream/downstream validation."
  },
  {
    question: "What is identity resolution?",
    answer: "Identity resolution is the process of mapping and merging customer identifiers across systems to ensure every system refers to the same customer, avoiding duplicates or mismatched profiles."
  },
  {
    question: "How does ECI support identity resolution?",
    answer: "ECI uses the PartyIdentification API for ID lookups to map and merge customer identifiers across systems."
  },
  {
    question: "Data not found in API response. What should I do?",
    answer: "Check in upstream systems (e.g., ECIF) whether the customer ID is active and valid."
  },
  {
    question: "The API returns inconsistent data. What next?",
    answer: "Run the reconciliation process or verify event timestamps."
  },
  {
    question: "When should I escalate an issue?",
    answer: "If reconciliation and APIC checks show no issues, escalate to the ECI support team."
  },
  {
    question: "How should I query ECI?",
    answer: "Always use correct identifiers and validate that they are active."
  },
  {
    question: "Can ECI be used for bulk queries?",
    answer: "Yes, but bulk usage should be optimized using batch APIs or event-driven sync."
  },
  {
    question: "Is ECI a master system?",
    answer: "No. ECI is a read and validation layer, not a master or transactional system."
  }
];

// Initial statistics
export const initialStats = {
  latency: 2.3,
  totalEvents: 600345,
  newCustomers: 2345,
  uniqueCustomers: 230123
};
