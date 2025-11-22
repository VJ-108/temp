import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
export default defineConfig({
	plugins: [react()],
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "src"),
		},
	},
	// ⭐ Needed for external access (both dev + preview)
	server: {
		host: true, // binds to 0.0.0.0
	},

	// ⭐ Needed to allow nip.io domain in Vite preview
	preview: {
		host: true,
		allowedHosts: ["56.228.23.204.nip.io"],
	},
});
