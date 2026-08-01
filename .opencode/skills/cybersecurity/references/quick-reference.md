# Quick Reference

## Common Security Tool Categories

| Category | Tools |
|----------|-------|
| Network Scanning | nmap, masscan, rustscan, zmap |
| Packet Analysis | Wireshark, tshark, tcpdump, Scapy |
| Web Testing | Burp Suite, OWASP ZAP, nikto, sqlmap, ffuf |
| Cloud Auditing | Prowler (AWS), ScubaGoggles (GCP), Azure Scout |
| Container Security | Trivy, Falco, kube-bench, kube-hunter, dockle |
| Memory Forensics | Volatility3, Rekall, LiME |
| Disk Forensics | Autopsy, Sleuth Kit, KAPE, Plaso |
| Windows Forensics | Hayabusa, Chainsaw, EZTools |
| AD Security | BloodHound CE, Certipy, NetExec, Impacket |
| Malware Analysis | Ghidra, IDA Pro, CAPA, FLOSS, Cuckoo Sandbox |
| OSINT | theHarvester, SpiderFoot, Maltego, Shodan |
| Threat Intel | MISP, OpenCTI, Yeti |
| SIEM | Splunk, Elastic, Wazuh, Sentinel |
| C2 Frameworks | Sliver, Havoc, Covenant, Mythic |
| IAM Tools | ROADtools, Stormspotter, AzureHound |
| Cryptography | OpenSSL, GPG, Vault, certbot |
| Vulnerability Scanning | Nessus, OpenVAS, Qualys, Nuclei |

## Common MITRE ATT&CK Techniques by Category

### Initial Access (TA0001)
- T1566 - Phishing
- T1190 - Exploit Public-Facing Application
- T1078 - Valid Accounts
- T1133 - External Remote Services

### Execution (TA0002)
- T1059 - Command and Scripting Interpreter
- T1204 - User Execution
- T1047 - Windows Management Instrumentation

### Persistence (TA0003)
- T1547 - Boot or Logon Autostart Execution
- T1053 - Scheduled Task/Job
- T1098 - Account Manipulation

### Privilege Escalation (TA0004)
- T1548 - Abuse Elevation Control Mechanism
- T1068 - Exploitation for Privilege Escalation

### Credential Access (TA0006)
- T1003 - OS Credential Dumping
- T1558 - Steal or Forge Kerberos Tickets
- T1056 - Input Capture
- T1555 - Credentials from Password Stores

### Discovery (TA0007)
- T1087 - Account Discovery
- T1069 - Permission Groups Discovery
- T1057 - Process Discovery
- T1046 - Network Service Discovery

### Lateral Movement (TA0008)
- T1021 - Remote Services
- T1550 - Use Alternate Authentication Material
- T1570 - Lateral Tool Transfer

### Command and Control (TA0011)
- T1071 - Application Layer Protocol
- T1573 - Encrypted Channel
- T1095 - Non-Application Layer Protocol

### Exfiltration (TA0010)
- T1041 - Exfiltration Over C2 Channel
- T1567 - Exfiltration Over Web Service
- T1537 - Transfer Data to Cloud Account

## Common Ports Reference

| Port | Protocol | Service |
|------|----------|---------|
| 21 | TCP | FTP |
| 22 | TCP | SSH |
| 23 | TCP | Telnet |
| 25 | TCP | SMTP |
| 53 | TCP/UDP | DNS |
| 80 | TCP | HTTP |
| 88 | UDP | Kerberos |
| 110 | TCP | POP3 |
| 135 | TCP | RPC |
| 137-139 | TCP/UDP | NetBIOS |
| 143 | TCP | IMAP |
| 389 | TCP/UDP | LDAP |
| 443 | TCP | HTTPS |
| 445 | TCP | SMB |
| 636 | TCP | LDAPS |
| 1433 | TCP | MSSQL |
| 1521 | TCP | Oracle DB |
| 2049 | TCP/UDP | NFS |
| 3306 | TCP | MySQL |
| 3389 | TCP | RDP |
| 5432 | TCP | PostgreSQL |
| 5900 | TCP | VNC |
| 6379 | TCP | Redis |
| 8080 | TCP | HTTP-Proxy |
| 8443 | TCP | HTTPS-Alt |
| 27017 | TCP | MongoDB |

## Common OWASP Top 10 (2021)

| ID | Category |
|----|----------|
| A01 | Broken Access Control |
| A02 | Cryptographic Failures |
| A03 | Injection |
| A04 | Insecure Design |
| A05 | Security Misconfiguration |
| A06 | Vulnerable and Outdated Components |
| A07 | Identification and Authentication Failures |
| A08 | Software and Data Integrity Failures |
| A09 | Security Logging and Monitoring Failures |
| A10 | Server-Side Request Forgery |
