Great 👍. Below is a **high-quality, Confluence-ready Aurora Serverless PostgreSQL cost structure** based on your assumptions and your **multi-table secure search architecture for 90M customers**. I’ve structured this like a solution architect / cloud finance document so it will be strong in review.

---

# **20. AWS Aurora Serverless PostgreSQL Cost Structure for ECI Secure Search**

This section provides a detailed cost model for deploying the proposed ECI secure search architecture using **AWS Aurora Serverless PostgreSQL (v2)** in the Canada Central region. The estimates consider the expected scale of approximately **90 million customer records**, hybrid indexing, and high read workload.

---

## **20.1 Why Aurora Serverless PostgreSQL**

Aurora Serverless is recommended for this use case because:

* Automatic scaling based on query load.
* Cost efficiency during low traffic periods.
* No manual capacity planning.
* High availability and compliance.
* Better suitability for unpredictable search workloads.

This architecture is primarily **read-heavy**, making Serverless an optimal choice.

---

## **20.2 Assumptions for Cost Model**

| Parameter          | Value                                         |
| ------------------ | --------------------------------------------- |
| Customers          | 90 million                                    |
| Search workload    | Moderate to high                              |
| Peak search window | Business hours                                |
| Write pattern      | Batch + incremental                           |
| Region             | ca-central-1                                  |
| Availability       | Multi-AZ                                      |
| Storage            | Hybrid tokenized + hashed                     |
| Indexing           | B-tree + GIN + trigram                        |
| Tables             | Multiple (names, address, phone, email, etc.) |
| Compliance         | PCI / PII                                     |

---

## **20.3 Data Size Estimation per Table**

Below is an estimated storage size for each search index table. These are approximate values and depend on normalization and hashing.

### **1. Given Name Tables**

Includes:

* Raw normalized text.
* Trigram indexes.

| Component  | Estimate  |
| ---------- | --------- |
| Data size  | ~4–5 GB   |
| Index size | ~8–10 GB  |
| Total      | ~12–15 GB |

Two tables:
👉 **Total = 24–30 GB**

---

### **2. Last Name Table**

| Component | Estimate |
| --------- | -------- |
| Data      | 4–5 GB   |
| Index     | 8–10 GB  |
| Total     | 12–15 GB |

---

### **3. Organization Name Table**

Typically larger due to longer strings.

| Component | Estimate |
| --------- | -------- |
| Data      | 6–8 GB   |
| Index     | 10–15 GB |
| Total     | 16–23 GB |

---

### **4. Phone Number Table**

Hashed + segmented.

| Component | Estimate |
| --------- | -------- |
| Data      | 5 GB     |
| Index     | 5 GB     |
| Total     | 10 GB    |

---

### **5. Email Table**

| Component | Estimate |
| --------- | -------- |
| Data      | 6 GB     |
| Index     | 8 GB     |
| Total     | 14 GB    |

---

### **6. Address Tables**

#### Option 1 (Partial plaintext)

| Component | Estimate |
| --------- | -------- |
| Data      | 6–8 GB   |
| Index     | 10–12 GB |
| Total     | 16–20 GB |

#### Option 2 (Hashed trigram)

| Component | Estimate |
| --------- | -------- |
| Data      | 10–12 GB |
| Index     | 20–25 GB |
| Total     | 30–37 GB |

---

## **20.4 Total Storage Estimate**

### **Option 1**

👉 Approximate:
**92 – 110 GB**

### **Option 2**

👉 Approximate:
**106 – 130 GB**

---

## **20.5 Aurora Serverless Storage Cost**

Aurora storage in Canada Central is approximately:

👉 **$0.13 – $0.15 CAD per GB per month**

### **Monthly Storage Cost**

| Scenario | Cost      |
| -------- | --------- |
| Option 1 | $12 – $17 |
| Option 2 | $15 – $20 |

This includes:

* Data
* Indexes
* Redundancy.

---

## **20.6 Compute Cost (Aurora Capacity Units – ACU)**

Aurora Serverless v2 pricing depends on:

* Minimum ACU
* Maximum ACU
* Average load.

### **Recommended Configuration**

| Setting | Value |
| ------- | ----- |
| Min ACU | 2     |
| Max ACU | 16    |

### **Expected Usage**

Moderate workload:

* Average ACU ~4–6.

Aurora Serverless pricing:
👉 Approx **$0.12 – $0.14 per ACU-hour**

### Monthly Estimate:

| ACU           | Cost        |
| ------------- | ----------- |
| Average 5 ACU | $430 – $520 |

---

## **20.7 Query Cost**

Aurora does not charge per query directly. Cost depends on:

* CPU usage.
* Memory.
* IO.

For search workloads:

* Cost is embedded in ACU usage.

Estimated contribution:
👉 $150 – $250 within the ACU compute.

---

## **20.8 Index Maintenance Cost**

Includes:

* VACUUM.
* Autovacuum.
* REINDEX.
* GIN index cleanup.

Additional compute overhead:
👉 $50 – $100.

Mitigation:

* Scheduled maintenance windows.
* Partitioning.
* Bulk load.

---

## **20.9 Backup and Snapshot Cost**

Aurora backup:

* Included up to storage size.
* Additional retention extra.

Estimated:
👉 $15 – $30.

---

## **20.10 Total Monthly Aurora Serverless Cost**

### **Option 1 (Recommended)**

| Category    | Cost        |
| ----------- | ----------- |
| Storage     | $12 – $17   |
| Compute     | $430 – $520 |
| Maintenance | $50 – $100  |
| Backup      | $15 – $30   |

👉 **Total: $510 – $670 CAD**

---

### **Option 2 (Fully hashed)**

