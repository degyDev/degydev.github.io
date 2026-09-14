// Factual contributions: GitConnected CV, retrieved 2026-09-14.
// Domain diagrams explain relationships, not proprietary implementation details.
const cv = {
  label: "Career source / full CV",
  url: "https://gitconnected.com/degydev/resume",
};
export const cases = {
  fintech: {
    label: "Ashid Capital / February 2023–present",
    title: "Financial systems. Human decisions.",
    intro:
      "Senior full-stack engineering across credit scoring, collateral-loan management and the Simple.mn platform. The work combines application development with architecture and technical leadership.",
    sections: [
      {
        title: "The problem",
        text: "Financial products need more than an application screen: scoring, loan workflows and collateral management need to work together as usable software.",
      },
      {
        title: "What I owned and contributed",
        items: [
          "Led credit-scoring system development.",
          "Developed code for collateral-loan management.",
          "Contributed to the creation of Simple.mn.",
          "Led teams of 3–7 developers, including frontend and mobile developers.",
          "Designed architecture and reusable components.",
        ],
      },
      {
        title: "Engineering focus",
        text: "Coordinate work across frontend, mobile and backend development while keeping the system understandable and maintainable. The public CV supports these responsibilities; implementation details and business metrics are not publicly documented.",
      },
      {
        title: "Technology context",
        text: "Java and Spring Boot for backend development; React, HTML, CSS and JavaScript for frontend work; Oracle and APEX for the database environment.",
      },
    ],
    flow: [
      "Application",
      "Credit assessment",
      "Lending workflow",
      "Loan & collateral management",
    ],
    sources: [cv, { label: "Simple.mn", url: "https://simple.mn/" }],
  },
  welfare: {
    label: "Public services / January 2020–February 2023",
    title: "A better connection to welfare services.",
    intro:
      "ehalamj.mn aims to deliver welfare and pension services using citizen information already held by government, reducing the need for paper documents.",
    sections: [
      {
        title: "The problem",
        text: "People should not have to repeatedly supply paper records when the information needed for a service is already available within government.",
      },
      {
        title: "My contribution",
        text: "Built full-stack functionality for ehalamj.mn at the Information Technology Center of Customs, Taxation and Finance, using React, Material UI and Spring Boot.",
      },
      {
        title: "Engineering context",
        text: "The project sits at the intersection of citizen-facing workflows and existing public information. Its technical interest is the connection between a usable service interface, backend processing and information held across systems.",
      },
      {
        title: "Technology context",
        text: "React and Material UI on the frontend; Java and Spring Boot on the backend; SQL, HTML, CSS and JavaScript in the public project record.",
      },
    ],
    flow: [
      "Citizen request",
      "Welfare service",
      "Government information",
      "Digital processing",
    ],
    sources: [cv, { label: "ehalamj.mn", url: "https://ehalamj.mn/" }],
  },
  integrations: {
    label: "Public infrastructure / November 2019–February 2023",
    title: "One ecosystem. Many connections.",
    intro:
      "Contributed to parts of Mongolia’s eBarimt ecosystem, connecting receipt registration with several other public-service workflows.",
    sections: [
      {
        title: "Selected systems",
        items: [
          "eBarimt: automated VAT receipt registration for purchases.",
          "QR.Ebarimt: QR-based receipt registration.",
          "1072.Ebarimt: Erdenes Tavan Tolgoi share integration, websites and request module.",
          "Support-aid request management during COVID restrictions.",
          "UB Smart Card integration and implementation.",
        ],
      },
      {
        title: "My role",
        text: "Full-stack development at the Information Technology Center of Customs, Taxation and Finance. Contributed to the wider platform and built websites and the request module for the 1072 share system.",
      },
      {
        title: "Engineering context",
        text: "Each integration connects an existing system with a different public-service workflow. The public record establishes project participation and technology use, but does not describe private data models, protocols or infrastructure.",
      },
      {
        title: "Technology context",
        text: "Java, JavaScript, SQL, HTML and CSS are listed across the public project records.",
      },
    ],
    flow: [
      "Receipts / QR",
      "eBarimt ecosystem",
      "Shares / aid / transport integrations",
    ],
    sources: [cv, { label: "ebarimt.mn", url: "https://ebarimt.mn/" }],
  },
};
