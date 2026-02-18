Below is a **Confluence-ready structure + filled-out content** you can paste and propose as an **“ECI Search” solution on AWS** (search over PCI/PII fields that are encrypted in S3).

---

## 1. Page Title

**ECI Search on AWS – Secure PCI/PII Search Enablement (PostgreSQL-Based Indexing)**

---

## 2. Executive Summary

### Background

Customer data is stored in **Amazon S3** where **PCI/PII fields are encrypted**. Business requires **search by PCI/PII attributes** such as:

* First Name, Last Name
* Address (AddressLine, City, Zipcode, Country)
* **Wildcard search** (e.g., “*john*”)
* **Lookalike / fuzzy search** (e.g., “Jhon” ≈ “John”, partial address matches)

### Core Problem

Encrypted values (ciphertext) **cannot support wildcard / fuzzy** matching in a database using normal indexes. Therefore, direct “LIKE/ILIKE” search on encrypted columns is not feasible.

### Proposal

Create a **minimal “Search Index Database” in AWS PostgreSQL** that stores **only the required PCI/PII fields in plaintext** (or controlled format) strictly for search, under strong security controls. The rest of the customer record remains in S3 encrypted form.

---

## 3. Business Goals and Success Criteria

### Goals

* Enable fast search by FirstName/LastName/Address fields
* Support **exact + partial + fuzzy** search
* Keep PCI/PII exposure minimized and compliant
* Provide auditability, access controls, and operational governance

### Success Criteria (example targets)

* Exact match queries: **< 200ms p95**
* Wildcard queries (ILIKE %…%): **< 500–1500ms p95** depending on selectivity
* Fuzzy queries (trigram/similarity): **< 1–2s p95** for common workloads
* Meet security controls (encryption, IAM, audit logs, least privilege)

---

## 4. Constraints / Assumptions

* PCI/PII in S3 remains encrypted (KMS-managed keys)
* Search must be performed on PCI/PII attributes
* Current compliance restrictions: cannot keep full customer profile in plaintext in DB
* Target scale: (fill yours) e.g. **90M customers**, daily incremental updates, etc.

---

## 5. Current State

### Data Flow Today

* Customer master data stored in S3
* PCI/PII fields encrypted at source / ingestion
* Consumers cannot do wildcard/fuzzy search without decrypting the dataset externally (too slow + risky)

### Key Gaps

* No searchable index for encrypted PCI/PII
* Operational search is slow and requires insecure workarounds

---

## 6. Options Considered (with Recommendation)

### Option A – Search directly on encrypted values (Rejected)

* Wildcard/fuzzy search not possible on ciphertext
* Deterministic encryption helps equality match only, not fuzzy/wildcard

### Option B – Build OpenSearch/Elasticsearch index with plaintext (Possible, but heavier)

* Strong search features
* More operational overhead + relevance tuning + ingestion pipeline complexity
* Still requires storing plaintext PCI/PII in index → similar compliance concerns

### Option C – PostgreSQL “Search Index DB” (Recommended)

* Controlled relational store + powerful indexing extensions
* Strong access control + audit + encryption at rest
* Lower operational overhead than full text search platforms for this use-case
* Can support wildcard/fuzzy effectively using **pg_trgm** and **GIN** indexes

**Recommendation: Option C** because it balances **security, cost, maintainability, and performance**.

---

## 7. Proposed Solution Overview

### High-Level Architecture (AWS)

1. **S3 (System of Record)**

   * Stores full customer record
   * PCI/PII encrypted via KMS

2. **Ingestion + Index Build Pipeline**

   * Decrypt only required PCI/PII fields in a controlled compute layer
   * Normalize + load into PostgreSQL search tables
   * Keep mapping to customer identifier (customer_id / external_id)

3. **PostgreSQL Search Index DB (RDS or Aurora PostgreSQL)**

   * Stores **only fields needed for search**
   * Applies indexes for exact/wildcard/fuzzy
   * Returns **customer_id / key** (not full profile)

4. **Application Search API**

   * Authenticated internal service that queries Postgres
   * Returns result identifiers
   * Downstream systems fetch full record from S3 (with proper authorization)

---

## 8. Data Model Proposal (Recommended Practical Model)

> Your idea suggests separate tables for each field (FName table, LName table…). That works, but it increases joins and complexity. For performance and simplicity, a **single “search index” table** is usually best.

