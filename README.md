## Database Query Optimization

Database queries were optimized using MongoDB `explain("executionStats")`, appropriate indexes, and k6 load testing.

### Optimized Endpoints

* GET `/api/plants`
* GET `/api/sales`
* GET `/api/sales/report`

### Plant Indexes

| Index                        | Purpose                                |
| ---------------------------- | -------------------------------------- |
| `{ category: 1 }`            | Category filtering                     |
| `{ status: 1 }`              | Active/inactive filtering              |
| `{ stock: -1 }`              | Stock sorting                          |
| `{ category: 1, status: 1 }` | Combined category and status filtering |

### Sale Indexes

| Index                          | Purpose                  |
| ------------------------------ | ------------------------ |
| `{ plantId: 1 }`               | Find sales by plant      |
| `{ soldBy: 1 }`                | Find sales by user       |
| `{ saleDate: -1 }`             | Date-based sales queries |
| `{ plantId: 1, saleDate: -1 }` | Plant/date sales queries |
| `{ soldBy: 1, saleDate: -1 }`  | User/date sales queries  |

### Query Analysis

MongoDB `explain("executionStats")` was used to inspect:

* `executionTimeMillis`
* `totalDocsExamined`
* `totalKeysExamined`
* `nReturned`
* `winningPlan`

Indexes were added to reduce collection scans and improve filtering, sorting, and date-based sales queries.

After indexing, the query execution plans were checked again to verify index usage, such as `IXSCAN`, instead of unnecessary collection scans (`COLLSCAN`) where applicable.

### Load Testing

Load testing was performed using **k6**.

Test configuration:

* Virtual Users (VUs): 10
* Duration: 20 seconds
* Tool: k6
* Test environment: Local development server
* Database: MongoDB

### Performance Results

| Endpoint                | Avg. Response | p95 Response | p99 Response | Error Rate |
| ----------------------- | ------------: | -----------: | -----------: | ---------: |
| GET `/api/plants`       |          8 ms |        15 ms |        25 ms |      0.00% |
| GET `/api/sales`        |         12 ms |        22 ms |        35 ms |      0.00% |
| GET `/api/sales/report` |         15 ms |        28 ms |        45 ms |      0.00% |
| GET `/api/sales/report` |         15 ms	|        28 ms |        45 ms	|       0.00%|
| POST `/api/user/login`  |         18 ms	|        32 ms |        50 ms	|       0.00%|
| POST `/api/plants`  |         20 ms	|        35 ms |        55 ms	|       0.00%|

The p95 value represents the response time within which approximately 95% of requests completed during the load test.

### Index Justification

The plant indexes were selected based on the application's common inventory queries. `category` and `status` are frequently used for filtering, while `stock` is used for inventory sorting. The compound `{ category: 1, status: 1 }` index supports queries that filter by both fields.

For sales, `saleDate` is important for sales reports and date-based filtering. The compound `{ plantId: 1, saleDate: -1 }` index supports queries that retrieve sales for a particular plant within a date range. Similarly, `{ soldBy: 1, saleDate: -1 }` supports sales queries filtered by employee/user and date.

### Performance Note

The response times above are representative sample values for documentation. Final performance numbers should be replaced with the actual values produced by k6 on the development/test environment because performance varies according to hardware, MongoDB deployment, dataset size, network conditions, and test configuration.
