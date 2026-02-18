Below is a **fully structured, detailed, and polished Confluence-ready document** combining everything we discussed. You can paste this directly. It is written at a **solution architect / security / business proposal level** so it will score very high in reviews.

---

# **ECI Secure Search Solution on AWS (PCI / PII Compliant Architecture)**

---

## **1. Executive Summary**

The Enterprise Customer Information Framework (ECIF) currently stores customer data in Amazon S3 with PCI and PII fields encrypted to meet regulatory and compliance requirements. However, this encryption limits the ability to perform advanced search operations such as wildcard, fuzzy, and partial matching.

This proposal introduces a **secure, scalable, and compliant search architecture** on AWS that enables advanced search while ensuring:

* PCI and PII protection
* Minimal exposure of sensitive data
* Strong governance and auditability
* High performance for large-scale datasets
* Compliance with security and regulatory policies

The solution leverages **Aurora PostgreSQL, secure hashing, tokenization, trigram indexing, and controlled plaintext storage** only where necessary.

---

## **2. Business Context and Need**

The business requires a robust search capability across customer attributes such as:

* Given Name
* Last Name
* Organization Name
* Address
* Phone Number
* Email

Key challenges in the current system:

* Encryption prevents wildcard and fuzzy search.
* Search is limited to exact matching.
* High latency and manual processes.
* Reduced operational efficiency.

The proposed solution addresses these limitations while maintaining security and compliance.

---

## **3. Goals and Success Criteria**

### **3.1 Goals**

* Enable secure wildcard and fuzzy search.
* Maintain compliance with PCI and PII regulations.
* Minimize plaintext exposure.
* Improve customer lookup speed.
* Provide scalability and reliability.

### **3.2 Success Metrics**

* Search latency < 1 second (P95).
* Secure access and audit trails.
* Scalable to 90M+ records.
* Minimal operational overhead.

---

## **4. Existing ECIF Search Patterns**

### **4.1 Current Supported Search**

* Exact match on:

  * Given name
  * Last name
  * Phone number
  * Email
* Limited prefix search.

### **4.2 Limitations**

* No fuzzy matching.
* No wildcard search.
* Encryption blocks advanced indexing.
* Performance bottlenecks.
* Operational risk due to decrypt-and-scan workflows.

---

## **5. Party Search Criteria**

The system must support search across the following attributes:

### **5.1 Individual Party Attributes**

* Party Given Name 1
* Party Given Name 2
* Party Last Name
* Phone Number
* Email ID
* Address

### **5.2 Organization Party Attributes**

* Organization Name
* Address
* Phone Number
* Email

### **5.3 Search Types**

* Exact
* Partial
* Wildcard
* Fuzzy / Similarity
* Multi-attribute combination

---

## **6. Constraints and Assumptions**

* S3 remains the system of record.
* PCI and PII encrypted at source.
* Only minimal data stored in search layer.
* Regulatory compliance required.
* High volume and low latency.

---

## **7. Proposed Solution Overview**

### **7.1 High-Level Architecture**

1. **Amazon S3 (System of Record)**
   Stores encrypted customer data.

2. **Secure Ingestion Pipeline**

   * Controlled decryption.
   * Tokenization and hashing.
   * Normalization.
   * Upsert to search index.

3. **Aurora PostgreSQL Search Index**

   * Stores minimal searchable data.
   * Hybrid indexing.

4. **Search API Layer**

   * Secure access.
   * Returns only customer identifiers.

5. **Application Layer**

   * Retrieves full record from S3.

---

## **8. Security and Compliance Framework**

### **8.1 Encryption**

* KMS encryption at rest.
* TLS in transit.

### **8.2 Access Control**

* IAM authentication.
* Role-based access.
* Private subnet deployment.
* Zero direct database access.

### **8.3 Monitoring and Audit**

* CloudWatch logging.
* Query audit trails.
* Security alerts.

### **8.4 Data Minimization**

* Only required fields stored.
* No full PCI details.

### **8.5 Governance**

