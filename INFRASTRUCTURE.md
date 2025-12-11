# GMEL Infrastructure Documentation

## Domain & DNS Mapping

| Subdomain | Target | Platform | Purpose |
|-----------|--------|----------|---------|  
| `gmel.kkm-intl.org` | Vercel Production | Vercel | Main application |
| `gmel.vision.kkm-intl.org` | Vercel Alias | Vercel | Presentation/Investor view |
| `api.gmel.kkm-intl.org` (optional) | server261.web-hosting.com | cPanel | Backend services if separate |

## Hosting Strategy

### Vercel (Frontend + Serverless AI)
- **Production**: Auto-deploy from `main` branch
- **Preview**: Auto-deploy from Pull Requests
- **Custom Domains**: Configured via Vercel dashboard + cPanel DNS (CNAME)
- **Environment Variables**: `API_KEY` for Gemini stored in Vercel Project Settings
- **Build Command**: `npm run build`
- **Output Directory**: `dist`

### cPanel / server261.web-hosting.com (Optional Backend)
- **Use Case**: If persistent database, file storage, or non-serverless APIs needed
- **DNS Management**: A/CNAME records for `kkm-intl.org` subdomains
- **Recommendation**: Keep frontend on Vercel, use cPanel only for heavy backend workloads

## DNS Configuration (cPanel)

For custom subdomains pointing to Vercel:

```
Type: CNAME
Host: gmel
Points to: cname.vercel-dns.com
TTL: Automatic/3600
```

For Vision subdomain:

```
Type: CNAME
Host: gmel.vision
Points to: cname.vercel-dns.com
TTL: Automatic/3600
```

## Deployment Workflow

1. **Push to `main`** → Vercel auto-deploys to Production
2. **Open Pull Request** → Vercel creates Preview deployment  
3. **Merge PR** → Preview becomes Production
4. **Custom domains** (`gmel.kkm-intl.org`) automatically served

## Environment Variables

| Key | Value | Platform |
|-----|-------|----------|
| `API_KEY` | Your Gemini API key | Vercel |
| `NODE_ENV` | `production` | Vercel (auto) |

## File Structure

```
GMEL-TECHNOLOGY-ECOSYSTEM/
├── ROOT/THEME/           # Design tokens
├── components/
│   ├── GEMINI/          # AI UX components
│   ├── admin/           # Admin dashboard
│   ├── auth/            # Authentication
│   └── shared/          # Shared components
├── hooks/               # Custom React hooks
│   ├── USEGEMINIACTION.TS
│   └── useI18n.ts
├── services/            # API services
│   └── geminiService.ts # Gemini AI integration
├── i18n/                # Translations (en, fa, ku)
└── utils/               # Helper functions
```

## Security Considerations

- **API Keys**: Never commit to GitHub; always use Vercel environment variables
- **CORS**: If using separate backend, configure allowed origins
- **Rate Limiting**: Gemini API has rate limits; caching implemented in `geminiService.ts`
- **Authentication**: NDA + role-based access control (Manager, Advisor, Observer)

## Performance Optimization

- **Code Splitting**: Vite automatically splits routes
- **AI Response Caching**: Financial and patent data cached in `Map` objects
- **Lazy Loading**: Heavy components load on demand
- **CDN**: Vercel Edge Network for global distribution

## Monitoring & Logs

- **Vercel Dashboard**: Real-time deployment logs and analytics
- **Browser Console**: Client-side error tracking
- **Gemini API**: Track usage at [Google AI Studio](https://ai.studio)

---

**Last Updated**: December 2025  
**Maintainer**: [@gino-ayyoubian](https://github.com/gino-ayyoubian)
