# Hotel Data Merge Service

## Overview

This project is a service for merging hotel data from multiple suppliers, cleaning the data, and exposing it through API endpoints. The service is built using Node.js with Express and TypeScript, and it utilizes Redis for caching responses.

## Table of Contents

- [Hotel Data Merge Service](#hotel-data-merge-service)
  - [Overview](#overview)
  - [Table of Contents](#table-of-contents)
  - [Data Merge Strategy](#data-merge-strategy)
  - [Setup](#setup)
    - [Bringing Up Docker Compose](#bringing-up-docker-compose)
    - [Stopping Docker Compose](#stopping-docker-compose)
  - [Testing](#testing)
    - [Installing Dependencies](#installing-dependencies)
    - [Running Unit Tests](#running-unit-tests)
    - [Running Integration Tests](#running-integration-tests)
    - [Running API tests](#running-api-tests)
- [API Endpoints](#api-endpoints)
  - [GET /api/hotels](#get-apihotels)
    - [Query Parameters](#query-parameters)
  - [GET /api/hotels/:id](#get-apihotelsid)
    - [URL Parameters](#url-parameters)

## Data Merge Strategy

The service merges hotel data from three different suppliers. The merge strategy follows these steps:

1. **Fetch Data from Suppliers**: The service queries each supplier's API and retrieves hotel data.
2. **Filter Successful Responses**: Using `Promise.allSettled`, the service filters out any failed API requests, focusing only on successful ones.
3. **Normalize and Merge Data**: The data from each supplier is normalized into a standard format. Amenities and images are deduplicated, and preference is given to longer or more detailed descriptions when merging.
4. **Caching**: The merged data is cached in Redis with a Time-To-Live (TTL) to reduce the load on the supplier APIs for repeated requests.
5. **Filtering**: The service allows filtering of the data by `destinationId` and specific `hotelIds`.
6. **Pagination**: The service supports pagination by allowing clients to specify a page number and a limit for the number of hotels returned. This ensures that only a subset of the results is returned at a time, which is useful for managing large datasets and improving response times.
## Setup
### Bringing Up Docker Compose

To bring up the application and its dependencies (including Redis), use Docker Compose:

```bash
docker-compose up
```

This will start the Node.js application and Redis in detached mode.

### Stopping Docker Compose

```bash
docker-compose down
```

## Testing
### Installing Dependencies
Before running the tests, make sure all dependencies are installed:
```
npm install
```

### Running Unit Tests
Unit tests are designed to test individual components of the application in isolation. To run unit tests, use:

```bash
npm test
```

### Running Integration Tests
Integration tests check the interaction between components, including the use of external services like Redis. To run integration tests, use:

```bash
npm run test:integration
```
This command will bring up the necessary Docker services (Redis) and execute only the tests in the tests/integration/ folder.

### Running API tests
execute #.http files inside the http folder

# API Endpoints
## GET /api/hotels
Fetches a list of hotels based on destinationId and/or hotelIds.

### Query Parameters
- `destinationId` (optional): Filter hotels by destination ID.
- `hotelIds` (optional): Comma-separated list of hotel IDs to filter.
- `page` (optional): Page number for pagination (default: 1).
- `limit` (optional): Number of results per page (default: 10).

## GET /api/hotels/:id
Fetches details of a single hotel by its ID.

### URL Parameters
id (required): The ID of the hotel to retrieve.
