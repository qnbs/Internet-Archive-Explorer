# Security Policy

## Supported Versions

Only the latest commit on `main` is actively supported.

| Version | Supported |
|---------|-----------|
| `main`  | ✅        |

## Reporting a Vulnerability

**Please do not open a public GitHub issue for security vulnerabilities.**

Use GitHub's private advisory system:

1. Go to the [Security tab](https://github.com/qnbs/Internet-Archive-Explorer/security/advisories/new)
2. Click **"Report a vulnerability"**
3. Fill in the details: affected component, reproduction steps, potential impact

**Response SLA:** Triage within 72 hours. A fix or mitigation plan within 14 days for confirmed high/critical issues.

## Scope

This is a client-side PWA that communicates with the [Internet Archive API](https://archive.org) and optionally Google APIs (Gemini AI, OAuth). The following are in scope:

- XSS via unsanitized content rendered from external APIs
- Auth token leakage (OAuth PKCE flow, Gemini API key storage)
- Service Worker cache poisoning
- CSP bypasses

The Internet Archive API itself is out of scope — report those directly to archive.org.