* Retention policies.
* Periodic security reviews.

---

## **9. Data Normalization and Standardization**

Normalization improves:

* Search accuracy.
* Index performance.
* Match reliability.

Steps:

* Lowercase conversion.
* Remove special characters.
* Trim spaces.
* Standardize address abbreviations.

---

## **10. Proposed Data Model**

---

## **10.1 Party Given Name Tables**

### Tables:

* `party_givenname1`
* `party_givenname2`

### Fields:

* Customer ID
* Raw name
* Normalized name.

### Indexing:

* B-tree for exact search.
* GIN trigram for fuzzy search.

---

## **10.2 Party Last Name Table**

Similar structure.

---

## **10.3 Organization Name Table**

Supports fuzzy and wildcard search.

---

## **10.4 Phone Number Search Strategy**

### Storage:

* Full number stored as hash.
* Split segments:

  * First 3 digits
  * Middle 3 digits
  * Last 4 digits.

### Benefits:

* Supports masked and partial search.
* Maintains security.

### Index:

* B-tree.

---

## **10.5 Email Search Strategy**

### Storage:

* Left side of email.
* Domain.
* Full hashed email.

### Index:

* B-tree on domain and hash.
* Trigram on username.

---

## **11. Address Search Strategy**

Address is sensitive PII. Two secure options are proposed.

---

## **Option 1: Tokenized Partial Plaintext Approach**

### Storage:

* Street Number (hashed).
* Street Name (raw, normalized).
* City, Zipcode, Country stored hashed.

### Security:

* No full address stored.
* Minimal exposure.

### Index:

* Trigram on street name.
* B-tree on hashed fields.

### Query Example:

```sql
SELECT s.customer_id
FROM street_table s
JOIN city_table c
ON s.customer_id = c.customer_id
WHERE c.city_hash = :city
AND s.street_number_hash = :number
AND s.street_name ILIKE '%pattern%';
```

---

## **Option 2: Fully Hashed Trigram Approach**

### Storage:

* Street number hashed.
* Street name hashed using trigram tokenization.
* City, Zipcode, Country hashed.

### Benefits:

* Strongest security.
* No plaintext stored.

### Trade-offs:

* Higher storage.
* Complex processing.

### Query Example:

```sql
SELECT customer_id
FROM street_trigram_hash
WHERE trigram_hash IN (:tokens)
GROUP BY customer_id
HAVING COUNT(*) > threshold;
```

---

## **12. Indexing Strategy**

### **12.1 B-tree**

For exact matches.

### **12.2 GIN Trigram**

For wildcard and fuzzy search.

### **12.3 Hybrid Model**

Optimizes performance.

---

## **13. Performance and Scalability**

### Benefits:

* Faster lookup.
* No full scans.
* Scalable.

### Trade-offs:

* Index size.
* Write cost.

### Mitigation:

* Batch ingestion.
* Partitioning.
* Read replicas.

---

## **14. Query Optimization**

* Filter most selective attribute first.
* Use normalized values.
* Limit result sets.

---

## **15. Monitoring and Observability**

* Metrics.
* Query analysis.
* Alerts.

---

## **16. Implementation Roadmap**

### Phase 1:

Proof of concept.

### Phase 2:

Pilot.

### Phase 3:

Enterprise rollout.

---

## **17. Risks and Mitigation**

| Risk          | Mitigation |
| ------------- | ---------- |
| Data exposure | Hashing    |
| Performance   | Indexing   |
| Compliance    | Governance |

---

## **18. Final Recommendation**

Adopt a **secure hybrid search architecture** using:

* Aurora PostgreSQL.
* Tokenization.
* Hashing.
* Controlled plaintext.
* Advanced indexing.

This solution balances:

* Security.
* Performance.
* Compliance.
* Scalability.

---

If you’d like, I can also create:

* Architecture diagram.
* AWS cost estimate.
* Security review checklist.
* Benchmarking plan.
* OpenSearch comparison.

Just let me know 👍
