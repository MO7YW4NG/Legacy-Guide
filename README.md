# LegacyGuide (靈魂日曆) - AI-Powered Ritual Planning Platform

## 1. Project Overview

LegacyGuide (靈魂日曆) is an AI-powered digital platform designed as a value-added service for **Lungyen Life Service Corporation (龍巖)**. Its core purpose is to assist bereaved families by providing a personalized "soul calendar" and intelligent guidance for post-bereavement rituals and remembrance. The system integrates traditional customs, Lungyen's specific service data, and modern AI technology to offer a seamless, supportive, and culturally sensitive experience during a difficult time.

This platform aims to:
*   Automate the generation of important ritual dates based on the deceased's information.
*   Provide clear, AI-driven explanations for traditional customs and rituals.
*   Offer recommendations for auspicious dates for key events.
*   Integrate with Lungyen's existing data and service offerings to provide tailored suggestions.
*   Serve as a digital companion for families to navigate the complexities of funeral rites and ongoing remembrance.

## 2. Key Features

*   **User Input & Core Almanac Engine:** Intuitive interface for inputting deceased's information and a foundational Farmer's Almanac query engine.
*   **Customizable Ritual Logic:** A configurable rule-based system to define funeral process logic based on religion, budget, and customs.
*   **Automated Ritual Date Calculation:** Generates key dates like 7-day cycles (做七), 100-day (百日), anniversaries (對年), etc.
*   **Auspicious Date Recommendation:** Suggests suitable dates for important rites based on zodiac, heavenly stems/earthly branches, etc.
*   **LLM-Powered Explanations & Guidance:** Uses Large Language Models to provide clear, empathetic explanations for rituals and recommendations.
*   **Lungyen Service & Data Integration:** Integrates Lungyen's internal data (service packages, product info, established ritual knowledge) to offer company-specific suggestions and information.

## 3. Technology Stack

*   **Frontend:** Gradio
*   **Backend:** Python FastAPI
*   **AI/ML:**
    *   Large Language Models (LLMs) via API (Google Gemini)
    *   Retrieval Augmented Generation (RAG)
*   **Farmer's Almanac Engine:** Custom-built or integrated third-party library/API.
*   **Deployment:** Docker