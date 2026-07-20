# Mobile RGB COD Analysis System

An auxiliary chemical oxygen demand (COD) analysis system based on mobile RGB image data. The WeChat Mini Program collects and displays data; an independent Node.js service owns validation, range selection, calibration calculation, outlier handling, and measurement persistence.

> Related paper: **Real-time Visualized Rapid Analysis of Chemical Oxygen Demand (COD) Based on Mobile RGB Images and a WeChat Mini Program**. Add the authors, venue, publication year, and CNKI/DOI link before publishing.

## Architecture

```text
WeChat Mini Program
       | HTTPS / JSON
       v
Independent COD Service (Node.js)
       |- request validation and range selection
       |- versioned calibration formulas
       |- average / outlier calculation
       `- measurement record persistence
```

## Features

- Validates RGB values in the range 0-255.
- Supports automatic or manual high/low-range selection.
- Executes COD calibration formulas on the server and returns the formula version.
- Calculates the average of up to ten measurements after median-based outlier filtering.
- Provides health checks, measurement APIs, automated API tests, and Docker support.

## Repository Layout

```text
miniprogram/                 WeChat Mini Program client
  config.js                  Service base URL for local development
  pages/index-main/          COD calculation page
server/                      Independent backend service
  src/algorithm.js           Calibration formulas and version
  src/validation.js          API input validation
  src/storage.js             Persistence adapter
  src/app.js                 HTTP server and routes
  test/                      API tests
```

## Run Locally

### Start the backend

Node.js 18+ is required.

```bash
cd server
npm test
npm start
```

The service listens on `http://127.0.0.1:3000` by default. Check it with `GET /health`.

### Configure the Mini Program

`miniprogram/config.js` defaults to `http://127.0.0.1:3000`. For development in WeChat DevTools, temporarily disable request-domain validation.

For a real device or production deployment, configure an HTTPS domain that has been added to the Mini Program request allowlist:

```js
apiBaseUrl: 'https://api.example.com'
```

Then import the repository root with WeChat DevTools.

### Run with Docker

```bash
docker build -t cod-analysis-service ./server
docker run --rm -p 3000:3000 cod-analysis-service
```

## API

### Calculate COD

`POST /api/v1/cod/calculate`

```json
{ "r": 1, "g": 2, "b": 11, "range": "auto" }
```

`range` accepts `auto`, `high`, or `low`. The response contains `cod`, `range`, and `formulaVersion`.

### Calculate an average

`POST /api/v1/cod/average`

```json
{ "values": [18.2, 18.6, 18.4], "range": "high" }
```

The service uses the median and a range-specific threshold to reject outliers, then returns the average, accepted values, and rejected count.

### Measurement records

- `POST /api/v1/measurements`: calculate and store an RGB measurement.
- `GET /api/v1/measurements`: retrieve recent measurement records.

The demo uses `server/data/measurements.json`; this runtime directory is ignored by Git. Replace it with MySQL or PostgreSQL and migrations for a production system.

## Security and Production Notes

- Do not commit `project.private.config.json`, cloud environment IDs, production domains, database passwords, or tokens.
- Add WeChat login verification, rate limiting, structured logging, monitoring, and HTTPS before public deployment.
- Calibration formulas are valid only for their corresponding experimental conditions and calibration ranges. This project is an auxiliary analysis tool and does not replace laboratory testing.

## Roadmap

1. Replace JSON persistence with MySQL and versioned calibration-coefficient tables.
2. Authenticate WeChat users and isolate their measurement records.
3. Add Redis rate limiting, caching, metrics, and alerting.
4. Keep the REST API contract and replace the Node.js service with a C++ implementation (Drogon or Boost.Beast) when higher performance is required; the Mini Program will not need to change.
