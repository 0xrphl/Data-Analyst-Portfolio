<a href="https://www.youtube.com/watch?v=LugrFo-gq1M">
  <img src="https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExdWc1enRsc294dzg5a2FtNmpvbDBhejRwd2VueTY4dW53MDJsMHRicSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/Rbvh69Ofg2NdGfMrGM/source.gif">
</a>

# 0xraphael.com | AI Engineer & Data Analyst Portfolio

Welcome to my AI Engineer & Data Analyst Portfolio, a visually engaging showcase of my skills and projects. This portfolio, deployed at [0xraphael.com](https://0xraphael.com/), features the **V3.0** version — now showcasing AI agent development, RAG/GraphRAG systems, knowledge base engineering, and full-stack data solutions alongside traditional data analysis work.

## Purpose

The primary goal of this portfolio is to present my proficiency in AI engineering, data analysis, and full-stack development. I specialize in building production-grade AI agent systems, RAG pipelines, knowledge graphs, and cloud-native applications — while maintaining deep expertise in data visualization, automation, and business intelligence.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Skills and Technologies](#skills-and-technologies)
- [Projects Highlight](#projects-highlight)
- [Technologies (Portfolio Stack)](#technologies-portfolio-stack)
- [Installation](#installation)
- [Usage](#usage)
- [Bugs & Fixes](#bugs--fixes)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)
- [Version History](#version-history)

## Overview

Built with React-Three-Fiber and Tailwind CSS, this portfolio provides an interactive and visually appealing 3D experience. It features 60+ technology icons rendered as interactive 3D icosahedrons with category-based filtering, image carousels for project showcases, glassmorphism UI effects, and full English/Spanish language support.

## Features

- **Interactive 3D Elements:** Powered by React-Three-Fiber with 3D icosahedron technology balls, category-colored surfaces, and animated backgrounds.
- **60+ Technology Icons:** Organized into 11 categories (AI & ML, Data Science, Databases, Web Dev, Cloud & DevOps, BI & Spreadsheets, Automation, Mechanical Engineering, IoT & Embedded, Other) with interactive filtering.
- **Image Carousel Project Cards:** Multi-image carousels with auto-advance (6s) for detailed project showcases.
- **HuggingFace Integration:** Dual-button project cards with GitHub and HuggingFace dataset links.
- **Multi-Language Support:** Full English/Spanish localization with dynamic language switching across all content.
- **Glassmorphism & Orb Animations:** Dark orb card effects, animated gradient backgrounds, and glassmorphism transparency across About, Feedbacks, and Contact sections.
- **Responsive Design:** Tailwind CSS with mobile-optimized 3D rendering, disabled heavy animations on mobile for performance.
- **Stars Background:** Animated star field in the hero section.
- **Detailed Project Showcase:** Each project presented with comprehensive descriptions, technology tags, and visualizations.

## Skills and Technologies

### AI & ML
- **LLM Agent Systems:** Production-grade RAG and GraphRAG pipelines (LightRAG, LangGraph)
- **AI Models & APIs:** OpenAI (GPT-4o, embeddings), Anthropic Claude, Google Gemini Vision, DeepSeek, Gemma, Qwen, Kimi, GLM-V OCR
- **ML Frameworks:** TensorFlow, PyTorch, Keras, Scikit-Learn, Scikit-image, CUDA
- **Local AI:** Ollama, LM Studio, ComfyUI, MCP
- **Specialized:** MiroFish (multi-agent prediction), Midjourney, HuggingFace

### Databases & Vector Stores
- **Relational:** PostgreSQL (+pgvector), MySQL, SQL Server
- **Graph:** Neo4j
- **Vector:** Milvus, Pinecone, Qdrant, NanoVectorDB, ChromaDB
- **Cloud:** Supabase, Neon DB

### Data Science & Visualization
- **Python:** Pandas, NumPy, SciPy, Matplotlib, Seaborn, Plotly
- **BI Tools:** Tableau, Power BI, Looker Studio, Google Analytics
- **Spreadsheets:** Excel (VLookup, Pivot Tables, Power Query, VBA), Google Sheets, Google Apps Script

### Web Development
- **Frontend:** React, Three.js, Vue.js, Tailwind CSS, HTML, CSS, JavaScript, TypeScript, Vite
- **Backend:** Node.js, Flask, FastAPI, Streamlit

### Cloud & DevOps
- **AWS:** ECS, ECR, EC2, S3, Route 53, ALB, CloudFront, RDS
- **Auth:** Azure AD OAuth 2.0
- **Deployment:** Docker, Vercel, CI/CD pipelines
- **Version Control:** Git, GitHub

### Automation & Scraping
- **Tools:** Selenium, Puppeteer, Firecrawl, N8N, Zapier

### IoT & Embedded Systems
- **Platforms:** Arduino IDE & Controllers, Espressif (ESP32-S3/ESP8266), Microchip PIC
- **Languages:** C/C++

### Mechanical Engineering
- **CAD/CAE:** SOLIDWORKS (CSWA Certified), Autodesk Inventor, ANSYS
- **Analysis:** MATLAB, FEA, Fatigue Theory

### Blockchain & Crypto
- Solidity smart contracts, DeFi/DEXs, Rust algorithmic trading, ASIC mining

## Projects Highlight

### USCIS Knowledge Base
A comprehensive RAG-ready knowledge base of **99,489 content chunks** from **4,666 USCIS pages** with OpenAI embeddings (1536-dim). Stored in PostgreSQL+pgvector, Milvus, and Neo4j. Scraped with Firecrawl, visualized with Apple's Embedding Atlas (UMAP clusters), and published on HuggingFace. One-command Docker Compose deployment with 7 services for semantic search and GraphRAG retrieval.
- [GitHub](https://github.com/0xrphl/USCIS-knowledge-base-full-website) | [HuggingFace Dataset](https://huggingface.co/datasets/0xrphl/USCIS-knowledge-base-full-website)

### Media Assets Marketing AI Agent — LLM + GraphRAG + Embeddings
AI-powered LLM image asset library analyzing **420+ marketing images** with Gemini Vision AI. Builds a rich knowledge graph with LightRAG GraphRAG (13,604 entities, 22,958 relationships). Features 5-chunk-per-image ingestion pipeline, Neo4j graph storage, NanoVectorDB with 1536-dim OpenAI embeddings, 5 query modes, and a Vue.js Explorer SPA. Pre-ingested dataset on HuggingFace (~513 MB). Docker Compose deployment.
- [GitHub](https://github.com/0xrphl/Light-RAG-Marketing-Assets-Agent) | [HuggingFace Dataset](https://huggingface.co/datasets/0xrphl/Light-RAG-Marketing-Assets-Agent)

### MiroFish Neo4j Fork — Multi-Agent AI Prediction Engine
A fork of MiroFish replacing Zep Cloud with local Neo4j — fully self-hosted multi-agent AI prediction engine for predictive event simulation and agentic parallel consensus. Features LLM-powered ontology generation, agent persona creation, knowledge graph building, and multi-agent debate simulation. Deployed via Docker Compose with Neo4j, ChromaDB, and Whisper ASR.
- [GitHub](https://github.com/0xrphl/mirofish-neo4j-fork)

### Household Expense Dashboard
Real-time Streamlit dashboard for couples/households to track shared expenses, income, and debts — powered by Google Sheets and Google Cloud API. Features KPIs, Sankey debt diagrams, interactive Plotly charts, advanced filters, fixed expense tracking, password protection, and CSV export.
- [GitHub](https://github.com/0xrphl/Streamlit-expenses-tracker-dashboard)

### Duplicate PDF Detection Algorithm
Pixel-map based duplicate detection system processing **22,000+ PDFs** and **300,000+ pages** monthly using SSIM (Structural Similarity Index). Includes synthetic government-style document generators, comprehensive benchmarks across 37 PDFs and 11 client folders, and professional benchmark charts for accuracy, robustness, and storage impact analysis.
- [GitHub](https://github.com/0xrphl/Sci-kit-image-duplicate-pdf-image-batches)

### Additional Projects
- **Google Calendar Events Analysis** — Apps Script + Google Sheets + Looker Studio
- **Crypto Portfolio Tracker** — Google Sheets + CoinMarketCap API
- **Budget & Expenses Dashboard** — Google Sheets + Looker Studio
- **Intake and CRM System** — Google Sheets + Apps Script + Looker Studio + SMS API
- **Three Stone Diamond Ring** — SOLIDWORKS CAD design with SOLIDWORKS Visualize renders
- **This Portfolio** — React + Three.js + Tailwind CSS

## Technologies (Portfolio Stack)

- [React](https://reactjs.org/): JavaScript library for building user interfaces.
- [Three.js](https://threejs.org/) / [React-Three-Fiber](https://github.com/pmndrs/react-three-fiber): 3D rendering with interactive icosahedron technology balls and animated backgrounds.
- [Tailwind CSS](https://tailwindcss.com/): Utility-first CSS framework with glassmorphism effects.
- [Vite](https://vitejs.dev/): Fast build tool and development server.
- [Framer Motion](https://www.framer.com/motion/): Animation library for React.

## Installation

To run this portfolio locally, follow these steps:

1. **Clone this repository:**
    ```bash
    git clone https://github.com/0xrphl/Data-Analyst-Portfolio.git
    ```

2. **Navigate to the project directory:**
    ```bash
    cd Data-Analyst-Portfolio
    ```

3. **Install dependencies:**
    ```bash
    npm install
    ```

4. **Start the development server:**
    ```bash
    npm run dev
    ```

5. **Open your browser and visit:**
    ```
    http://localhost:5173
    ```
   You should now be able to view the portfolio locally.

## Usage

Explore the portfolio to discover my AI engineering and data analysis projects, view visualizations, interact with 3D technology displays, and gain insights into my skills and capabilities. Use the language toggle to switch between English and Spanish.

## Bugs & Fixes

**V3.0 — All Known Issues Resolved:**
- ✅ Mobile platform optimization complete (dynamic render quality, reduced particles)
- ✅ Heavy orb animations disabled on mobile for performance
- ✅ Tech balls grid offset fixed for mobile
- ✅ GLM-V SVG replaced with PNG for better quality
- ✅ MiroFish carousel banner ordering fixed
- ✅ Anthropic tooltip renamed to Anthropic Claude

## Contributing

If you'd like to contribute to this project, feel free to open an issue or submit a pull request. Your feedback and contributions are highly appreciated!

## License

This project is licensed under the [MIT License](LICENSE).

## Contact

Feel free to reach out to me via email at [0xrphl@gmail.com](mailto:0xrphl@gmail.com) or connect with me on [LinkedIn](https://www.linkedin.com/in/0xraphael/).

## Version History

- **V3.0** (July 2025) — Current version
  - Added USCIS Knowledge Base project with repo cover image carousel
  - Added Media Assets Marketing AI Agent project (LightRAG GraphRAG + Gemini Vision)
  - HuggingFace SVG logo integration in project cards
  - Updated project ordering (USCIS first, Media Agent second)

- **V2.9** (June 2025)
  - Added USCIS Knowledge Base project card with 7-image carousel + GitHub/HuggingFace dual buttons
  - Added MiroFish Neo4j Fork project card with 9-image carousel
  - Added MiroFish tag + predictive markets/agentic consensus descriptions
  - Banner-first carousel ordering + 6s auto-advance

- **V2.8** (2025)
  - Added Duplicate PDF Detection Algorithm project card with benchmark chart carousel
  - Added synthetic comparison composites (exact match + non-match)
  - Added Household Expense Dashboard project card with image carousel
  - Added LM Studio, ComfyUI, and GLM-V OCR to technologies

- **V2.7** (2025)
  - Dark orb card animations on About service cards and Works project cards
  - Animated gradient backgrounds and glassmorphism on Feedbacks section
  - Stars background in hero section, glassmorphism on contact card
  - Mobile performance optimization (disabled heavy orb animations)

- **V2.6** (2025)
  - Split Engineering into Mechanical Eng. and IoT & Embedded Systems categories
  - Added Arduino, ESP32 (Espressif), Microchip PIC, Selenium
  - Tech balls grid layout improvements and FOV adjustments for filtered categories

- **V2.5** (2025)
  - Added 30+ new technology icons with category-based filtering
  - 3D icosahedron surfaces with category colors and improved lighting
  - Added Technologies and Projects nav links
  - Added MiroFish to AI & ML category
  - Responsive layout improvements, hamburger nav at lg breakpoint
  - Removed dist, .vs, .vscode from tracking

- **V1.2** (February 2024)
  - Added Spanish language support
  - Fixed mobile rendering and navigation issues
  - Optimized resource consumption for mobile devices

- **V1.1** (April 2024)
  - Previous stable version

- **V0.54** (January 2024)
  - Initial release with mobile navigation issues