### Table: `customer_pii_search_index`

Stores minimal PCI/PII for search + reference ID.

Example columns:

* `customer_id` (PK / unique)
* `first_name_raw`
* `last_name_raw`
* `address_raw` (combined line1 + line2 optional)
* `city`
* `zipcode`
* `country`
* `created_at`, `updated_at`
* Optional: precomputed normalized fields (`*_norm`) for case/space removal

If you **must** separate, you can still keep your layout:

* `fname_index(customer_id, first_name_raw, first_name_norm)`
* `lname_index(customer_id, last_name_raw, last_name_norm)`
* `address_index(customer_id, address_raw, city, zipcode, country, address_norm)`

But the **single table** avoids multi-table joins on every search.

---

## 9. Indexing Strategy (Best Index + Why)

### Key Requirement

Support:

* Exact match: `first_name = 'John'`
* Wildcard: `first_name ILIKE '%ohn%'`
* Lookalike: similarity search (John vs Jhon)
* Address partial matches (street fragment, city fragment, etc.)

### Best Index Choice: **GIN index with pg_trgm**

**PostgreSQL extension:** `pg_trgm`
**Index type:** `GIN` trigram index on text columns

Why this index?

* **B-tree** indexes are great for exact match and prefix matches (`'john%'`) but **not** for contains search (`'%ohn%'`)
* **GIN + trigram** indexes accelerate:

  * `ILIKE '%text%'`
  * `LIKE '%text%'`
  * `similarity()` / `%` operator for fuzzy matches
* Works well at large scale when properly tuned and with selective queries

### What you’ll use for each search type

1. **Exact match**

   * `BTREE` index on normalized fields (fastest, smallest)
2. **Wildcard contains**

   * `GIN (column gin_trgm_ops)` index
3. **Lookalike / fuzzy**

   * `GIN trigram` + similarity threshold

### Example SQL (Confluence code block)

```sql
-- Enable extension
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Core table
CREATE TABLE customer_pii_search_index (
  customer_id   BIGINT PRIMARY KEY,
  first_name_raw TEXT,
  last_name_raw  TEXT,
  address_raw    TEXT,
  city           TEXT,
  zipcode        TEXT,
  country        TEXT,
  first_name_norm TEXT,
  last_name_norm  TEXT,
  address_norm    TEXT,
  updated_at     TIMESTAMP DEFAULT now()
);

-- Exact match (fast equality)
CREATE INDEX idx_fname_norm_btree ON customer_pii_search_index (first_name_norm);
CREATE INDEX idx_lname_norm_btree ON customer_pii_search_index (last_name_norm);

-- Wildcard + fuzzy (contains + similarity)
CREATE INDEX idx_fname_trgm_gin ON customer_pii_search_index USING GIN (first_name_raw gin_trgm_ops);
CREATE INDEX idx_lname_trgm_gin ON customer_pii_search_index USING GIN (last_name_raw gin_trgm_ops);
CREATE INDEX idx_addr_trgm_gin  ON customer_pii_search_index USING GIN (address_raw gin_trgm_ops);

-- Optional: composite for common filters (city/country)
CREATE INDEX idx_city_country_btree ON customer_pii_search_index (city, country);
```

### Query patterns

```sql
-- Exact
SELECT customer_id
FROM customer_pii_search_index
WHERE first_name_norm = 'john';

-- Wildcard contains
SELECT customer_id
FROM customer_pii_search_index
WHERE first_name_raw ILIKE '%ohn%';

-- Lookalike (fuzzy similarity)
SELECT customer_id
FROM customer_pii_search_index
WHERE similarity(first_name_raw, 'Jhon') > 0.4
ORDER BY similarity(first_name_raw, 'Jhon') DESC
LIMIT 50;

-- Address fragment
SELECT customer_id
FROM customer_pii_search_index
WHERE address_raw ILIKE '%main st%'
  AND city ILIKE '%toronto%';
```

---

## 10. Performance and Efficiency Discussion (Business-Friendly)

### Why this is efficient

* **B-tree** handles exact matches cheaply
* **GIN trigram** enables fast contains/fuzzy searches without scanning all rows
* GIN index avoids full table scans for `%pattern%` queries that would otherwise be extremely expensive at 90M rows

### What impacts performance

* Search selectivity (how common the name is)
* Query limits (top 50/100)
* Proper normalization (lowercasing, trimming, removing punctuation)
* Index maintenance overhead (GIN indexes are larger and cost more writes)

