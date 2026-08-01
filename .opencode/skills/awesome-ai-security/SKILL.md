---
name: awesome-ai-security
description: Curated list of AI Security resources for pentesters, bug hunters, and security researchers. Covers prompt injection, adversarial ML, LLM jailbreaking, AI-powered pentesting, model security, data poisoning, privacy extraction, and AI red teaming.
argument-hint: "[topic or skill name]"
license: MIT
metadata:
  author: gmh5225
  version: "1.0.0"
  source: https://github.com/gmh5225/awesome-ai-security
  sub_skills: 5
---

# Awesome AI Security

Curated AI security resources for pentesters, bug hunters, and security researchers. Contains 5 sub-skills covering AI security attack and defense domains.

## Sources

Full README with 700+ resource links: `C:\Users\falco\AppData\Local\Temp\opencode\awesome-ai-security\README.md`

Sub-skills in `references/`:
- `adversarial-ml/SKILL.md` — Adversarial examples, data poisoning, model backdoors, evasion attacks
- `ai-pentesting/SKILL.md` — AI-powered pentesting tools, red teaming frameworks, autonomous security agents
- `llm-attacks/SKILL.md` — LLM prompt injection, jailbreaking, data extraction
- `overview/SKILL.md` — Repository overview and contribution guidelines
- `tooling/SKILL.md` — AI security tooling: detectors, analyzers, guardrails, benchmarks

## When to Use This Skill

Use when working on any AI/LLM security topic:

### LLM Security
- Prompt injection (direct, indirect, system prompt extraction)
- Jailbreaking (DAN, character roleplay, multi-turn manipulation, token smuggling)
- LLM vulnerability assessment with Garak, PromptGuard, Vigil
- OWASP LLM Top 10 (2025) compliance

### Adversarial ML
- Adversarial examples (white-box, black-box, transferability)
- Data poisoning (label flipping, clean-label, gradient-matching)
- Model backdoors and trojans
- Evasion attacks and privacy attacks (MIA, model inversion)
- Defenses: adversarial training, certified robustness, differential privacy

### AI Pentesting & Red Teaming
- LLM-powered pentesting agents (PentestGPT, HackingBuddyGPT)
- AI red teaming frameworks (Counterfit, PyRIT, PurpleLlama)
- MCP security tools
- AI-assisted vulnerability discovery

### Model Security
- Abliteration and censorship removal
- Model scanning (ModelScan, LLM Guard)
- Jailbreak detection (Nova Framework)
- AI-generated text detection

## Key Resources Reference

See `references/full-readme.md` for the complete curated list organized by:
- AI/LLM Guide (foundations, from-scratch tutorials, awesome lists)
- AI Security & Attacks (prompt injection, adversarial attacks, poisoning, privacy, model security)
- AI Pentesting & Red Teaming (AI-powered pentesting, red teaming frameworks)
- AI Security Tooling (detectors, analyzers, benchmarks, guardrails)
- AI Security Frameworks & Standards
- Infra & Platform Security
- Conference Talks & News
- Responsible AI & Safety

## Quick Reference — Key Frameworks & Tools

| Category | Tools |
|----------|-------|
| LLM Vulnerability Scanning | Garak (NVIDIA), PromptGuard, Vigil, Llamator |
| Adversarial ML | ART (IBM), TextAttack, CleverHans, Foolbox |
| AI Pentesting | PentestGPT, PyRIT (Microsoft), PurpleLlama (Meta) |
| Model Defense | LLM Guard, ModelScan, Nova Framework |
| Jailbreak Detection | Nova, AIDR-Bastion |
| Prompt Injection Defense | Rebuff, Vigil, Prompt Guard |
| AI Red Teaming | Counterfit, Garak, PyRIT |

## OWASP LLM Top 10 (2025)

1. LLM01 — Prompt Injection
2. LLM02 — Insecure Output Handling
3. LLM03 — Training Data Poisoning
4. LLM04 — Model Denial of Service
5. LLM05 — Supply Chain Vulnerabilities
6. LLM06 — Sensitive Information Disclosure
7. LLM07 — Insecure Plugin Design
8. LLM08 — Excessive Agency
9. LLM09 — Overreliance
10. LLM10 — Model Theft
