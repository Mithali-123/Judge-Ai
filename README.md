# ⚖️ Judge AI

**Judge AI** is a privacy-centric, cross-platform desktop application designed for high-performance AI model comparison. By querying multiple industry-leading models simultaneously, it allows users to evaluate responses side-by-side, while an automated comparison engine—**"The Judge"**—provides a technical verdict on response quality.

---

## 🚀 Key Features

* **Multi-Model Streaming**: Get responses from Gemini 2.5 Flash, GPT-4o mini, Claude Sonnet 4, Groq (Llama 3.3), and Perplexity Sonar at the same time.
* **Local AI (Ollama)**: Full integration for private, offline AI processing using models like Llama 3.2.
* **The Judge's Verdict**: An automated system that compares response length, detail level, and code accuracy across all active models.
* **Privacy First**: All API keys are stored in your local storage; your data is only sent to the specific AI providers you configure.
* **Custom Minimalist UI**: A sleek "Squircle" design featuring a custom frameless window and integrated window controls.

---

## 🛠️ Tech Stack

* **Runtime**: [Electron](https://www.electronjs.org/) (Desktop Application Framework).
* **Frontend**: [React](https://reactjs.org/) + [Vite](https://vitejs.dev/) + [TypeScript](https://www.typescriptlang.org/).
* **Styling**: [Tailwind CSS](https://tailwindcss.com/) + [Shadcn UI](https://ui.shadcn.com/).
* **Icons**: [Lucide React](https://lucide.dev/) (Scale, Sparkles, Brain, etc.).
* **State Management**: [Zustand](https://github.com/pmndrs/zustand).

---

## 🧠 How It Works

Judge AI acts as a unified interface for multiple AI "brains." When you enter a prompt, the application routes your request through the following specialized tools:

* **Cloud Models**: Connects to **Groq (Llama 3.3)** for extreme speed, **Gemini 2.5 Flash**, **ChatGPT**, **Claude**, and **Perplexity** for deep reasoning.
* **Ollama (Offline Mode)**: This app is built to excel in offline-first environments. **It works 100% offline** when using Ollama. You can install Ollama from the in-app API guide, and this app arguably works even better offline, ensuring your data stays on your local hardware.
* **Comparison Engine**: Once models respond, the app analyzes metadata—such as character count and the presence of code blocks—to provide a structured comparison table known as **The Judge's Verdict**.

---

## ⚙️ Installation (For Users)

1. Download the latest **Judge AI Setup.exe** from the [Releases](https://github.com/Mithali-123/Judge-Ai/releases) section.
2. Run the installer and follow the wizard (Next -> Install -> Finish).
3. Launch the app and enter your keys in the **API Configuration** section.

---

## 🛡️ Privacy & Security

Your privacy is the core priority. This application does not use a middle-man server; your API keys are stored only on your machine and are never sent elsewhere. For users requiring total data sovereignty, the **Ollama** integration allows for a completely air-gapped AI experience.

---

## ❤️ Support for my project

If you find **Judge AI** useful for your workflow, consider supporting its development:
* **Star the Repo**: Click the ⭐ button at the top of this page to help others discover the project.
* **Report Bugs**: Open an issue if you find something broken.
* **Feedback**: Share your suggestions for new features or UI improvements.

---

**Author:** **Mithali** [Github](https://github.com/Mithali-123)
