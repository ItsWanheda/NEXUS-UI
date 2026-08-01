# Security Policy

## Supported Versions

The **Nexus UI** project is actively maintained, and security updates are provided only for the latest stable release.

| Version | Supported |
|---------|-----------|
| Latest Stable | ✅ |
| Development (`main`) | ✅ |
| Older Releases | ❌ |

> We strongly recommend using the latest version of Nexus UI to receive security patches, bug fixes, and performance improvements.

---

# Reporting a Vulnerability

The security of Nexus UI is important to us. If you discover a security vulnerability, please report it responsibly.

## Please Do Not

- Open a public GitHub Issue for security vulnerabilities.
- Publicly disclose the vulnerability before it has been investigated and resolved.

## How to Report

Please report vulnerabilities through one of the following methods:

- **GitHub Security Advisories** (preferred, if enabled)
- **Private communication with the project maintainer**
- **Email** (if a security contact is provided)

When submitting a report, please include:

- A clear description of the vulnerability
- Steps to reproduce the issue
- A proof of concept (if applicable)
- The affected version of Nexus UI
- Your operating system and browser
- Any relevant screenshots or logs

## Response Timeline

We aim to:

| Stage | Target Time |
|--------|-------------|
| Initial acknowledgement | Within 48 hours |
| Initial assessment | Within 5 business days |
| Status updates | At least once per week |
| Security fix (if confirmed) | As soon as reasonably possible |

Please note that response times may vary depending on the complexity and severity of the reported issue.

---

# Responsible Disclosure

We kindly ask that you:

- Allow reasonable time for the issue to be investigated and resolved.
- Avoid publicly disclosing vulnerabilities until a fix has been released.
- Refrain from exploiting vulnerabilities beyond what is necessary to demonstrate the issue.
- Respect the privacy and security of all users.

---

# Scope

This policy covers security issues affecting Nexus UI, including but not limited to:

- Cross-Site Scripting (XSS)
- Cross-Site Request Forgery (CSRF)
- Dependency vulnerabilities
- Sensitive data exposure
- Insecure configuration
- Supply chain risks
- Build and deployment security
- Any vulnerability that could compromise users of Nexus UI

Reports that do not present a demonstrable security impact may be closed as non-security issues.

---

# Dependency Security

To help keep Nexus UI secure, users are encouraged to:

- Keep dependencies up to date.
- Regularly run `npm audit`.
- Review dependency updates before deploying to production.
- Use supported versions of Node.js.

---

# Acknowledgements

We sincerely appreciate responsible disclosure from security researchers and community members who help improve the security of Nexus UI.

Thank you for helping make Nexus UI more secure for everyone.