| Category    | Cost        |
| ----------- | ----------- |
| Storage     | $15 – $20   |
| Compute     | $450 – $550 |
| Maintenance | $70 – $120  |
| Backup      | $20 – $40   |

👉 **Total: $555 – $730 CAD**

---

## **20.11 Cost Optimization Opportunities**

### Short-Term

* Start with Option 1.
* Use lower ACU minimum.

### Medium-Term

* Partition tables.
* Reduce index footprint.

### Long-Term

* Caching layer.
* Query optimization.

---

## **20.12 Cost vs Value Justification**

The cost is justified by:

* Faster customer lookup.
* Reduced operational risk.
* Improved fraud detection.
* Regulatory compliance.

---

## **20.13 Future Cost Growth**

Expected growth drivers:

* Data volume.
* Query traffic.
* Additional fields.

Mitigation:

* Partitioning.
* Tiered storage.
* Archival.

---

If you want, I can also provide:

* 3-year projection.
* Cost comparison vs OpenSearch.
* Performance benchmarking.
* ROI model.
* Capacity planning.

Just let me know 👍
Got it 👍 — you want a **single cost structure table** (not the DB schema table), showing:

✔ Size
✔ TPS
✔ Query performance
✔ Compute
✔ Storage
✔ Index
✔ Maintenance
✔ Backup
✔ Total cost

So that business can easily compare and understand.

Here is a **clean, Confluence-ready cost structure table** based on:

* Aurora Serverless PostgreSQL v2
* 90M records
* 1 TPS steady
* Canada Central
* Hybrid indexing (B-tree + trigram)
* Moderate wildcard + fuzzy search

---

# **22. Aurora Serverless PostgreSQL Cost Structure (ECI Secure Search)**

---

## **22.1 Overview**

The following cost model estimates the total monthly expense for the proposed secure search architecture using Aurora Serverless PostgreSQL. This includes storage, indexing, compute, maintenance, and operational overhead.

This model assumes a **steady 1 TPS search workload** with moderate wildcard and fuzzy matching.

---

## **22.2 Cost Structure Summary Table**

| Category                  | Details                      | Assumptions        | Estimated Monthly Cost (CAD) |
| ------------------------- | ---------------------------- | ------------------ | ---------------------------- |
| **Data Volume**           | Customer search index        | 90M records        | Included in storage          |
| **Raw Data Size**         | Normalized searchable fields | 32–36 GB           | Included                     |
| **Index Size**            | GIN trigram + B-tree         | 40–50 GB           | Included                     |
| **Total Database Size**   | Data + indexes               | 75–90 GB           | —                            |
| **Storage Cost**          | Aurora replicated storage    | $0.13–0.15 per GB  | **$10 – $13**                |
| **Baseline Compute**      | Aurora Serverless ACU        | Min 2 ACU          | **$160 – $220**              |
| **Average Compute**       | 1 TPS search workload        | Avg 3–4 ACU        | **$280 – $360**              |
| **Peak Scaling**          | Burst during business hours  | Up to 6 ACU        | Included in average          |
| **Query Processing Cost** | CPU, memory, IO              | Embedded in ACU    | Included                     |
| **Wildcard & Fuzzy Cost** | Trigram search               | Moderate workload  | Included                     |
| **Index Maintenance**     | Autovacuum, cleanup          | GIN overhead       | **$30 – $50**                |
| **Backup & Snapshot**     | Retention and recovery       | 7–30 days          | **$10 – $20**                |
| **Monitoring & Logging**  | CloudWatch metrics           | Query logs         | **$20 – $40**                |
| **KMS Encryption**        | Encryption operations        | Keys + API usage   | **$10 – $20**                |
| **High Availability**     | Multi-AZ                     | Included in Aurora | Included                     |
| **Security & Compliance** | IAM, VPC, audit              | PCI-ready          | Included                     |
| **Operational Overhead**  | Maintenance and tuning       | Minimal            | Included                     |

---

## **22.3 Total Estimated Monthly Cost**

👉 **$520 – $760 CAD per month**

---

## **22.4 Performance Characteristics**

| Metric                | Expected             |
| --------------------- | -------------------- |
| Query latency (exact) | 50–150 ms            |
| Wildcard search       | 200–600 ms           |
| Fuzzy search          | 400–900 ms           |
| Concurrency           | 50+ parallel queries |
| Scaling               | Automatic            |
| Failover              | Seconds              |
| Availability          | 99.99%               |

---

## **22.5 TPS and Scaling Behavior**

### **1 TPS steady workload**

Aurora Serverless scales dynamically:

| Load Scenario | ACU     |
| ------------- | ------- |
| Idle          | 2 ACU   |
| Normal 1 TPS  | 3–4 ACU |
| Burst         | 6 ACU   |

Aurora charges only for consumed capacity.

---

## **22.6 Cost Drivers**

Primary drivers include:

* Trigram index workload.
* Query complexity.
* Peak bursts.
* Data growth.

---

## **22.7 Cost Optimization Opportunities**

* Cache frequent searches.
* Reduce trigram scope.
* Partition tables.
* Lower ACU minimum.
* Query tuning.

---

## **22.8 Future Growth Cost Projection**

As customer data increases:

* Storage grows linearly.
* Compute grows based on search volume.
* Aurora Serverless automatically scales.

---

## **22.9 Cost vs Value Justification**

The solution enables:

* Faster customer lookup.
* Improved fraud and risk detection.
* Better compliance.
* Reduced operational overhead.
* Scalable growth.

---

If you want, I can also provide:

* A comparison vs OpenSearch.
* Cost at 5 TPS and 10 TPS.
* Detailed ACU calculation model.
* ROI and business impact analysis.
* Break-even vs manual search.

Just let me know 👍
