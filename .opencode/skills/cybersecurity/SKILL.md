---
name: cybersecurity
description: 817 structured cybersecurity skills for AI agents mapped to 6 frameworks (MITRE ATT&CK v19.1, NIST CSF 2.0, MITRE ATLAS v5.4, D3FEND v1.3, NIST AI RMF 1.0, MITRE F3 v1.1). Covers 29 security domains including cloud security, threat hunting, DFIR, malware analysis, penetration testing, web app security, network security, identity & access management, SOC operations, red teaming, container security, API security, incident response, devsecops, zero trust, and more.
argument-hint: "[domain, technique, or skill name]"
license: Apache-2.0
metadata:
  author: mukul975
  version: "1.3.0"
  source: https://github.com/mukul975/Anthropic-Cybersecurity-Skills
  total_skills: 817
  frameworks:
    - MITRE ATT&CK v19.1
    - NIST CSF 2.0
    - MITRE ATLAS v5.4
    - D3FEND v1.3
    - NIST AI RMF 1.0
    - MITRE F3 v1.1
---

# Cybersecurity Skills

Comprehensive cybersecurity skill library with 817 structured skills across 29 security domains. Each skill includes framework mappings, prerequisites, step-by-step workflows, and verification steps following the agentskills.io standard.

## Sources

The full skill library is located at: `C:\Users\falco\AppData\Local\Temp\opencode\cybersec-skill\skills`

Each skill directory (e.g., `analyzing-network-traffic-with-wireshark/`) contains:
- `SKILL.md` — YAML frontmatter (framework IDs, tags, domain) + Markdown body (When to Use, Prerequisites, Workflow, Verification)
- `references/` — Mappings and deep technical procedures
- `scripts/` — Working helper scripts
- `LICENSE` — Apache 2.0

## When to Use This Skill

Use when the user's request involves any of the following:

### Backend Security
- Authentication / authorization implementation (JWT, OAuth, session management, API keys)
- Input validation, sanitization, output encoding
- SQL injection, XSS, CSRF, SSRF, IDOR protection
- Secure API design (REST, GraphQL, WebSocket security)
- Rate limiting, CORS, security headers (CSP, HSTS, X-Frame-Options)
- File upload validation and storage security
- Dependency/package vulnerability scanning
- Environment variable and secrets management
- Database security (encryption at rest, connection pooling, least privilege)
- Logging and monitoring (audit trails, error handling without leakage)

### Infrastructure Security
- Cloud security (AWS, Azure, GCP hardening, CSPM, cloud forensics)
- Container security (Docker, Kubernetes RBAC, image scanning, Falco, container escape prevention)
- Network security (firewall rules, VLAN segmentation, IDS/IPS, traffic analysis)
- Identity & access management (IAM, Entra ID, PAM, zero trust)
- DevSecOps (CI/CD security, Trivy IaC/image scanning, code signing, SLSA/Sigstore)
- Supply chain security (SBOMs, dependency confusion, malicious-package triage)

### Threat & Compliance
- Threat hunting hypotheses, LOTL detection, EVTX hunting, fleet hunting
- Threat intelligence (STIX/TAXII, MISP, OpenCTI, actor profiling)
- Vulnerability management (scanning workflows, patch prioritization, CVSS)
- Incident response playbooks, breach containment, ransomware response
- Digital forensics (disk/memory imaging, Hayabusa/KAPE/Plaso timelines)
- Malware analysis (static/dynamic, reverse engineering, sandboxing)
- Compliance frameworks (NIST 800-30/RMF, CMMC, HIPAA, CIS benchmarks)

### Offensive Security
- Penetration testing (network, web, cloud, mobile)
- Red teaming (ADCS/Certipy, BloodHound CE, C2 frameworks, NTLM relay)
- Web application security testing (OWASP Top 10, WAF bypass)
- API security testing
- Mobile security assessment (Android/iOS analysis, MDM forensics)
- Phishing simulation and defense
- Social engineering and OSINT
- Exploitation techniques and privilege escalation

## Skill Index by Domain

See `references/domain-index.md` for a complete domain-to-skill mapping.

