# TaniasBank API

A mini FinTech-style backend built with Node.js, PostgreSQL, Docker, and Playwright.
This project was built to demonstrate backend fundamentals and API test automation for junior QA/automation roles.
Testing strategy: (health/db-health, auth flows, negative paths, DB reset)

## Tech Stack
- Node.js + Express
- PostgreSQL (Dockerized)
- Playwright (API test automation)
- JWT authentication
- bcrypt password hashing

## Features
- Health & DB health checks
- User registration & login
- JWT-protected endpoints
- Automated API tests (happy + negative paths)

## Project Structure
/api        # Express API
/e2e        # Playwright API tests
/docker-compose.yml

## How to Run
```bash
docker compose up -d
cd api
npm start
e2e npm test

