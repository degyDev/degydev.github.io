# Current source precedence — 3D foundation

On 15 September 2026 the public JSON endpoint at https://gitconnected.com/api/v1/resume/degydev was retrieved directly. The normalized snapshot is checked in as data/resume.json. The foundation uses its literal ISO dates; several are one month later than the rendered-CV dates in the historical notes below. Current roles: Ritus June 2017–April 2019; Mongolian Properties September–November 2019; public IT center December 2019–March 2023; Ashid Capital and parallel freelance March 2023–present. Case-study dates now use the same snapshot.

The JSON also provides project library lists absent from the prior scrape; these are included in the full resume. The invalid yearsOfExperience value (8001) and internal account identifiers are excluded. See docs/3d-foundation.md for normalization and freshness rules. The following records describe the earlier SVG-only version and its sources.

# Content provenance

Reviewed 14 September 2026. The supplied brief also acts as a first-party career source.

## Public sources

- [GitConnected CV](https://gitconnected.com/degydev/resume): retrieved successfully with Firecrawl. Source snapshot is in the ignored `.firecrawl/gitconnected.com-degydev-resume.md`.
- [GitHub](https://github.com/degydev): retrieved successfully. Confirms the public account; does not establish ownership of private employer systems.
- [LinkedIn](https://www.linkedin.com/in/degydev/): attempted through browsing and Firecrawl; unavailable to automated retrieval. No additional career claims are attributed to it.
- Existing repository `index.html`: provides the email address, Stack Overflow profile and legacy career history.

## Verified role chronology

| Role                           | Organization                                                  | Dates in CV                 |
| ------------------------------ | ------------------------------------------------------------- | --------------------------- |
| FullStack Developer            | Ritus LLC                                                     | May 2017–March 2019         |
| FullStack Developer            | Mongolian Properties                                          | August–October 2019         |
| FullStack Developer            | Information Technology Center of Custom, Taxation and Finance | November 2019–February 2023 |
| Senior FullStack Engineer      | Ashid Capital LLC                                             | February 2023–present       |
| Full Stack Developer, contract | Freelance                                                     | February 2023–present       |

The overlapping freelance role is explicitly labeled parallel. The website follows the public CV's current dates rather than inventing a later departure or implying independent work replaced employment. “Architect” and “Technical Lead” describe the documented architecture and leadership responsibilities; the employment title remains Senior Full-Stack Engineer.

## Project and skill grounding

- Ashid Capital: Java, Spring Boot, React, Oracle/APEX; led teams of 3–7 including frontend and mobile developers; led credit-scoring development; developed collateral-loan code; contributed to Simple.mn.
- ehalamj.mn: React, Material UI, Spring Boot; welfare/pension processing using existing government citizen information. Project dates January 2020–February 2023.
- eBarimt: participation in VAT receipt registration, QR registration, 1072 Erdenes Tavan Tolgoi integration, COVID support requests and UB Smart Card integration. Each description uses contribution language rather than claiming sole authorship.
- Ritus: PHP CRM/HRM, DISC assessment system, Delphi/Chromium integration.
- Mongolian Properties: Avy.mn marketplace, Symfony and AWS.
- Freelance: requirements, full-stack applications, architecture through deployment, security, maintainability and documented handoffs. The CV repeats employer-related fintech work in this section; it is not presented as additional independent projects.
- Angular, TypeScript, JavaScript and Node.js appear in the CV. MariaDB/MySQL, Redis, Docker, messaging and cloud tooling come from the user's explicit brief. These are not assigned to specific projects without supporting evidence.
- Education: Mongolian University of Science and Technology, BSc Computer Science 2013–2017; MSc Computer Science 2017–2022.

## Editorial boundaries

The architecture visuals are original conceptual illustrations. They show understandable domain relationships, not verified internal services, deployment topology, request order or confidential data flows. Case notes label that distinction explicitly.

No invented user counts, financial outcomes, latency improvements or performance metrics. Older numbers in the original portfolio are not reused. No unsupported certifications, client logos, current availability claim or additional employment history.
