Below is a **Confluence-ready, solution-architecture level rewrite** of your concept — structured for executive + engineering audience, security reviewers, and compliance stakeholders.

---

# 🔐 ECI Secure Search Architecture Proposal

**Author:** Solution Architecture Team
**Audience:** Engineering, Security, Compliance, Architecture Review Board
**Status:** Proposal

---

# 1. Overview

## 1.1 Objective

This document proposes a **secure, compliant, and scalable search architecture** for ECI’s encrypted customer data platform.

Currently:

* Customer data is stored in **Amazon S3**
* Data is **field-level encrypted**
* Data is treated as **immutable**
* Search capability is required across PII attributes
* Wildcard and fuzzy/lookup search is currently not possible

The purpose of this proposal is to:

* Enable **wildcard search**
* Enable **lookalike/fuzzy search**
* Maintain **security and compliance posture**
* Support scale (90M+ records)
* Preserve immutability principles

---

# 2. Current State

## 2.1 Data Storage Model

* Immutable customer records stored in S3
* Field-level encryption applied to PII
* Encrypted values stored as ciphertext

Example:

| Field        | Stored Value            |
| ------------ | ----------------------- |
| lastName     | `AES256_ENCRYPTED(...)` |
| addressLine1 | `AES256_ENCRYPTED(...)` |

---

# 3. Problem Statement

Encrypted fields prevent:

* ❌ Wildcard search (`LIKE '%smith%'`)
* ❌ Partial search (`street LIKE 'mai%'`)
* ❌ Fuzzy / lookalike search
* ❌ Case-insensitive matching
* ❌ Address normalization search

Because:

Encryption produces non-deterministic ciphertext.
Even identical plaintext values do not produce identical ciphertext (depending on mode/IV).

Therefore:

> Traditional indexing and search techniques cannot operate directly on encrypted fields.

We need a solution that enables search **without compromising PII security**.

---

# 4. Solution Overview

This document proposes:

1. **Option 1 — Plaintext PII Search Index Table**
2. **Option 2 — Searchable Symmetric Encryption (SSE) using Hashed n-grams**
3. **Hybrid Approach — Risk-balanced architecture**

---

# 5. Option 1 – Plaintext PII Search Index Table

## 5.1 Concept

Create a **separate PII Search Index table** that stores selected searchable fields in raw (unencrypted) format.

Fields proposed:

* firstName
* lastName
* orgName
* addressLine1
* addressLine2
* addressLine3
* city
* zipCode
* province
* country

These are extracted from encrypted S3 records and stored separately.

---

## 5.2 Architecture Flow

1. Encrypted record stored in S3
2. Secure processing layer decrypts fields
3. Searchable attributes extracted
4. Inserted into PII Search Index table
5. Indexed using B-Tree or GIN/trigram indexes

---

## 5.3 Pros

* ✅ Very fast search performance
* ✅ Native wildcard search supported
* ✅ Trigram indexing possible
* ✅ Simplified query model
* ✅ Easy to implement
* ✅ Supports fuzzy search

---

## 5.4 Cons

* ❌ PII stored in plaintext
* ❌ Increased compliance burden
* ❌ Higher audit and access control complexity
* ❌ Expanded attack surface
* ❌ Violates “encrypt everywhere” posture

---

## 5.5 Security Considerations

If adopted, must include:

* Strict RBAC
* Column-level access control
* Encryption at rest
* VPC-only access
* Audit logging
* Tokenization where possible

---

# 6. Option 2 – Searchable Symmetric Encryption (SSE)

This option allows searching encrypted data **without exposing plaintext values**.

---

# 6.1 Concept: Hashed n-gram Technique (n = 3)

## What is an n-gram?

An n-gram is a sequence of n characters.

For:

```
StreetName = "MAINE"
```

Trigrams (n=3):

* MAI
* AIN
* INE

---

## 6.2 Secure Tokenization Using HMAC

Each trigram is transformed using:

```
token = HMAC(secret_key, ngram)
```

Example:

| ngram | HMAC(k, ngram) |
| ----- | -------------- |
| MAI   | a91f82...      |
| AIN   | 992abc...      |
| INE   | 7bd221...      |

These hashed tokens are stored — NOT the plaintext.

Because:

* HMAC is deterministic
* Same trigram → same hash
* Enables search
* Cannot reverse without key

