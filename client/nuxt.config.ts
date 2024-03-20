// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	modules: [
		'@nuxtjs/tailwindcss',
	],
	// runtimeConfig: {
	// 	API_URL: process.env.API_URL || 'localhost',
	// 	API_PORT: process.env.API_PORT || '5000',
	// },
	devtools: { enabled: false },
})
