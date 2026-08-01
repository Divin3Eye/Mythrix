<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:cybersecurity-skill -->
# Cybersecurity & Backend Security Rules

When the user's request involves any of the following, you MUST load the cybersecurity skill first via `skill("cybersecurity")` before making changes:

## Backend Features
- Authentication / authorization (JWT, OAuth, sessions, API keys, tokens)
- API design (REST endpoints, GraphQL, WebSockets)
- Input validation, sanitization, output encoding
- Database operations, query building, ORM usage
- File upload / storage handling
- Secrets and environment variable management
- Error handling and logging
- Rate limiting and DDOS protection
- CORS, CSP, security headers
- Session management and cookies

## Security-Related Features
- Any mention of "secure", "security", "vulnerability", "exploit", "attack", "protection"
- Dependency scanning, package vulnerabilities
- Encryption, hashing, certificates, TLS/SSL
- Cloud infrastructure security (AWS, Azure, GCP)
- Container/Docker/Kubernetes security
- CI/CD pipeline security
- Compliance (HIPAA, SOC2, GDPR, PCI-DSS, NIST)
- Threat modeling or risk assessment

## Skill Location
The cybersecurity skill is at `.opencode/skills/cybersecurity/SKILL.md`.
The full 817-skill library is cloned at `C:\Users\falco\AppData\Local\Temp\opencode\cybersec-skill\skills\`.

Load it with: `skill("cybersecurity")`
<!-- END:cybersecurity-skill -->

<!-- BEGIN:awesome-ai-security -->
# AI Security Resources

When the user's request involves any of the following, load the awesome-ai-security skill via `skill("awesome-ai-security")`:

- LLM / generative AI security (prompt injection, jailbreaking, model extraction)
- Adversarial machine learning (adversarial examples, data poisoning, model backdoors)
- AI-powered pentesting or red teaming
- Model security (abliteration, jailbreak detection, model scanning)
- AI security tooling selection (Garak, PyRIT, PurpleLlama, ART, etc.)
- OWASP LLM Top 10 implementation

The skill is at `.opencode/skills/awesome-ai-security/SKILL.md`.
The full resource list is at `C:\Users\falco\AppData\Local\Temp\opencode\awesome-ai-security\README.md`.
<!-- END:awesome-ai-security -->

<!-- BEGIN:owasp-ai-security-guide -->
# OWASP AI Security & Privacy Guide

When the user's request involves any of the following, load the owasp-ai-security-guide skill via `skill("owasp-ai-security-guide")`:

- AI threat modeling or risk analysis
- AI security controls and governance
- EU AI Act or ISO/IEC AI compliance
- AI privacy (GDPR, data protection, copyright)
- AI testing methodology (red teaming, bias testing, continuous validation)
- Agentic AI security threats
- Input validation / sanitization for AI systems
- Training data security and supply chain for ML pipelines
- Runtime security for AI applications

The skill is at `.opencode/skills/owasp-ai-security-guide/SKILL.md`.
The full guide is at `C:\Users\falco\AppData\Local\Temp\opencode\owasp-ai-security-guide`.
Live website: https://owaspai.org
<!-- END:owasp-ai-security-guide -->
