// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	modules: [
		'@nuxtjs/tailwindcss',
	],
	runtimeConfig: {
		public: {
			API_URL: process.env.API_URL || 'http://localhost:5000/',
		},
	},
	devtools: { enabled: false },
})
