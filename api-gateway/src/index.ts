import 'dotenv/config';
import cors from 'cors';
import express, { Request, Response } from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';

const app = express();
const PORT = process.env.PORT || 4000;
const WEB_UI_ORIGIN = process.env.WEB_UI_ORIGIN || 'http://localhost:3000';

// web-ui is a separate app/origin, so its browser-side fetch() calls need CORS.
// Registered before every route below, including /health, so all of them get it.
app.use(cors({ origin: WEB_UI_ORIGIN }));

app.get('/health', (_req: Request, res: Response) => res.json({ status: 'ok' }));


app.use(
  '/auth',
  createProxyMiddleware({
    target: process.env.AUTH_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: { '^/auth': '' },
  })
);

app.use(
  '/tasks',
  createProxyMiddleware({
    target: process.env.TASK_SERVICE_URL,
    changeOrigin: true,
  })
);

app.use(
  '/reports',
  createProxyMiddleware({
    target: process.env.REPORTING_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: { '^/reports': '' },
  })
);

app.listen(PORT, () => console.log(`api-gateway listening on ${PORT}`));
