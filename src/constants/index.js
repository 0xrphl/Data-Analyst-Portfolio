import {
    github,
    mobile,
    backend,
    creator,
    web,
    javascript,
    typescript,
    html,
    css,
    reactjs,
    MySQL,
    tailwind,
    nodejs,
    Excel,
    git,
    figma,
    docker,
    RR,
    att,
    TCLO,
    UTP,
    carrent,
    ring,
    budget,
    threejs,
    python,
    PowerBI,
    Tableau,
    LookerStudio,
    VisualBasic,
    GoogleSheets,
    MATLAB,
    GoogleAppsScript,
    Pandas,
    Puppeteer,
    SOLIDWORKS,
    AutodeskInventor,
    ANSYS,
    C,
    Linkedinlogo,
    Solidity,
    PostgreSQL,
    Matplotlib,
    ScikitLearn,
    Numpy,
    Scipy,
    Shopify1,
    Wordpress,
    GoogleAnalytics,
    Litmus,
    MJML,
    SQLserver,
    Cryptotracker,
    CRM,
    Calendar,
    quiroga,
    quiroga2,
    CUDA,
    Scikit_image,
    PyTorch,
    TensorFlow,
    Flask,
    Streamlit,
    ECS,
    ECR,
    S3,
    EC2,
    Plotly,
    Seaborn,
    Keras,
    ollama,
    // New imports
    Anthropic,
    Gemini,
    DeepSeek,
    LangGraph,
    Gemma,
    Qwen,
    Kimi,
    HuggingFace,
    Midjourney,
    MCP,
    Neo4j,
    Pinecone,
    Milvus,
    Supabase,
    Qdrant,
    NeonDB,
    VueJS,
    FastAPI,
    Vite,
    Route53,
    ALB,
    CloudFront,
    Vercel,
    AzureAD,
    N8N,
    FireCrawler,
    Zapier,
    RDS,
  } from "../assets";
  
  // Category definitions with colors for icosahedron surfaces (darkened for 3D look)
  export const TECH_CATEGORIES = {
    "All": { color: "#2A353C", label: "All" },
    "AI & ML": { color: "#3D1A5E", label: "AI & ML" },
    "Data Science": { color: "#1A3A6B", label: "Data Science" },
    "Databases": { color: "#0A3D2E", label: "Databases" },
    "Web Dev": { color: "#0A4A5A", label: "Web Dev" },
    "Cloud & DevOps": { color: "#6B2F0A", label: "Cloud & DevOps" },
    "BI & Spreadsheets": { color: "#0A4D3A", label: "BI, Dashboards & Data Analysis" },
    "Automation": { color: "#5A3D0A", label: "Automation" },
    "Engineering": { color: "#6B1515", label: "Engineering" },
    "Other": { color: "#3A3F47", label: "Other" },
  };

  export const navLinks = {
    en: [
    {
      id: "about",
      title: "About",
    },
    {
      id: "tech",
      title: "Technologies",
    },
    {
      id: "projects",
      title: "Projects",
    },
    {
      id: "work",
      title: "Work",
    },
    {
      id: "contact",
      title: "Contact",
    },
    ],
    es: [
      {
        id: "about",
        title: "Sobre mí",
      },
      {
        id: "tech",
        title: "Tecnologías",
      },
      {
        id: "projects",
        title: "Proyectos",
      },
      {
        id: "work",
        title: "Experiencia",
      },
      {
        id: "contact",
        title: "Contacto",
      },
    ]
  };
  
  const services = {
    en: [
    {
      title: "Data Scientist",
      icon: web,
    },
    {
      title: "React, Three.js web Developer",
      icon: mobile,
    },
    {
      title: "Data & Business Analyst",
      icon: backend,
    },
    {
      title: "Prospective Mechanical Engineer",
      icon: creator,
    },
    ],
    es: [
      {
        title: "Científico de Datos",
        icon: web,
      },
      {
        title: "Desarrollador React, Three.js",
        icon: mobile,
      },
      {
        title: "Analista de Datos",
        icon: backend,
      },
      {
        title: "Ingeniero Mecánico",
        icon: creator,
      },
    ]
  };
  
  const Linkedinlog = [
    {
      title: "Linkedinlogo",
      icon: Linkedinlogo,
    },
  ];
  
  const technologies = [
    // ============ AI & ML (Purple #7B2FBE) ============
    {
      name: "TensorFlow",
      icon: TensorFlow,
      category: "AI & ML",
    },
    {
      name: "PyTorch",
      icon: PyTorch,
      category: "AI & ML",
    },
    {
      name: "Keras",
      icon: Keras,
      category: "AI & ML",
    },
    {
      name: "ScikitLearn",
      icon: ScikitLearn,
      category: "AI & ML",
    },
    {
      name: "Scikit_image",
      icon: Scikit_image,
      category: "AI & ML",
    },
    {
      name: "CUDA",
      icon: CUDA,
      category: "AI & ML",
    },
    {
      name: "Ollama",
      icon: ollama,
      category: "AI & ML",
    },
    {
      name: "Anthropic",
      icon: Anthropic,
      category: "AI & ML",
    },
    {
      name: "Gemini",
      icon: Gemini,
      category: "AI & ML",
    },
    {
      name: "DeepSeek",
      icon: DeepSeek,
      category: "AI & ML",
    },
    {
      name: "LangGraph",
      icon: LangGraph,
      category: "AI & ML",
    },
    {
      name: "Gemma",
      icon: Gemma,
      category: "AI & ML",
    },
    {
      name: "Qwen",
      icon: Qwen,
      category: "AI & ML",
    },
    {
      name: "Kimi",
      icon: Kimi,
      category: "AI & ML",
    },
    {
      name: "Hugging Face",
      icon: HuggingFace,
      category: "AI & ML",
    },
    {
      name: "Midjourney",
      icon: Midjourney,
      category: "AI & ML",
    },
    {
      name: "MCP",
      icon: MCP,
      category: "AI & ML",
    },

    // ============ Data Science (Blue #2563EB) ============
    {
      name: "Python",
      icon: python,
      category: "Data Science",
    },
    {
      name: "Pandas",
      icon: Pandas,
      category: "Data Science",
    },
    {
      name: "Numpy",
      icon: Numpy,
      category: "Data Science",
    },
    {
      name: "Scipy",
      icon: Scipy,
      category: "Data Science",
    },
    {
      name: "Matplotlib",
      icon: Matplotlib,
      category: "Data Science",
    },
    {
      name: "Seaborn",
      icon: Seaborn,
      category: "Data Science",
    },
    {
      name: "Plotly",
      icon: Plotly,
      category: "Data Science",
    },

    // ============ Databases (Green #059669) ============
    {
      name: "MySQL",
      icon: MySQL,
      category: "Databases",
    },
    {
      name: "PostgreSQL",
      icon: PostgreSQL,
      category: "Databases",
    },
    {
      name: "SQLserver",
      icon: SQLserver,
      category: "Databases",
    },
    {
      name: "Neo4j",
      icon: Neo4j,
      category: "Databases",
    },
    {
      name: "Pinecone",
      icon: Pinecone,
      category: "Databases",
    },
    {
      name: "Milvus",
      icon: Milvus,
      category: "Databases",
    },
    {
      name: "Supabase",
      icon: Supabase,
      category: "Databases",
    },
    {
      name: "Qdrant",
      icon: Qdrant,
      category: "Databases",
    },
    {
      name: "Neon DB",
      icon: NeonDB,
      category: "Databases",
    },

    // ============ Web Dev (Cyan #0891B2) ============
    {
      name: "HTML 5",
      icon: html,
      category: "Web Dev",
    },
    {
      name: "CSS 3",
      icon: css,
      category: "Web Dev",
    },
    {
      name: "JavaScript",
      icon: javascript,
      category: "Web Dev",
    },
    {
      name: "TypeScript",
      icon: typescript,
      category: "Web Dev",
    },
    {
      name: "React JS",
      icon: reactjs,
      category: "Web Dev",
    },
    {
      name: "Three JS",
      icon: threejs,
      category: "Web Dev",
    },
    {
      name: "Node JS",
      icon: nodejs,
      category: "Web Dev",
    },
    {
      name: "Tailwind CSS",
      icon: tailwind,
      category: "Web Dev",
    },
    {
      name: "Vue.js",
      icon: VueJS,
      category: "Web Dev",
    },
    {
      name: "FastAPI",
      icon: FastAPI,
      category: "Web Dev",
    },
    {
      name: "Vite",
      icon: Vite,
      category: "Web Dev",
    },
    {
      name: "Flask",
      icon: Flask,
      category: "Web Dev",
    },
    {
      name: "Streamlit",
      icon: Streamlit,
      category: "Web Dev",
    },

    // ============ Cloud & DevOps (Orange #EA580C) ============
    {
      name: "Docker",
      icon: docker,
      category: "Cloud & DevOps",
    },
    {
      name: "Git",
      icon: git,
      category: "Cloud & DevOps",
    },
    {
      name: "Github",
      icon: github,
      category: "Cloud & DevOps",
    },
    {
      name: "ECS",
      icon: ECS,
      category: "Cloud & DevOps",
    },
    {
      name: "ECR",
      icon: ECR,
      category: "Cloud & DevOps",
    },
    {
      name: "S3",
      icon: S3,
      category: "Cloud & DevOps",
    },
    {
      name: "EC2",
      icon: EC2,
      category: "Cloud & DevOps",
    },
    {
      name: "Route 53",
      icon: Route53,
      category: "Cloud & DevOps",
    },
    {
      name: "ALB",
      icon: ALB,
      category: "Cloud & DevOps",
    },
    {
      name: "CloudFront",
      icon: CloudFront,
      category: "Cloud & DevOps",
    },
    {
      name: "Vercel",
      icon: Vercel,
      category: "Cloud & DevOps",
    },
    {
      name: "Azure AD OAuth 2.0",
      icon: AzureAD,
      category: "Cloud & DevOps",
    },
    {
      name: "RDS",
      icon: RDS,
      category: "Cloud & DevOps",
    },

    // ============ BI & Spreadsheets (Teal #10B981) ============
    {
      name: "Excel",
      icon: Excel,
      category: "BI & Spreadsheets",
    },
    {
      name: "Visual Basic",
      icon: VisualBasic,
      category: "BI & Spreadsheets",
    },
    {
      name: "PowerBI",
      icon: PowerBI,
      category: "BI & Spreadsheets",
    },
    {
      name: "Tableau",
      icon: Tableau,
      category: "BI & Spreadsheets",
    },
    {
      name: "Google Sheets",
      icon: GoogleSheets,
      category: "BI & Spreadsheets",
    },
    {
      name: "Google Apps Script",
      icon: GoogleAppsScript,
      category: "BI & Spreadsheets",
    },
    {
      name: "Looker Studio",
      icon: LookerStudio,
      category: "BI & Spreadsheets",
    },
    {
      name: "Google Analytics",
      icon: GoogleAnalytics,
      category: "BI & Spreadsheets",
    },

    // ============ Automation (Yellow #CA8A04) ============
    {
      name: "Puppeteer",
      icon: Puppeteer,
      category: "Automation",
    },
    {
      name: "N8N",
      icon: N8N,
      category: "Automation",
    },
    {
      name: "FireCrawler",
      icon: FireCrawler,
      category: "Automation",
    },
    {
      name: "Zapier",
      icon: Zapier,
      category: "Automation",
    },

    // ============ Engineering (Red #DC2626) ============
    {
      name: "SOLIDWORKS",
      icon: SOLIDWORKS,
      category: "Engineering",
    },
    {
      name: "Autodesk Inventor",
      icon: AutodeskInventor,
      category: "Engineering",
    },
    {
      name: "ANSYS",
      icon: ANSYS,
      category: "Engineering",
    },
    {
      name: "MATLAB",
      icon: MATLAB,
      category: "Engineering",
    },

    // ============ Other (Gray #6B7280) ============
    {
      name: "C",
      icon: C,
      category: "Other",
    },
    {
      name: "Solidity",
      icon: Solidity,
      category: "Other",
    },
    {
      name: "Shopify",
      icon: Shopify1,
      category: "Other",
    },
    {
      name: "Wordpress",
      icon: Wordpress,
      category: "Other",
    },
    {
      name: "Litmus",
      icon: Litmus,
      category: "Other",
    },
    {
      name: "MJML",
      icon: MJML,
      category: "Other",
    },
    {
      name: "Figma",
      icon: figma,
      category: "Other",
    },
  ];
  
  const experiences = {
    en: [
    {
      title: "Assistant Chief Engineer",
      company_name: "Quiroga Law Office, PLLC",
      icon: quiroga,
      iconBg: "#fff",
      date: "Promoted in January 2025 - Present",
      points: [
        "Led the development of two full-stack web applications using Flask, integrating machine learning models with real-time client data to automate and enhance client interactions for a law firm. Utilized open-source machine learning algorithms, such as EasyOCR and OpenCV, for optical character recognition (OCR) and advanced document processing, enabling efficient data extraction and interpretation from legal documents.",
        "Developed and deployed an AI agent powered by Claude embeddings within a Retrieval-Augmented Generation (RAG) system and a VectorDB to autonomously fill out immigration forms and interact with client data. Built an AI-driven chatbot using Claude and a RAG system to analyze client data and provide personalized legal advice, customer service support, and streamlined communication, including features like user login, chat history, caching, and agent profiles.",
        "Utilized AWS services, including ECS, ECR, EC2, and S3, for seamless deployment, containerization, and storage management, enabling scalable and reliable cloud-based solutions for hosting machine learning models and applications. Employed Docker to containerize applications, ensuring consistent environments across development, testing, and production, and streamlining deployment pipelines for both Flask apps and machine learning models.",
        "Enhanced operational efficiency by automating document processing and client interactions, while ensuring secure handling of client data through encryption and adhering to best practices for data protection, all while maintaining a user-friendly interface.",
      ],
      tags: [
        {
          name: "#Pandas",
          color: "red-text-gradient",
        },
        {
          name: "#RAG",
          color: "gray-text-gradient",
        },
        {
          name: "#Flask",
          color: "pink-text-gradient",
        },
        {
          name: "#Docker",
          color: "blue-text-gradient",
        },
        {
          name: "#AWS (ECS,ECR,S3,EC2)",
          color: "orange-text-gradient",
        },
        {
          name: "#CI/CD",
          color: "gray-text-gradient",
        },
        {
          name: "#EasyOCR",
          color: "red-text-gradient",
        },
        {
          name: "#PyMyPDF",
          color: "gray-text-gradient",
        },
        {
          name: "#Matplotlib",
          color: "gray-text-gradient",
        },
        {
          name: "#PostgresSQL",
          color: "gray-text-gradient",
        },
        {
          name: "#Time Series Forecasting",
          color: "gray-text-gradient",
        },
        {
          name: "#Numpy",
          color: "gray-text-gradient",
        },
        {
          name: "#OpenCV",
          color: "gray-text-gradient",
        },
        {
          name: "#Claude 3.5 API",
          color: "green-text-gradient",
        },
        {
          name: "#VectorDB and embeddings",
          color: "yellow-text-gradient",
        },
        {
          name: "#Data Processing and Cleaning",
          color: "blue-text-gradient",
        },
        {
          name: "#CUDA",
          color: "red-text-gradient",
        },
        {
          name: "#Conditional Formatting",
          color: "pink-text-gradient",
        },
        {
          name: "#Prompt Caching",
          color: "blue-text-gradient",
        },
        {
          name: "#Prompt Chain",
          color: "orange-text-gradient",
        },
        {
          name: "#Performance Metrics",
          color: "gray-text-gradient",
        },
        {
          name: "#AI/ML Deployment",
          color: "green-text-gradient",
        },
        {
          name: "#TensorFlow",
          color: "yellow-text-gradient",
        },
        {
          name: "#PyTorch",
          color: "blue-text-gradient",
        },
        {
          name: "#Reinforcement Learning (RL)",
          color: "red-text-gradient",
        },
        {
          name: "#Transformer Architecture",
          color: "pink-text-gradient",
        },
        {
          name: "#Natural Language Processing (NLP)",
          color: "blue-text-gradient",
        },
        {
          name: "#Attention Mechanisms",
          color: "orange-text-gradient",
        },
      ],
    },
    {
      title: "Data Analyst",
      company_name: "Quiroga Law Office, PLLC",
      icon: quiroga,
      iconBg: "#fff",
      date: "April 2024 - Promoted in January 2024",
      points: [
        "Data Analysis & Visualization: Utilize Python (Pandas, Matplotlib, Seaborn) to extract, clean, and analyze data, creating insightful reports with comprehensive visualizations that highlight trends and performance patterns.",
        "Web Scraping Automation: Employ Selenium to automate data extraction from online sources, ensuring access to up-to-date information crucial for analysis.",
        "Use Excel and Power Query to maintain data integrity, transforming large datasets for usability and robust reporting outcomes.",
        "Developed a fully functional app with machine learning algorithms for forecasting, backed by a SQL database, deployed on AWS with CI/CD pipeline, Docker, ECR, and ECS for scalability and reliability; features include user management and multipage support for stakeholder insights.",
        "Utilized time series forecasting techniques to generate new growth performance indicators, providing valuable insights for future planning and decision-making.",
        "I developed a script to scan PDF repositories for duplicate pages, processing over 22,000 PDFs and 300,000 pages monthly. Using Python libraries like fitz (PyMuPDF), OpenCV, Pandas, and skimage, the script applies image processing and machine learning algorithms to detect duplicates, even with minor variations. This ensures full tracking, prevents duplicate uploads, and optimizes storage and time efficiency. Results are output in CSV format for easy review.",
      ],
      tags: [
        {
          name: "#Pandas",
          color: "red-text-gradient",
        },
        {
          name: "#Power Query",
          color: "gray-text-gradient",
        },
        {
          name: "#Streamlit",
          color: "pink-text-gradient",
        },
        {
          name: "#Docker",
          color: "blue-text-gradient",
        },
        {
          name: "#AWS (ECS,ECR,S3,EC2)",
          color: "orange-text-gradient",
        },
        {
          name: "#CI/CD",
          color: "gray-text-gradient",
        },
        {
          name: "#SCIKIT IMAGE",
          color: "red-text-gradient",
        },
        {
          name: "#PyMyPDF",
          color: "gray-text-gradient",
        },
        {
          name: "#Matplotlib",
          color: "gray-text-gradient",
        },
        {
          name: "#Plotly",
          color: "gray-text-gradient",
        },
        {
          name: "#Time Series Forecasting",
          color: "gray-text-gradient",
        },
        {
          name: "#Numpy",
          color: "gray-text-gradient",
        },
        {
          name: "#OpenCV",
          color: "gray-text-gradient",
        },
        {
          name: "#Microsoft Excel",
          color: "green-text-gradient",
        },
        {
          name: "#Python Selenium Scripting Automatization",
          color: "yellow-text-gradient",
        },
        {
          name: "#Data Processing and Cleaning",
          color: "blue-text-gradient",
        },
        {
          name: "#Pivot Tables",
          color: "red-text-gradient",
        },
        {
          name: "#Conditional Formatting",
          color: "pink-text-gradient",
        },
        {
          name: "#Excel Dashboard Design",
          color: "blue-text-gradient",
        },
        {
          name: "#Report Storytelling",
          color: "orange-text-gradient",
        },
        {
          name: "#Performance Metrics",
          color: "gray-text-gradient",
        },
      ],
    },
    {
      title: "Data Analyst",
      company_name: "Independent - Freelance service for Immigration Law Firm",
      icon: RR,
      iconBg: "#fff",
      date: "August 2023 - March 2024",
      points: [
        "Developed a Python Selenium script to automate the extraction of real-time data from a law firm's Laravel PHP website, focusing on case management metrics. Used Visual Basic for Applications (VBA) to automate downloading and querying CSV files containing case information, ensuring up-to-date data for analysis.",
        "Processed and cleaned the extracted data using Microsoft Excel, leveraging Power Query for transformation and structuring. Implemented functions to import, clean, and transform raw data into a structured format suitable for detailed analysis.",
        "Designed and implemented an interactive Excel dashboard to visualize key performance metrics such as case drafting time, status distribution, and case progression dynamics. Utilized Excel's pivot tables, charts, and conditional formatting for data visualization and analysis.",
        "Created custom PDF reports using VBA to automatically generate performance summaries and send them to management. The dashboard and reports were used in management meetings to provide insights into operational efficiency, with ongoing refinement based on feedback from stakeholders.",
      ],
      tags: [
        {
          name: "#Microsoft Excel",
          color: "green-text-gradient",
        },
        {
          name: "#Python Selenium Scripting Automatization",
          color: "yellow-text-gradient",
        },
        {
          name: "#Data Processing and Cleaning",
          color: "blue-text-gradient",
        },
        {
          name: "#Pivot Tables",
          color: "red-text-gradient",
        },
        {
          name: "#Conditional Formatting",
          color: "pink-text-gradient",
        },
        {
          name: "#Excel Dashboard Design",
          color: "blue-text-gradient",
        },
        {
          name: "#Report Storytelling",
          color: "orange-text-gradient",
        },
        {
          name: "#Performance Metrics",
          color: "gray-text-gradient",
        },
        {
          name: "#Visual Basic",
          color: "red-text-gradient",
        },
        {
          name: "#Power Query",
          color: "gray-text-gradient",
        },
      ],
    },
    {
      title: "Data Analyst and Intake Specialist",
      company_name: "The Cruz Law Office APC",
      icon: TCLO,
      iconBg: "#fff",
      date: "July 2022 - May 2024",
      points: [
        "Served as an intake and sales specialist, assessing immigration cases eligibility, retaining clients, and handling payments. Utilizing Google Apps Script, Google Calendar API, and Python Selenium automation, I developed a CRM call log tool in Google Sheets, boosting data capture by 4 times compared to previous methods. This tool expanded data variables to over 16 dimesions in the database structure for potential client metadata, including client details and interaction types like location, potential service, personal data and information regarding his legal needs and current situation.",
        "Effective communication skills were crucial in translating this data into actionable insights for management meetings, aiding informed decision-making and deeper client understanding among team members and stakeholders.",
        "A robust database was created to capture all interactions for detailed analysis and marketing insights. Integration with Looker Studio dashboard enabled seamless analysis and client segmentation. Automated report generation streamlined client acquisition processes.",
        "Integration with case management systems and Google Calendar facilitated direct creation of profiles and events from the call log. Google Apps Script automation enhanced workflow efficiency, while our unwavering focus on accountability ensured full oversight over each task assigned to virtual assistants. Transparent processes and integrated systems further reinforced our commitment to accurate reporting and efficient task management.",
      ],
      tags: [
        {
          name: "#Google Sheets",
          color: "green-text-gradient",
        },
        {
          name: "#Google Calendar API",
          color: "blue-text-gradient",
        },
        {
          name: "#Python ",
          color: "yellow-text-gradient",
        },
        {
          name: "#Google Apps Script",
          color: "red-text-gradient",
        },
        {
          name: "#Actionable Insights",
          color: "pink-text-gradient",
        },
        {
          name: "#Looker Studio",
          color: "blue-text-gradient",
        },
        {
          name: "#Report Generation",
          color: "orange-text-gradient",
        },
        {
          name: "#Accountability",
          color: "gray-text-gradient",
        },
        {
          name: "#Automatization",
          color: "green-text-gradient",
        },
      ],
    }, 
    {
      title: "Blockchain Engineer Trainee",
      company_name: "Independent - Personal projects",
      icon: RR,
      iconBg: "#fff",
      date: "March 2020 - Present",
      points: [
        "Deep understanding of cryptographic principles, including hash functions, digital signatures, and cryptographic algorithms. Proficient in secure multi-party computation (MPC), zero-knowledge proofs (ZKPs), homomorphic encryption, and blockchain consensus mechanisms like Proof of Work (PoW) and Proof of Stake (PoS), with an emphasis on network security and scalability.",
        "Advanced proficiency in Solidity, including syntax, data structures, and features. Extensive experience in developing smart contracts for DeFi applications (DEXs, lending platforms, yield farming), with a focus on security vulnerabilities and best practices.",
        "Expertise in managing ASIC hardware ownership, network validation, and setup within mining pools. Skilled in procuring, configuring, and maintaining ASIC miners for efficient PoW validation and enhancing block mining rewards.",
        "Experienced cryptocurrency trader with advanced technical analysis, fundamental evaluation, and trading strategies. Proficient in using Rust for DeFi arbitrage, Elliott Wave, liquidity analysis, and order block assessment, as well as implementing algorithmic trading strategies to manage risk and optimize profitability."
        ,
      ],
      tags: [
        {
          name: "#Crypto Hashing Algorithms",
          color: "orange-text-gradient",
        },
        {
          name: "#PoW",
          color: "green-text-gradient",
        },
        {
          name: "#Solidity",
          color: "blue-text-gradient",
        },
        {
          name: "#DeFi/DEXs",
          color: "purple-text-gradient",
        },
        {
          name: "#Risk Management",
          color: "pink-text-gradient",
        },
        {
          name: "#Rust",
          color: "gray-text-gradient",
        },
        {
          name: "#ASIC",
          color: "red-text-gradient",
        },
      ],
    },
    {
      title: "Billing and Sales Customer service specialist",
      company_name: "AT&T | Accedo Technologies",
      icon: att,
      iconBg: "#FFF",
      date: "January 2017 - February 2019",
      points: [
        "Proficient in Customer Relationship Management (CRM): Effectively managed billing and sales inquiries from AT&T customers, utilizing advanced CRM systems to navigate accounts, address concerns, and process transactions swiftly and accurately.",
        "Exceptional Communication Skills: Demonstrated strong verbal and written communication abilities in providing clear and concise explanations of billing details, sales offers, and service options to customers, fostering positive interactions and resolving issues promptly.",
        "Problem Resolution Expertise: Developed a keen aptitude for troubleshooting and resolving complex billing discrepancies, sales inquiries, and service-related issues, employing analytical thinking and resourcefulness to ensure customer satisfaction and retention.",
        "Sales and Revenue Optimization: Leveraged product knowledge and persuasive communication techniques to identify upselling and cross-selling opportunities, contributing to increased revenue generation and the achievement of sales targets within the AT&T customer service environment.",
      ],
      tags: [
        {
          name: "#Customer Service",
          color: "purple-text-gradient",
        },
        {
          name: "#Sales Support",
          color: "green-text-gradient",
        },
        {
          name: "#Communication Skills",
          color: "blue-text-gradient",
        },
        {
          name: "#Conflict Resolution",
          color: "pink-text-gradient",
        },
        {
          name: "#Data Entry",
          color: "red-text-gradient",
        },
        {
          name: "#Multitasking",
          color: "yellow-text-gradient",
        },
      ],
    },
    {
      title: "Math, Physics, and Engineering Sciences Teacher",
      company_name: "Independent",
      icon: RR,
      iconBg: "#FFF",
      date: "January 2016 - December 2020",
      points: [
        "Offered private tutoring sessions in thermodynamics, fluid mechanics, and materials science to university engineering students, catering to diverse college students from various colleges and faculties across the city.",
        "Provided independent, personalized math and physics instruction to high school students requiring additional one-on-one tutoring.",
        "Designed customized lessons in math, physics, and engineering subjects like statics, dynamics, and strength of materials to civil, electrical, and mechanical engineering undergraduates, preparing students for projects, proofs, and tests through personalized instruction and tutoring.",
      ],
      tags: [
        {
          name: "#Multivariable Calculus",
          color: "orange-text-gradient",
        },
        {
          name: "#Statics, Dynamics, and Strength of Materials",
          color: "green-text-gradient",
        },
        {
          name: "#Physics",
          color: "blue-text-gradient",
        },
        {
          name: "#Thermodynamics",
          color: "pink-text-gradient",
        },
        {
          name: "#Statistics",
          color: "gray-text-gradient",
        },
        {
          name: "#Teaching",
          color: "red-text-gradient",
        },
      ],
    },
    {
      title: "Mechanical Engineering",
      company_name: "Technological University of Pereira",
      icon: UTP,
      iconBg: "#000000",
      date: "January 2015 - December 2021",
      points: [
        "Focus on specializing in mathematics, I serve as a teaching designated tutor for the faculty of basic sciences (2015-2018), where I provide instructional support to students ranging from basic multivariable calculus, linear algebra to advanced topics such as complex systems analysis and differential equations.",
        "In 2017, I participated in a project with the technology and innovation branch of the National Education Service (Tecnoparque SENA), Our task was to design an irrigation system for a greenhouse, financed by the city, aimed at automating the irrigation process for seeds and crops before transplantation to the farmland. Managing timelines, resources, and stakeholder expectations during this project sharpened my project management skills, preparing me for future leadership roles in engineering endeavors and problem solving.",
        "Developed a comprehensive understanding of systems design failure and fatigue theory, gaining valuable insights into the complexities of mechanical systems and their performance under varying conditions. Proficient in applying linear algebra techniques, particularly in determining eigenvalues and eigenvectors of stress tensor systems, essential for both theoretical analysis and practical applications such as finite element analysis (FEA). Hands-on experience in implementing and interpreting analysis results using industry-standard software tools such as SolidWorks Simulation and ANSYS, enabling the validation and optimization of mechanical designs for robustness and performance.",
        "Certified SolidWorks Mechanical Design Associate, demonstrating proficiency in utilizing SolidWorks software for mechanical design tasks and enhancing engineering workflows."
      ],
      tags: [
        {
          name: "#Thermodynamics",
          color: "orange-text-gradient",
        },
        {
          name: "#CAD/CAM/CAE/CSWA",
          color: "green-text-gradient",
        },
        {
          name: "#FEA",
          color: "blue-text-gradient",
        },
        {
          name: "#Fourier Transform",
          color: "pink-text-gradient",
        },
        {
          name: "#Time Series Analysis",
          color: "gray-text-gradient",
        },
      ],
    },
    ],
    es: [
      {
        title: "Ingeniero Jefe Asistente",
        company_name: "Quiroga Law Office, PLLC",
        icon: quiroga,
        iconBg: "#fff",
        date: "Promovido en Enero 2025 - Presente",
        points: [
          "Lideré el desarrollo de dos aplicaciones web full-stack utilizando Flask, integrando modelos de machine learning con datos de clientes en tiempo real para automatizar y mejorar las interacciones con clientes de un bufete de abogados. Utilicé algoritmos de machine learning de código abierto, como EasyOCR y OpenCV, para reconocimiento óptico de caracteres (OCR) y procesamiento avanzado de documentos, permitiendo una extracción e interpretación eficiente de documentos legales.",
          "Desarrollé e implementé un agente de IA impulsado por embeddings de Claude dentro de un sistema de Generación Aumentada por Recuperación (RAG) y una VectorDB para completar automáticamente formularios de inmigración e interactuar con datos de clientes. Construí un chatbot impulsado por IA usando Claude y un sistema RAG para analizar datos de clientes y proporcionar asesoramiento legal personalizado, soporte de servicio al cliente y comunicación optimizada, incluyendo características como inicio de sesión de usuario, historial de chat, caché y perfiles de agentes.",
          "Utilicé servicios de AWS, incluyendo ECS, ECR, EC2 y S3, para una implementación sin problemas, contenerización y gestión de almacenamiento, permitiendo soluciones escalables y confiables basadas en la nube para alojar modelos de machine learning y aplicaciones. Empleé Docker para contenerizar aplicaciones, asegurando entornos consistentes en desarrollo, pruebas y producción, y optimizando pipelines de implementación tanto para aplicaciones Flask como para modelos de machine learning.",
          "Mejoré la eficiencia operativa automatizando el procesamiento de documentos y las interacciones con clientes, mientras aseguraba el manejo seguro de datos de clientes a través de encriptación y adherencia a las mejores prácticas para la protección de datos, todo mientras mantenía una interfaz amigable para el usuario.",
        ],
        tags: [
          { name: "#Pandas", color: "red-text-gradient" },
          { name: "#RAG", color: "gray-text-gradient" },
          { name: "#Flask", color: "pink-text-gradient" },
          { name: "#Docker", color: "blue-text-gradient" },
          { name: "#AWS (ECS,ECR,S3,EC2)", color: "orange-text-gradient" },
          { name: "#CI/CD", color: "gray-text-gradient" },
          { name: "#EasyOCR", color: "red-text-gradient" },
          { name: "#PyMyPDF", color: "gray-text-gradient" },
          { name: "#Matplotlib", color: "gray-text-gradient" },
          { name: "#PostgresSQL", color: "gray-text-gradient" },
          { name: "#Time Series Forecasting", color: "gray-text-gradient" },
          { name: "#Numpy", color: "gray-text-gradient" },
          { name: "#OpenCV", color: "gray-text-gradient" },
          { name: "#Claude 3.5 API", color: "green-text-gradient" },
          { name: "#VectorDB and embeddings", color: "yellow-text-gradient" },
          { name: "#Data Processing and Cleaning", color: "blue-text-gradient" },
          { name: "#CUDA", color: "red-text-gradient" },
          { name: "#Conditional Formatting", color: "pink-text-gradient" },
          { name: "#Prompt Caching", color: "blue-text-gradient" },
          { name: "#Prompt Chain", color: "orange-text-gradient" },
          { name: "#Performance Metrics", color: "gray-text-gradient" },
          { name: "#AI/ML Deployment", color: "green-text-gradient" },
          { name: "#TensorFlow", color: "yellow-text-gradient" },
          { name: "#PyTorch", color: "blue-text-gradient" },
          { name: "#Reinforcement Learning (RL)", color: "red-text-gradient" },
          { name: "#Transformer Architecture", color: "pink-text-gradient" },
          { name: "#Natural Language Processing (NLP)", color: "blue-text-gradient" },
          { name: "#Attention Mechanisms", color: "orange-text-gradient" },
        ],
      },
      {
        title: "Analista de Datos",
        company_name: "Quiroga Law Office, PLLC",
        icon: quiroga,
        iconBg: "#fff",
        date: "Abril 2024 - Promovido en Enero 2024",
        points: [
          "Análisis y Visualización de Datos: Utilización de Python (Pandas, Matplotlib, Seaborn) para extraer, limpiar y analizar datos, creando informes perspicaces con visualizaciones completas que resaltan tendencias y patrones de rendimiento.",
          "Automatización de Web Scraping: Empleo de Selenium para automatizar la extracción de datos de fuentes en línea, asegurando acceso a información actualizada crucial para el análisis.",
          "Uso de Excel y Power Query para mantener la integridad de los datos, transformando grandes conjuntos de datos para usabilidad y resultados de informes robustos.",
          "Desarrollé una aplicación completamente funcional con algoritmos de machine learning para pronósticos, respaldada por una base de datos SQL, implementada en AWS con pipeline CI/CD, Docker, ECR y ECS para escalabilidad y confiabilidad; las características incluyen gestión de usuarios y soporte multipágina para insights de stakeholders.",
          "Utilicé técnicas de pronóstico de series temporales para generar nuevos indicadores de rendimiento de crecimiento, proporcionando insights valiosos para la planificación futura y la toma de decisiones.",
          "Desarrollé un script para escanear repositorios PDF en busca de páginas duplicadas, procesando más de 22,000 PDFs y 300,000 páginas mensualmente. Usando bibliotecas Python como fitz (PyMuPDF), OpenCV, Pandas y skimage, el script aplica procesamiento de imágenes y algoritmos de machine learning para detectar duplicados, incluso con variaciones menores. Esto asegura un seguimiento completo, previene cargas duplicadas y optimiza la eficiencia de almacenamiento y tiempo. Los resultados se exportan en formato CSV para una fácil revisión.",
        ],
        tags: [
          { name: "#Pandas", color: "red-text-gradient" },
          { name: "#Power Query", color: "gray-text-gradient" },
          { name: "#Streamlit", color: "pink-text-gradient" },
          { name: "#Docker", color: "blue-text-gradient" },
          { name: "#AWS (ECS,ECR,S3,EC2)", color: "orange-text-gradient" },
          { name: "#CI/CD", color: "gray-text-gradient" },
          { name: "#SCIKIT IMAGE", color: "red-text-gradient" },
          { name: "#PyMyPDF", color: "gray-text-gradient" },
          { name: "#Matplotlib", color: "gray-text-gradient" },
          { name: "#Plotly", color: "gray-text-gradient" },
          { name: "#Time Series Forecasting", color: "gray-text-gradient" },
          { name: "#Numpy", color: "gray-text-gradient" },
          { name: "#OpenCV", color: "gray-text-gradient" },
          { name: "#Microsoft Excel", color: "green-text-gradient" },
          { name: "#Python Selenium Scripting Automatization", color: "yellow-text-gradient" },
          { name: "#Data Processing and Cleaning", color: "blue-text-gradient" },
          { name: "#Pivot Tables", color: "red-text-gradient" },
          { name: "#Conditional Formatting", color: "pink-text-gradient" },
          { name: "#Excel Dashboard Design", color: "blue-text-gradient" },
          { name: "#Report Storytelling", color: "orange-text-gradient" },
          { name: "#Performance Metrics", color: "gray-text-gradient" },
        ],
      },
      {
        title: "Analista de Datos",
        company_name: "Independiente - Servicio freelance para Firma de Abogados de Inmigración",
        icon: RR,
        iconBg: "#fff",
        date: "Agosto 2023 - Marzo 2024",
        points: [
          "Desarrollé un script en Python con Selenium para automatizar la extracción de datos en tiempo real del sitio web Laravel PHP de un bufete de abogados, enfocándome en métricas de gestión de casos. Utilicé Visual Basic for Applications (VBA) para automatizar la descarga y consulta de archivos CSV que contienen información de casos, asegurando datos actualizados para el análisis.",
          "Procesé y limpié los datos extraídos usando Microsoft Excel, aprovechando Power Query para transformación y estructuración. Implementé funciones para importar, limpiar y transformar datos brutos en un formato estructurado adecuado para análisis detallado.",
          "Diseñé e implementé un dashboard interactivo en Excel para visualizar métricas clave de rendimiento como tiempo de redacción de casos, distribución de estados y dinámica de progresión de casos. Utilicé tablas dinámicas, gráficos y formato condicional de Excel para visualización y análisis de datos.",
          "Creé informes PDF personalizados usando VBA para generar automáticamente resúmenes de rendimiento y enviarlos a la gerencia. El dashboard y los informes se utilizaron en reuniones de gestión para proporcionar insights sobre la eficiencia operativa, con refinamiento continuo basado en feedback de stakeholders.",
        ],
        tags: [
          { name: "#Microsoft Excel", color: "green-text-gradient" },
          { name: "#Python Selenium Scripting Automatization", color: "yellow-text-gradient" },
          { name: "#Data Processing and Cleaning", color: "blue-text-gradient" },
          { name: "#Pivot Tables", color: "red-text-gradient" },
          { name: "#Conditional Formatting", color: "pink-text-gradient" },
          { name: "#Excel Dashboard Design", color: "blue-text-gradient" },
          { name: "#Report Storytelling", color: "orange-text-gradient" },
          { name: "#Performance Metrics", color: "gray-text-gradient" },
          { name: "#Visual Basic", color: "red-text-gradient" },
          { name: "#Power Query", color: "gray-text-gradient" },
        ],
      },
      {
        title: "Analista de Datos y Especialista de Intake",
        company_name: "The Cruz Law Office APC",
        icon: TCLO,
        iconBg: "#fff",
        date: "Julio 2022 - Mayo 2024",
        points: [
          "Serví como especialista de intake y ventas, evaluando la elegibilidad de casos de inmigración, reteniendo clientes y manejando pagos. Utilizando Google Apps Script, API de Google Calendar y automatización con Python Selenium, desarrollé una herramienta de registro de llamadas CRM en Google Sheets, aumentando la captura de datos 4 veces en comparación con métodos anteriores. Esta herramienta expandió las variables de datos a más de 16 dimensiones en la estructura de la base de datos para metadatos de clientes potenciales, incluyendo detalles del cliente y tipos de interacción como ubicación, servicio potencial, datos personales e información sobre sus necesidades legales y situación actual.",
          "Las habilidades de comunicación efectiva fueron cruciales para traducir estos datos en insights accionables para reuniones de gestión, ayudando a la toma de decisiones informada y una comprensión más profunda del cliente entre miembros del equipo y stakeholders.",
          "Se creó una base de datos robusta para capturar todas las interacciones para análisis detallado e insights de marketing. La integración con el dashboard de Looker Studio permitió un análisis fluido y segmentación de clientes. La generación automatizada de informes optimizó los procesos de adquisición de clientes.",
          "La integración con sistemas de gestión de casos y Google Calendar facilitó la creación directa de perfiles y eventos desde el registro de llamadas. La automatización con Google Apps Script mejoró la eficiencia del flujo de trabajo, mientras que nuestro enfoque inquebrantable en la responsabilidad aseguró una supervisión completa sobre cada tarea asignada a asistentes virtuales. Los procesos transparentes y sistemas integrados reforzaron aún más nuestro compromiso con la precisión en los informes y la gestión eficiente de tareas.",
        ],
        tags: [
          { name: "#Google Sheets", color: "green-text-gradient" },
          { name: "#Google Calendar API", color: "blue-text-gradient" },
          { name: "#Python ", color: "yellow-text-gradient" },
          { name: "#Google Apps Script", color: "red-text-gradient" },
          { name: "#Actionable Insights", color: "pink-text-gradient" },
          { name: "#Looker Studio", color: "blue-text-gradient" },
          { name: "#Report Generation", color: "orange-text-gradient" },
          { name: "#Accountability", color: "gray-text-gradient" },
          { name: "#Automatization", color: "green-text-gradient" },
        ],
      }, 
      {
        title: "Aprendiz de Ingeniero Blockchain",
        company_name: "Independiente - Proyectos personales",
        icon: RR,
        iconBg: "#fff",
        date: "Marzo 2020 - Presente",
        points: [
          "Comprensión profunda de principios criptográficos, incluyendo funciones hash, firmas digitales y algoritmos criptográficos. Competente en computación segura multipartita (MPC), pruebas de conocimiento cero (ZKPs), encriptación homomórfica y mecanismos de consenso blockchain como Prueba de Trabajo (PoW) y Prueba de Participación (PoS), con énfasis en seguridad y escalabilidad de red.",
          "Competencia avanzada en Solidity, incluyendo sintaxis, estructuras de datos y características. Amplia experiencia en desarrollo de contratos inteligentes para aplicaciones DeFi (DEXs, plataformas de préstamos, yield farming), con enfoque en vulnerabilidades de seguridad y mejores prácticas.",
          "Experiencia en gestión de propiedad de hardware ASIC, validación de red y configuración dentro de pools de minería. Habilidad en adquisición, configuración y mantenimiento de mineros ASIC para validación PoW eficiente y mejora de recompensas de minería de bloques.",
          "Trader de criptomonedas experimentado con análisis técnico avanzado, evaluación fundamental y estrategias de trading. Competente en uso de Rust para arbitraje DeFi, Onda Elliott, análisis de liquidez y evaluación de bloques de órdenes, así como implementación de estrategias de trading algorítmico para gestionar riesgo y optimizar rentabilidad.",
        ],
        tags: [
          { name: "#Crypto Hashing Algorithms", color: "orange-text-gradient" },
          { name: "#PoW", color: "green-text-gradient" },
          { name: "#Solidity", color: "blue-text-gradient" },
          { name: "#DeFi/DEXs", color: "purple-text-gradient" },
          { name: "#Risk Management", color: "pink-text-gradient" },
          { name: "#Rust", color: "gray-text-gradient" },
          { name: "#ASIC", color: "red-text-gradient" },
        ],
      },
      {
        title: "Especialista en Servicio al Cliente de Facturación y Ventas",
        company_name: "AT&T | Accedo Technologies",
        icon: att,
        iconBg: "#FFF",
        date: "Enero 2017 - Febrero 2019",
        points: [
          "Competente en Gestión de Relaciones con Clientes (CRM): Gestioné eficazmente consultas de facturación y ventas de clientes de AT&T, utilizando sistemas CRM avanzados para navegar cuentas, abordar preocupaciones y procesar transacciones de manera rápida y precisa.",
          "Habilidades Excepcionales de Comunicación: Demostré fuertes habilidades de comunicación verbal y escrita al proporcionar explicaciones claras y concisas de detalles de facturación, ofertas de ventas y opciones de servicio a clientes, fomentando interacciones positivas y resolviendo problemas rápidamente.",
          "Experiencia en Resolución de Problemas: Desarrollé una aguda aptitud para solucionar y resolver discrepancias complejas de facturación, consultas de ventas y problemas relacionados con el servicio, empleando pensamiento analítico e ingenio para asegurar la satisfacción y retención del cliente.",
          "Optimización de Ventas e Ingresos: Aproveché el conocimiento del producto y técnicas de comunicación persuasiva para identificar oportunidades de venta adicional y cruzada, contribuyendo al aumento de generación de ingresos y al logro de objetivos de ventas dentro del entorno de servicio al cliente de AT&T.",
        ],
        tags: [
          { name: "#Customer Service", color: "purple-text-gradient" },
          { name: "#Sales Support", color: "green-text-gradient" },
          { name: "#Communication Skills", color: "blue-text-gradient" },
          { name: "#Conflict Resolution", color: "pink-text-gradient" },
          { name: "#Data Entry", color: "red-text-gradient" },
          { name: "#Multitasking", color: "yellow-text-gradient" },
        ],
      },
      {
        title: "Profesor de Matemáticas, Física y Ciencias de la Ingeniería",
        company_name: "Independiente",
        icon: RR,
        iconBg: "#FFF",
        date: "Enero 2016 - Diciembre 2020",
        points: [
          "Ofrecí sesiones privadas de tutoría en termodinámica, mecánica de fluidos y ciencia de materiales a estudiantes universitarios de ingeniería, atendiendo a diversos estudiantes de varias facultades y universidades de la ciudad.",
          "Proporcioné instrucción personalizada e independiente en matemáticas y física a estudiantes de secundaria que requerían tutoría individual adicional.",
          "Diseñé lecciones personalizadas en matemáticas, física y materias de ingeniería como estática, dinámica y resistencia de materiales para estudiantes de ingeniería civil, eléctrica y mecánica, preparándolos para proyectos, demostraciones y exámenes a través de instrucción y tutoría personalizada.",
        ],
        tags: [
          { name: "#Cálculo Multivariable", color: "orange-text-gradient" },
          { name: "#Estática, Dinámica y Resistencia de Materiales", color: "green-text-gradient" },
          { name: "#Física", color: "blue-text-gradient" },
          { name: "#Termodinámica", color: "pink-text-gradient" },
          { name: "#Estadística", color: "gray-text-gradient" },
          { name: "#Enseñanza", color: "red-text-gradient" },
        ],
      },
      {
        title: "Ingeniería Mecánica",
        company_name: "Universidad Tecnológica de Pereira",
        icon: UTP,
        iconBg: "#000000",
        date: "Enero 2015 - Diciembre 2021",
        points: [
          "Con enfoque en especialización en matemáticas, serví como tutor designado para la facultad de ciencias básicas (2015-2018), donde brindé apoyo instructivo a estudiantes desde cálculo multivariable básico, álgebra lineal hasta temas avanzados como análisis de sistemas complejos y ecuaciones diferenciales.",
          "En 2017, participé en un proyecto con la rama de tecnología e innovación del Servicio Nacional de Educación (Tecnoparque SENA). Nuestra tarea fue diseñar un sistema de riego para un invernadero, financiado por la ciudad, destinado a automatizar el proceso de riego para semillas y cultivos antes del trasplante al campo. La gestión de cronogramas, recursos y expectativas de los interesados durante este proyecto afiló mis habilidades de gestión de proyectos, preparándome para futuros roles de liderazgo en esfuerzos de ingeniería y resolución de problemas.",
          "Desarrollé una comprensión integral de la teoría de falla y fatiga de sistemas, obteniendo valiosos conocimientos sobre las complejidades de los sistemas mecánicos y su rendimiento bajo diversas condiciones. Competente en la aplicación de técnicas de álgebra lineal, particularmente en la determinación de valores y vectores propios de sistemas de tensores de estrés, esencial tanto para el análisis teórico como para aplicaciones prácticas como el análisis de elementos finitos (FEA). Experiencia práctica en la implementación e interpretación de resultados de análisis utilizando herramientas de software estándar de la industria como SolidWorks Simulation y ANSYS, permitiendo la validación y optimización de diseños mecánicos para robustez y rendimiento.",
          "Certificado como Asociado en Diseño Mecánico de SolidWorks, demostrando competencia en la utilización del software SolidWorks para tareas de diseño mecánico y mejora de flujos de trabajo de ingeniería.",
        ],
        tags: [
          { name: "#Termodinámica", color: "orange-text-gradient" },
          { name: "#CAD/CAM/CAE/CSWA", color: "green-text-gradient" },
          { name: "#FEA", color: "blue-text-gradient" },
          { name: "#Transformada de Fourier", color: "pink-text-gradient" },
          { name: "#Análisis de Series Temporales", color: "gray-text-gradient" },
        ],
      },
    ]
  };
  
  const testimonials = {
    en: [
    {
      testimonial:
        "His relentless dedication and impressive achievements across multiple challenging projects. His passion for his craft is evident in every line of code he writes, transforming complex problems into elegant solutions. Raphael's expertise as a coder is extraordinary, consistently pushing the boundaries of innovation and efficiency. His commitment and brilliance have not only advanced our projects but also inspired his peers to strive for excellence. Thank you, Raphael, for your remarkable contributions and the enthusiasm you bring to your work every day!",
      name: "Joseph Rouse",
      designation: "COO",
      company: "Quiroga Law Office, PLLC",
      image: quiroga2,
      url:"https://www.linkedin.com/company/quirogalawoffice",
      doc:"",
      email:""
    },
    {
      testimonial:
          "Raphael truly deserves recognition for his exceptional work on the latest applications. I have chosen loyalty as his core value, but over the past weeks, Raphael has demonstrated all six core values. I'm excited about what's to come for the company, thanks to the applications Raphael has developed on his own in such a short time. I'm really proud to have Raphael on the team!",
      name: "Katherin Daza",
      designation: "Enforcement Supervisor",
      company: "Quiroga Law Office, PLLC",
      image: quiroga2,
      url:"https://www.linkedin.com/company/quirogalawoffice",
      doc:"",
      email:""
    },
    {
      testimonial:"Raphael demonstrated not only exceptional intelligence and a relentless work ethic but also an extraordinary aptitude for building lasting client relationships. His natural ability to connect with people was complemented by his proactive mindset, stellar time management skills, and impressive multitasking abilities. These qualities, combined with his meticulous attention to detail and a keen ability to innovate, made him an indispensable asset to our team and a driving force behind the success of our marketing and sales efforts.",
      name: "Narciso Cruz",
      designation: "CEO",
      company: "The Cruz Law Office APC",
      image: "https://justatic.com/profile-images/1502461-1452726125-s.jpg",
      url:"https://www.linkedin.com/in/narciso-nar-cruz-9281a523/",
      doc:"https://drive.google.com/file/d/1zcUoTr0BeKpXBhOTCnfMYTVPZyDx_Kxl/view?usp=sharing",
      email:"monica@thecruzlawoffice.com"
    },
    {
      testimonial:
        "Raphael consistently displayed professionalism and dedication in his role. His technical skills, ability to manage multiple tasks efficiently, and excellent communication skills greatly benefited our office, making him a reliable and valuable team member.",
      name: "Monica Herrera",
      designation: "COO",
      company: "The Cruz Law Office APC",
      image: "https://randomuser.me/api/portraits/women/4.jpg",
      url:"https://www.linkedin.com/company/the-cruz-law-office-apc",
      doc:"https://drive.google.com/file/d/1zcUoTr0BeKpXBhOTCnfMYTVPZyDx_Kxl/view?usp=sharing",
      email:"monica@thecruzlawoffice.com"
    },
    ],
    es: [
      {
        testimonial: "Su dedicación incansable y logros impresionantes en múltiples proyectos desafiantes. Su pasión por su oficio es evidente en cada línea de código que escribe, transformando problemas complejos en soluciones elegantes. La experiencia de Raphael como programador es extraordinaria, constantemente empujando los límites de la innovación y la eficiencia. Su compromiso y brillantez no solo han avanzado nuestros proyectos, sino que también han inspirado a sus compañeros a buscar la excelencia. ¡Gracias, Raphael, por tus notables contribuciones y el entusiasmo que traes a tu trabajo cada día!",
        name: "Joseph Rouse",
        designation: "Director de Operaciones",
        company: "Quiroga Law Office, PLLC",
        image: quiroga2,
        url: "https://www.linkedin.com/company/quirogalawoffice",
        doc: "",
        email: ""
      },
      {
        testimonial: "Raphael realmente merece reconocimiento por su excepcional trabajo en las últimas aplicaciones. He elegido la lealtad como su valor central, pero en las últimas semanas, Raphael ha demostrado todos los seis valores centrales. Estoy emocionado por lo que vendrá para la empresa, gracias a las aplicaciones que Raphael ha desarrollado por su cuenta en tan poco tiempo. ¡Estoy muy orgulloso de tener a Raphael en el equipo!",
        name: "Katherin Daza",
        designation: "Supervisor de Ejecución",
        company: "Quiroga Law Office, PLLC",
        image: quiroga2,
        url: "https://www.linkedin.com/company/quirogalawoffice",
        doc: "",
        email: ""
      },
      {
        testimonial: "Raphael demostró no solo una excepcional inteligencia y un trabajo incansable, sino también una extraordinaria aptitud para construir relaciones de clientes duraderas. Su capacidad natural para conectarse con la gente se complementó con su actitud proactiva, excelentes habilidades de gestión del tiempo y capacidades impresionantes de multitarea. Estas cualidades, combinadas con su meticulosa atención al detalle y una notable habilidad para innovar, lo convirtieron en un activo indispensable para nuestro equipo y una fuerza impulsora detrás del éxito de nuestros esfuerzos de marketing y ventas.",
        name: "Narciso Cruz",
        designation: "CEO",
        company: "The Cruz Law Office APC",
        image: "https://justatic.com/profile-images/1502461-1452726125-s.jpg",
        url: "https://www.linkedin.com/in/narciso-nar-cruz-9281a523/",
        doc: "https://drive.google.com/file/d/1zcUoTr0BeKpXBhOTCnfMYTVPZyDx_Kxl/view?usp=sharing",
        email: "monica@thecruzlawoffice.com"
      },
      {
        testimonial: "Raphael siempre mostró profesionalismo y dedicación en su papel. Sus habilidades técnicas, su capacidad para gestionar múltiples tareas de manera eficiente y sus excelentes habilidades de comunicación lo hicieron un miembro de equipo confiable y valioso. Su trabajo ha sido de gran beneficio para nuestra oficina, lo que lo ha convertido en un miembro de equipo confiable y valioso.",
        name: "Monica Herrera",
        designation: "COO",
        company: "The Cruz Law Office APC",
        image: "https://randomuser.me/api/portraits/women/4.jpg",
        url: "https://www.linkedin.com/company/the-cruz-law-office-apc",
        doc: "https://drive.google.com/file/d/1zcUoTr0BeKpXBhOTCnfMYTVPZyDx_Kxl/view?usp=sharing",
        email: "monica@thecruzlawoffice.com"
      },
    ]
  };
  
  const projects = {
    en: [
    {
      name: "Google calendar events analysis",
      description:
      "This project uses Google Apps Script to extract event data from Google Calendar and store it in Google Sheets. Data includes Event Title, Dates, Creator, and more for accountability. It's also used in Looker Studio for insights on office consultations.",
    tags: [
        {
          name: "Google Sheets",
          color: "green-text-gradient",
        },
        {
          name: "Looker Studio",
          color: "blue-text-gradient",
        },
        {
          name: "Google Apps Script",
          color: "red-text-gradient",
        },
        {
          name: "Google API",
          color: "gray-text-gradient",
        },
      ],
      image: Calendar,
      source_code_link: "https://github.com/0xrphl/Google-calendar-events-analysis-Google-sheets-Google-App-Scripts-Looker-Studio-",
    },
   {
      name: "Crypto Portfolio Tracker",
      description:
      "This Google Sheets project allows you to track your cryptocurrency portfolio using real-time data fetched from CoinMarketCap. It utilizes Google Apps Script to request data from the CoinMarketCap API and update your spreadsheet with the latest prices.",
    tags: [
        {
          name: "Google Sheets",
          color: "green-text-gradient",
        },
        {
          name: "CoinMarketCap API",
          color: "blue-text-gradient",
        },
      ],
      image: Cryptotracker,
      source_code_link: "https://github.com/0xrphl/Crypto-portfolio-tracker-Google-Sheets-Coinmarketcap-API-",
    },
    {
      name: "Budget and Expenses dashboard",
      description:
      "Track finances easily on Google Sheets. Input income, savings, and expenses, categorized by date and type. Integration with Looker Studio for visualizing data. Simplify your finances effortlessly.",
    tags: [
        {
          name: "Google Sheets",
          color: "green-text-gradient",
        },
        {
          name: "Looker Studio",
          color: "blue-text-gradient",
        },
      ],
      image: budget,
      source_code_link: "https://github.com/0xrphl/Budget-and-Expenses-dashboard-Google-Sheets-Looker-Studio-",
    },
    {
      name: "Intake and CRM System",
      description:
      "This project streamlines CRM intake using Google Sheets, Apps Script, and Looker Studio. Features include legal office intake system, Sheets integration, Apps Script automation, Google Calendar integration, SMS API for reminders, and Looker Studio for real-time KPI insights.",
    tags: [
        {
          name: "Google Sheets",
          color: "green-text-gradient",
        },
        {
          name: "Looker Studio",
          color: "blue-text-gradient",
        },
        {
          name: "Google Apps Script",
          color: "red-text-gradient",
        },
        {
          name: "Google API",
          color: "gray-text-gradient",
        },
      ],
      image: CRM,
      source_code_link: "https://github.com/0xrphl/Intake-and-CRM-Google-Sheets-Google-App-Script-Looker-Studio-",
    },
    {
      name: "Three stone gold diamond ring SOLIDWORKS project",
      description:
      "I designed a stunning three-stone diamond ring in SolidWorks with lab-grown diamonds certified by IGI. Crafted in radiant 24-karat gold for elegance and eco-conscious luxury, SOLIDWORKS Visualize was used for renders. [GrabCAD model available on Github.]",
    tags: [
        {
          name: "SOLIDWORKS",
          color: "red-text-gradient",
        },
        {
          name: "IGI certified diamonds",
          color: "orange-text-gradient",
        },
        {
          name: "Jewelry Design",
          color: "pink-text-gradient",
        },
        {
          name: "SOLIDWORKS Visualize",
          color: "gray-text-gradient",
        },
      ],
      image: ring,
      source_code_link: "https://github.com/0xrphl/Three-stone-radiant-cut-diamond-ring-SOLIDWORKS-project",
    },
    {
      name: "Data Analyst Portfolio",
      description:
        "Crafted with React-Three-Fiber and Tailwind CSS, presents an immersive display of my SQL, Python, Tableau, and Excel skills. Its interactive 3D elements and responsive design create a visually appealing platform to explore my diverse data analysis projects.",
      tags: [
        {
          name: "React",
          color: "blue-text-gradient",
        },
        {
          name: "ThreeJS",
          color: "green-text-gradient",
        },
        {
          name: "Tailwind CSS",
          color: "pink-text-gradient",
        },
        {
          name: "HTML",
          color: "orange-text-gradient",
        },
        {
          name: "CSS",
          color: "blue-text-gradient",
        },
        {
          name: "JavaScript ",
          color: "yellow-text-gradient",
        }
      ],
      image: carrent,
      source_code_link: "https://github.com/0xrphl/Data-Analyst-Portfolio",
    },
    ],
    es: [
      {
        name: "Análisis de eventos de Google Calendar",
        description: "Este proyecto utiliza Google Apps Script para extraer datos de eventos de Google Calendar y almacenarlos en Google Sheets. Los datos incluyen Título del Evento, Fechas, Creador y más para responsabilidad. También se utiliza en Looker Studio para obtener información sobre consultas de oficina.",
        tags: [
          { name: "Google Sheets", color: "green-text-gradient" },
          { name: "Looker Studio", color: "blue-text-gradient" },
          { name: "Google Apps Script", color: "red-text-gradient" },
          { name: "Google API", color: "gray-text-gradient" },
        ],
        image: Calendar,
        source_code_link: "https://github.com/0xrphl/Google-calendar-events-analysis-Google-sheets-Google-App-Scripts-Looker-Studio-",
      },
      {
        name: "Seguimiento de cartera de criptomonedas",
        description: "Este proyecto de Google Sheets le permite realizar un seguimiento de su cartera de criptomonedas utilizando datos en tiempo real extraídos de CoinMarketCap. Utiliza Google Apps Script para solicitar datos de la API de CoinMarketCap y actualizar su hoja de cálculo con los precios más recientes.",
        tags: [
          { name: "Google Sheets", color: "green-text-gradient" },
          { name: "CoinMarketCap API", color: "blue-text-gradient" },
        ],
        image: Cryptotracker,
        source_code_link: "https://github.com/0xrphl/Crypto-portfolio-tracker-Google-Sheets-Coinmarketcap-API-",
      },
      {
        name: "Tablero de presupuesto y gastos",
        description: "Realice un seguimiento de sus finanzas fácilmente en Google Sheets. Ingrese ingresos, ahorros y gastos, categorizados por fecha y tipo. Integración con Looker Studio para visualizar datos. Simplifique fácilmente sus finanzas.",
        tags: [
          { name: "Google Sheets", color: "green-text-gradient" },
          { name: "Looker Studio", color: "blue-text-gradient" },
        ],
        image: budget,
        source_code_link: "https://github.com/0xrphl/Budget-and-Expenses-dashboard-Google-Sheets-Looker-Studio-",
      },
      {
        name: "Sistema de toma de datos y CRM",
        description: "Este proyecto streamline la toma de datos de CRM utilizando Google Sheets, Apps Script y Looker Studio. Las funciones incluyen sistema de toma de datos de oficina, integración de Sheets, automatización de Apps Script, integración de Google Calendar, API de SMS para recordatorios y Looker Studio para insights KPI en tiempo real.",
        tags: [
          { name: "Google Sheets", color: "green-text-gradient" },
          { name: "Looker Studio", color: "blue-text-gradient" },
          { name: "Google Apps Script", color: "red-text-gradient" },
          { name: "Google API", color: "gray-text-gradient" },
        ],
        image: CRM,
        source_code_link: "https://github.com/0xrphl/Intake-and-CRM-Google-Sheets-Google-App-Script-Looker-Studio-",
      },
      {
        name: "Proyecto de anillo de oro de tres piedras en SOLIDWORKS",
        description: "Diseñé un anillo de oro de tres piedras en SolidWorks con diamantes certificados IGI. Hecho en 24k de oro radiante para elegancia y lujo ecológico, se utilizó SOLIDWORKS Visualize para renders. [GrabCAD model available on Github.]",
        tags: [
          { name: "SOLIDWORKS", color: "red-text-gradient" },
          { name: "IGI certified diamonds", color: "orange-text-gradient" },
          { name: "Jewelry Design", color: "pink-text-gradient" },
          { name: "SOLIDWORKS Visualize", color: "gray-text-gradient" },
        ],
        image: ring,
        source_code_link: "https://github.com/0xrphl/Three-stone-radiant-cut-diamond-ring-SOLIDWORKS-project",
      },
      {
        name: "Portafolio de Analista de Datos",
        description: "Creado con React-Three-Fiber y Tailwind CSS, presenta una exhibición inmersiva de mis habilidades SQL, Python, Tableau y Excel. Su plataforma interactiva y diseño responsivo crea una plataforma visualmente atractiva para explorar mis diversos proyectos de análisis de datos.",
        tags: [
          { name: "react", color: "blue-text-gradient" },
          { name: "ThreeJS", color: "green-text-gradient" },
          { name: "tailwind", color: "pink-text-gradient" },
          { name: "HTML", color: "orange-text-gradient" },
          { name: "CSS", color: "blue-text-gradient" },
        ],
        image: carrent,
        source_code_link: "https://github.com/0xrphl/Data-Analyst-Portfolio",
      },
    ]
  };
  
  export { services, technologies, experiences, testimonials, projects, Linkedinlog };
