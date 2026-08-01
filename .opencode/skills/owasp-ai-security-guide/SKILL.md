---
name: owasp-ai-security-guide
description: OWASP AI Exchange — the definitive 300+ page guide on AI security and privacy. Covers AI threats, controls, risk analysis, testing, privacy, and compliance mapped to ISO/IEC and EU AI Act. Official liaison partner for AI Act and ISO standards.
argument-hint: "[threat, control, or topic]"
license: CC-BY-4.0
metadata:
  author: OWASP AI Exchange (Rob van der Veer)
  source: https://github.com/OWASP/www-project-ai-security-and-privacy-guide
  website: https://owaspai.org
  docs_count: 10
---

# OWASP AI Security & Privacy Guide

The OWASP AI Exchange — the go-to comprehensive resource for AI security and privacy with over 300 pages of practical advice. Official liaison partner for the EU AI Act and ISO/IEC standards.

## Sources

Website: https://owaspai.org
Repository: `C:\Users\falco\AppData\Local\Temp\opencode\owasp-ai-security-guide`
Local reference docs: `references/docs/`
Homepage overview: `references/homepage.md`

Reference documents:
- `ai_security_overview.md` — Introduction, threat matrix, controls overview, risk analysis
- `1_general_controls.md` — Governance, data limitation, unwanted behavior controls
- `2_threats_through_use.md` — Input threats: prompt injection, evasion, denial of service
- `3_development_time_threats.md` — Data poisoning, supply chain, model backdoors
- `4_runtime_application_security_threats.md` — Runtime conventional security threats
- `5_testing.md` — AI security testing methodologies
- `6_privacy.md` — AI privacy: GDPR, data protection, copyright
- `ai_security_index.md` — Clickable index of all topics (A-Z)
- `ai_security_references.md` — Reference links and further reading

## When to Use This Skill

Use when working on any aspect of AI security, privacy, or compliance:

### AI Threat Modeling
- Understanding the AI threat landscape (ALL AI types: analytical, discriminative, generative, heuristic)
- Agentic AI security threats
- Threat matrix and periodic table of AI security
- Risk analysis methodology

### AI Security Controls
- Governance controls (policies, roles, risk management)
- Data limitation and minimization
- Limiting unwanted model behavior
- Input validation and sanitization for AI systems
- Runtime application security for AI
- Continuous validation and monitoring

### AI Development Security
- Secure ML pipeline design
- Training data security and poisoning prevention
- Model supply chain security
- Secure fine-tuning practices
- Model alignment and safety

### AI Privacy
- GDPR compliance for AI systems
- Data protection in model training and inference
- Membership inference prevention
- Copyright and IP protection
- Privacy-preserving ML (federated learning, differential privacy)

### AI Testing
- LLM red teaming methodology
- Adversarial testing
- Bias and fairness testing
- Continuous validation strategies

### Compliance
- EU AI Act compliance
- ISO/IEC AI standards
- NIST AI RMF alignment
- Regulatory readiness

## Key Threat Categories

| Category | Examples |
|----------|----------|
| Input Threats | Prompt injection (direct/indirect), evasion, denial of model service |
| Development-time Threats | Data poisoning, supply chain, model backdoors, unauthorized copying |
| Runtime Threats | Conventional app sec, model theft, excessive agency |
| Privacy Threats | Data extraction, membership inference, model inversion, copyright |

## Key Control Categories

| Category | Examples |
|----------|----------|
| Governance | Policies, risk management, compliance, explainability |
| Data Controls | Limitation, minimization, quality, provenance |
| Behavior Controls | Alignment, output filtering, usage policies |
| Development Controls | Pipeline security, testing, supply chain management |
| Runtime Controls | Authentication, monitoring, rate limiting, access control |
| Privacy Controls | Differential privacy, federated learning, anonymization |

## Quick Reference — Periodic Table Structure

The OWASP AI Exchange organizes threats and controls into a periodic table format:
- **Rows** = threat categories (input, development-time, runtime, privacy)
- **Columns** = control categories (governance, data, behavior, development, runtime, privacy)
- **Cells** = specific threat-control pairings with detailed guidance
