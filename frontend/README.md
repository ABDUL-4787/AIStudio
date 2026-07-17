# 🎨 PredictIQ Studio — Frontend Application

This directory contains the client-side user interface for **PredictIQ Studio**, built using React 19, Vite, and styled with Tailwind CSS v4.

---

## 🚀 Technologies Used

*   **Runtime & Builder**: [React 19](https://react.dev/) & [Vite](https://vite.dev/)
*   **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) (modern CSS-first framework)
*   **Animations**: [Framer Motion](https://www.framer.com/motion/) (smooth transitions and micro-interactions)
*   **Icons**: [Lucide React](https://lucide.dev/) (consistent, modern icon pack)
*   **Charts & Plots**: [Recharts](https://recharts.org/) (responsive, React-based SVG charting library)
*   **Forms**: [React Hook Form](https://react-hook-form.com/) (performant, flexible form validation)
*   **Routing**: [React Router Dom v7](https://reactrouter.com/) (client-side routing)
*   **HTTP Client**: [Axios](https://axios-http.com/) (configured backend API calls)
*   **Linter**: [Oxlint](https://oxc.rs/) (ultra-fast JavaScript/TypeScript linter)

---

## 📂 Folder Structure

```text
src/
├── assets/         # Static assets (images, logos, etc.)
├── components/     # Common and reusable UI components
│   ├── Layout.jsx  # Main application wrapper with sidebar navigation
│   └── UI/         # Atomic UI elements (Buttons, Cards, Inputs, Tables)
├── context/        # AppContext for global state management (current dataset, model runs, settings)
├── pages/          # App views mapped to routes
│   ├── Dashboard.jsx      # Overview stats, quick actions, database metrics
│   ├── Upload.jsx         # CSV & Excel file upload area with validations
│   ├── Profiling.jsx      # Data health summary, missing values, column stats
│   ├── Cleaning.jsx       # Interactive data cleaning controls (impute, drop, scale)
│   ├── AutoML.jsx         # Target selection, training triggers, leaderboard, and metrics visualization
│   ├── Visualizations.jsx # Customized charts and plotting tools
│   ├── Reports.jsx        # PDF generation, list of ready reports, download triggers
│   ├── History.jsx        # Activity log of all platform operations
│   └── Settings.jsx       # Custom API keys, titles, and layout configurations
├── services/       # API services mapping communication to the FastAPI backend
│   └── api.js      # Axios instance configurations and endpoint requests
├── App.css         # Custom stylesheet overrides
├── App.jsx         # Main router and App component
├── index.css       # Tailwind directives and design system configuration
└── main.jsx        # App mounting and entrypoint
```

---

## ⚡ Setup & Development

### 📋 Prerequisites
Ensure you have [Node.js](https://nodejs.org/) installed (v18.0.0 or higher is recommended).

### 🛠️ Installation

1.  Navigate to the `frontend` directory:
    ```bash
    cd frontend
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

### 🏃 Running Locally

To start the local development server with Hot Module Replacement (HMR):
```bash
npm run dev
```
By default, the application will run at **`http://localhost:5173`**.

---

## 📦 Build & Production

To bundle the application assets for production deployment:
```bash
npm run build
```
This builds and compiles the app into static assets inside the `dist/` directory.

To preview the production build locally:
```bash
npm run preview
```

---

## 🧹 Linting

The project uses `Oxlint` for extremely fast linting:
```bash
npm run lint
```
