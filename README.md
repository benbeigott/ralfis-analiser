# RALFIS ANALiser 🎵

  BPM Analyzer App mit DJ-Maskottchen RALFIS.

  ## Setup

  ```bash
  pnpm install
  ```

  ## Development

  ```bash
  pnpm --filter @workspace/music-analyzer run dev
  pnpm --filter @workspace/api-server run dev
  ```

  ## Deployment (Vercel)

  1. Repository bei Vercel importieren
  2. Environment Variable setzen: `DATABASE_URL` (z.B. von [neon.tech](https://neon.tech))
  3. Build Settings sind bereits in `vercel.json` konfiguriert

  ## Environment Variables

  Kopiere `.env.example` zu `.env` und fülle die Werte aus.
  