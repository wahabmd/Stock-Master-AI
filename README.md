# BoldStock AI (formerly BoldBrush svg2eps)

**BoldStock AI** is a professional, AI-driven suite designed specifically for Adobe Stock contributors and digital artists. It streamlines the tedious process of metadata generation for vector illustrations and helps AI artists reverse-engineer high-quality prompts from existing images.

This tool is the evolution of the **BoldBrush svg2eps** prototype.

Developed by **Wahab Muhammad** in collaboration with the **BoldBrush Team**.

---

## 🚀 Key Features

- **Vector Metadata Generator**: 
    - Analyzes SVG/EPS files using Gemini 3.
    - Generates optimized titles (max 70 chars) and exactly 40 keywords (staying under the 49-tag limit).
    - Automatic SVG-to-EPS conversion and JPEG preview generation.
    - **One-Click Export**: Generates a ZIP package structured perfectly for Adobe Stock (including `metadata.csv`, `/eps/` folder, and `/pin/` previews).
- **Prompt Extractor**: 
    - Upload or paste images to extract detailed text-to-image prompts (< 1000 characters).
    - **Central Theme Input**: Guide the AI to focus on specific artistic styles or subjects.
    - **Batch Export**: Download all generated prompts in a single `.txt` file.
- **Copy-to-Clipboard**: Quick copy icons for every metadata field.
- **Responsive Grid Design**: Modern, clean UI that works across devices.

---

## 🛠️ How to Use on Your Device

To run this application locally, follow these steps:

### 1. Prerequisites
- **Node.js**: Ensure you have Node.js (v18+) installed.
- **Gemini API Key**: You need an API key from [Google AI Studio](https://ai.google.dev/).

### 2. Setup Instructions

1.  **Download/Clone**: Download the project source files to your local machine.
2.  **Environment Variable**: This app relies on the Google Gemini API. Create a `.env` file in the root directory (or set it in your environment) with your key:
    ```env
    API_KEY=your_gemini_api_key_here
    ```
3.  **Install Dependencies**:
    ```bash
    npm install
    ```
4.  **Run Development Server**:
    ```bash
    npm run dev
    # OR if using a simple serve script:
    npm start
    ```

---

## 📜 License & Credits
This tool is provided for public use. 

**Maintained by Wahab Muhammad**  
**Core Logic by BoldBrush Team**