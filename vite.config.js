import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'
import tailwindcss from '@tailwindcss/vite'

// Serves the Vercel functions in /api during `npm run dev`, so email
// sending works locally the same way it does when deployed.
function apiRoutes(env) {
  return {
    name: 'api-routes',
    configureServer(server) {
      Object.assign(process.env, env)

      server.middlewares.use('/api', async (req, res) => {
        const name = new URL(req.url, 'http://localhost').pathname.replace(/^\/+|\/+$/g, '')
        if (!/^[\w-]+$/.test(name)) {
          res.statusCode = 404
          return res.end()
        }

        let handler
        try {
          ;({ default: handler } = await server.ssrLoadModule(`/api/${name}.js`))
        } catch {
          res.statusCode = 404
          return res.end(JSON.stringify({ error: 'Not found' }))
        }

        let raw = ''
        for await (const chunk of req) raw += chunk
        try {
          req.body = raw ? JSON.parse(raw) : undefined
        } catch {
          res.statusCode = 400
          return res.end(JSON.stringify({ error: 'Invalid JSON' }))
        }

        // Minimal version of the helpers Vercel adds to the response.
        res.status = (code) => {
          res.statusCode = code
          return res
        }
        res.json = (body) => {
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify(body))
          return res
        }
        await handler(req, res)
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react(), tailwindcss(), apiRoutes(loadEnv(mode, process.cwd(), ''))],
}))