### Expected trade-offs (transparent)

* **Writes become heavier** (because GIN indexes must update)
* **Storage increases** (GIN trigram indexes can be large)
* Still usually a strong trade-off when read/search is the priority

### Scaling techniques (recommended)

* Partition table by a stable key (optional): hash partition on `customer_id`
* Connection pooling (RDS Proxy / pgBouncer)
* Read replicas for read-heavy search
* Cache top searches if applicable (Redis/ElastiCache) – optional

---

## 11. Security, Compliance, and Risk Controls (Critical Section)

Because you are proposing plaintext PCI/PII in DB, this section is what business/security will focus on.

### Data Minimization

* Store only fields required for search (no PAN, no full payment details, no DOB unless required)
* Store only the minimum address components needed

### Encryption

* RDS/Aurora storage encryption using **KMS**
* Encrypted backups + encrypted snapshots
* TLS enforced in transit

### Access Control

* DB in private subnets (no public access)
* IAM authentication (where possible) or strong secrets management
* Least privilege: only Search API can query
* Separate roles for DBA vs application access
* Row-level security (optional, if multi-tenant)

### Monitoring & Audit

* CloudWatch logs + PostgreSQL audit logging
* VPC Flow Logs
* Alerting on abnormal query volumes / suspicious access patterns

### Retention

* Retain PII index only as long as required
* Regular purge of inactive customers (policy-driven)

### Key Risk & Mitigation (state clearly)

**Risk:** Plaintext PCI/PII exists in DB
**Mitigation:** Strict access + network isolation + audit + minimal schema + no direct user access + encryption + security approvals

---

## 12. Data Ingestion / Sync Design

### Batch Load

* Initial backfill from S3 historical objects
* Use controlled compute (AWS Glue / ECS / EMR) with KMS decrypt permission
* Write only PCI/PII fields to Postgres index table

### Incremental Updates

Choose based on your upstream:

* If updates are event-driven: S3 event → SQS → Lambda/ECS → Postgres upsert
* If updates are in a stream: Kinesis/Kafka → consumer → Postgres upsert
* If updates are stored in DynamoDB metadata: scan/segment + delta processing (scheduled)

### Idempotency

* Upserts keyed by `customer_id`
* Track `updated_at` and versioning if required

---

## 13. Search API Contract (What Business Gets)

### Example API

* `GET /eci-search?fname=john&lname=doe&addr=main&city=toronto`
* Returns:

  * `customer_id` list
  * match confidence (for fuzzy)
  * result count + paging tokens

### Data returned

* Return **identifiers only** (avoid exposing PII in response)
* Only authorized service can fetch full record from S3

---

## 14. Operational Model

* Backups: daily snapshots + PITR enabled
* Failover: Multi-AZ
* Maintenance windows + index vacuum strategy
* Cost drivers:

  * DB size (data + GIN index)
  * write rate (incremental sync)
  * read rate (search traffic)

---

## 15. Implementation Plan (Phases)

### Phase 1 – POC (2–3 weeks equivalent plan)

* Build small dataset subset
* Implement pg_trgm indexes
* Benchmark: exact vs wildcard vs fuzzy queries
* Validate security controls

### Phase 2 – MVP (4–8 weeks)

* Full ingestion pipeline
* Search API + auth
* Monitoring + audit logs

### Phase 3 – Scale & Optimize

* Partitioning if needed
* Read replicas
* Query tuning, thresholds for fuzzy matches

---

## 16. Open Questions / Decisions Needed

* What exact PCI/PII fields are allowed in plaintext index DB?
* Data retention period for the index?
* Who can access Search API and under what justification?
* Expected peak QPS and query patterns?
* Approval from Security/Compliance for plaintext “search index” store?

---

## 17. Appendix

### Normalization logic (recommended)

* Lowercase
* Trim spaces
* Remove punctuation
* Standardize abbreviations in address (St, Street, Rd, Road)

### Example normalization

```sql
UPDATE customer_pii_search_index
SET first_name_norm = lower(regexp_replace(first_name_raw, '\s+', '', 'g')),
    last_name_norm  = lower(regexp_replace(last_name_raw,  '\s+', '', 'g')),
    address_norm    = lower(regexp_replace(address_raw,    '[^a-zA-Z0-9 ]', '', 'g'));
```

---