| Domain | Skills | Key Capabilities |
|--------|--------|-----------------|
| Cloud Security | 66 | AWS, Azure, GCP hardening, CSPM, cloud attack emulation, cloud forensics |
| Threat Hunting | 58 | Hypothesis-driven hunts, LOTL detection, EVTX hunting, fleet hunting |
| Threat Intelligence | 52 | STIX/TAXII, MISP, OpenCTI, feed integration, actor profiling |
| Network Security | 43 | IDS/IPS, firewall rules, VLAN segmentation, traffic analysis |
| Web Application Security | 42 | OWASP Top 10, SQLi, XSS, SSRF, deserialization |
| Digital Forensics | 41 | Disk imaging, memory forensics, Hayabusa/KAPE/Plaso timelines |
| Malware Analysis | 39 | Static/dynamic analysis, reverse engineering, sandboxing |
| Identity & Access Management | 37 | Entra ID/ROADtools, device-code phishing, PAM, zero trust identity |
| SOC Operations | 35 | Playbooks, escalation workflows, Graph-log detection, tabletop exercises |
| Red Teaming | 33 | ADCS/Certipy, BloodHound CE, Sliver/Havoc C2, NTLM relay |
| Container Security | 33 | K8s RBAC, image scanning, Falco, container escape |
| Security Operations | 28 | SIEM correlation, log analysis, alert triage |
| OT/ICS Security | 28 | Modbus, DNP3, IEC 62443, historian defense, SCADA |
| API Security | 28 | GraphQL, REST, OWASP API Top 10, WAF bypass |
| Incident Response | 26 | Breach containment, ransomware response, IR playbooks |
| Vulnerability Management | 25 | Nessus, scanning workflows, patch prioritization, CVSS |
| Penetration Testing | 21 | Network, web, cloud, mobile, NetExec lateral movement |
| DevSecOps | 18 | CI/CD security, Trivy IaC/image scanning, code signing |
| Zero Trust Architecture | 17 | BeyondCorp, CISA maturity model, microsegmentation |
| Endpoint Security | 17 | EDR, LOTL detection, fileless malware, persistence hunting |
| Cryptography | 16 | TLS, Ed25519, post-quantum migration, key management |
| Phishing Defense | 15 | Email authentication, BEC detection, phishing IR |
| AI Security | 14 | LLM red-teaming (garak/PyRIT), prompt injection, MCP/agentic security |
| Mobile Security | 13 | Android/iOS analysis, mobile pentesting, MDM forensics |
| Ransomware Defense | 13 | Precursor detection, response, recovery, encryption analysis |
| Compliance & Governance | 9 | NIST 800-30/RMF, CMMC, HIPAA, TPRM, CIS benchmarks |
| Supply Chain Security | 8 | SBOMs, dependency confusion, malicious-package triage, SLSA/Sigstore |
| Deception Technology | 6 | Honeytokens, canarytokens, breach detection |
| Hardware & Firmware Security | 4 | CHIPSEC/UEFI audit, Secure Boot bypass, TPM attestation, bootkit hunting |

## How to Use Skills

### 1. Discover
Scan the frontmatter of relevant skills by searching the skills directory for matching tags, domain, or description. Each skill's frontmatter contains:
- `name` — kebab-case identifier
- `description` — keyword-rich summary
- `domain` / `subdomain` — classification
- `tags` — searchable keywords
- `mitre_attack`, `nist_csf`, `atlas_techniques`, `d3fend_techniques`, `nist_ai_rmf` — framework mappings

### 2. Load
Read the full `SKILL.md` for the matched skill(s). Each contains:
- **When to Use** — Trigger conditions and when NOT to use
- **Prerequisites** — Required tools, access levels, environment setup
- **Workflow** — Step-by-step execution with commands and decision points
- **Verification** — How to confirm successful execution

### 3. Execute
Follow the Workflow section step-by-step, referencing the `references/` and `scripts/` directories as needed.

### 4. Validate
Use the Verification section to confirm results and map findings to frameworks.

## Framework Mappings

See `references/framework-mappings.md` for detailed mappings.

- **MITRE ATT&CK v19.1** — 286 techniques across 15 tactics (including new Stealth and Defense Impairment tactics)
- **NIST CSF 2.0** — 6 functions (Govern, Identify, Protect, Detect, Respond, Recover), 22 categories
- **MITRE ATLAS v5.4** — 16 tactics, 84 techniques (AI/ML adversarial threats including agentic AI attack vectors)
- **MITRE D3FEND v1.3** — 267 defensive techniques across 7 categories (Model, Harden, Detect, Isolate, Deceive, Evict, Restore)
- **NIST AI RMF 1.0** — 4 functions (Govern, Map, Measure, Manage), 72 subcategories + GenAI Profile
- **MITRE F3 v1.1** — 8 tactics, 123 techniques (cyber-enabled financial fraud including Positioning and Monetization)

## Reference Navigation

- `references/domain-index.md` — Complete index of all 817 skills organized by domain
- `references/framework-mappings.md` — Framework-to-skill mappings (MITRE ATT&CK, NIST CSF, ATLAS, D3FEND, AI RMF, F3)
- `references/owasp-mappings.md` — OWASP Top 10 mappings for web security skills
- `references/quick-reference.md` — Common commands, tool references, and lookup tables

## Scripts

- `scripts/skill-finder.py` — Search and filter skills by domain, tags, technique ID, or keyword

## Best Practices

1. **Progressive disclosure** — Scan frontmatter first (~30 tokens each), load full skill only when matched
2. **Always check prerequisites** before executing workflows
3. **Verify results** using the Verification section of each skill
4. **Map findings to frameworks** for compliance and reporting
5. **Never use offensive skills** against systems without explicit authorization
6. **When implementing backend security features** (auth, API security, input validation, etc.), reference the relevant web/cloud/API security skills
7. **When doing infrastructure work** (Docker, Kubernetes, cloud), reference container/cloud security skills