---

# 6.3 Two Implementation Variants

---

# 6.3.a Variant A — Hashed Tokens Stored as Separate Rows

## Table Structure

| record_id | token_hash |
| --------- | ---------- |
| 1001      | HMAC(MAI)  |
| 1001      | HMAC(AIN)  |
| 1001      | HMAC(INE)  |

---

## Index Required

```sql
CREATE INDEX idx_token_hash ON pii_search_tokens(token_hash);
```

---

## Query Example

Searching for:

```
"AIN"
```

Application computes:

```
HMAC(k, "AIN")
```

Query:

```sql
SELECT record_id 
FROM pii_search_tokens
WHERE token_hash = '992abc...';
```

---

## Pros

* ✅ Fully encrypted searchable index
* ✅ No plaintext storage
* ✅ Fine-grained matching
* ✅ Secure by design
* ✅ Easy to scale horizontally

---

## Cons

* ❌ Large row explosion (90M records × avg 30 tokens)
* ❌ Index size grows significantly
* ❌ Higher storage cost
* ❌ Query may require multiple joins

---

# 6.3.b Variant B — Hashed Tokens Stored as Array (Single Row)

## Table Structure

| record_id | token_array           |
| --------- | --------------------- |
| 1001      | {hash1, hash2, hash3} |

---

## Index Required

GIN Index:

```sql
CREATE INDEX idx_token_array 
ON pii_search_index 
USING GIN (token_array);
```

---

## Query Example

```sql
SELECT record_id
FROM pii_search_index
WHERE token_array @> ARRAY['992abc...'];
```

---

## Pros

* ✅ Fewer rows
* ✅ Better storage efficiency
* ✅ Faster read performance
* ✅ Cleaner schema
* ✅ Works well with Postgres GIN

---

## Cons

* ❌ GIN index memory heavy
* ❌ Large array fields increase page size
* ❌ Slightly slower inserts
* ❌ Complex maintenance at scale

---

# 7. Comparison: Option 1 vs Option 2

| Criteria                  | Option 1 (Plaintext) | Option 2 (SSE) |
| ------------------------- | -------------------- | -------------- |
| Security                  | Low                  | High           |
| Compliance Risk           | High                 | Low            |
| Performance               | Very High            | Moderate       |
| Storage Cost              | Moderate             | High           |
| Implementation Complexity | Low                  | High           |
| Regulatory Approval       | Difficult            | Easier         |

---

# 8. Hybrid Approach (Recommended Strategy)

This balances:

* Performance
* Compliance
* Operational complexity

---

## 8.1 Hybrid Design

### Store as Plaintext (Low Risk Fields)

* firstName
* lastName
* orgName
* city
* zipCode
* province
* country

Stored in single searchable table with standard indexing.

---

### Store Using SSE (High Risk Fields)

* addressLine1
* addressLine2
* addressLine3

Stored using hashed n-gram approach (Option 2).

---

## 8.2 Why Hybrid Works

* Names and city are commonly searchable
* Addresses are higher sensitivity
* Reduces token explosion
* Reduces compliance exposure
* Improves performance

---

# 9. Scalability Considerations (90M+ Records)

Key design requirements:

* Partition tables by hash or region
* Use Aurora Serverless v2 or managed Postgres
* Monitor GIN index size
* Background token generation pipeline
* Immutable write-once token strategy

---

# 10. Security Controls (Mandatory)

Regardless of option:

* KMS-managed encryption keys
* Key rotation policy
* IAM least privilege
* Audit logs
* VPC isolation
* Data access monitoring
* Security review by compliance team

---

# 11. Recommendation

For a high-security enterprise environment:

> Adopt the Hybrid Approach.

This delivers:

* Search capability
* Controlled risk
* Regulatory defensibility
* Scalable performance

---

# 12. Next Steps

1. Security review
2. Compliance sign-off
3. POC with 5M sample dataset
4. Storage + index sizing validation
5. TPS performance benchmark
6. Production rollout plan

---

If required, I can next provide:

* 🔹 Detailed cost modeling for 90M records
* 🔹 TPS performance comparison
* 🔹 Full DDL schema
* 🔹 Sequence diagrams
* 🔹 Threat modeling section
* 🔹 Aurora cost estimation
* 🔹 Query benchmark simulations

Let me know which section you want expanded for your Confluence presentation.
