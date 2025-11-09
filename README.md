# Frontend Project - Vite + React + TailwindCSS + DaisyUI

This is a complete frontend setup using **react-Vite**, , **TailwindCSS**, and **DaisyUI**.  
Follow this guide to create, configure, and run the project from scratch.

---

## 1. Prerequisites

Ensure you have **Node.js** and **npm** installed:

```bash
node -v      # Check Node.js version
npm -v       # Check npm version
Recommended versions:

Node.js: v18 or higher

npm: v9 or higher

2. Create a New React Project with Vite
Use the following command to create a new Vite project using React + SWC:

npm create vite@latest my-project -- --template react-swc
cd my-project
Install dependencies:
npm install

3. Install TailwindCSS
Install TailwindCSS and the Vite plugin:
npm install -D tailwindcss @tailwindcss/vite

4. Configure Vite for TailwindCSS
Open vite.config.js and configure TailwindCSS:


import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
});
5. Setup TailwindCSS Styles
In index.css (or main CSS file), add:



6. Install DaisyUI
Install DaisyUI plugin:
npm i -D daisyui@latest
@import "tailwindcss";
@plugin "daisyui";


7. Server-Backend commands:
npm init -y
npm install express mongoose nodemon dotenv