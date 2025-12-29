# GMEL Technology Ecosystem - Architecture Documentation

## System Overview

The GMEL Technology Ecosystem is a dual-purpose platform designed for:
1. **Production Deployment**: Enterprise-grade hosting on dedicated infrastructure
2. **Development/CDN**: Vercel-based edge deployment for global distribution

## Deployment Strategy

### Current Deployment Architecture

#### 1. Primary Production (cPanel)
- **Domain**: gmel.kkm-intl.org
- **Purpose**: Main production environment
- **Infrastructure**: Dedicated hosting (server261.web-hosting.com)
- **Benefits**: 
  - Full server control
  - Custom configurations
  - Enterprise security
  - Direct database access

#### 2. CDN/Edge Deployment (Vercel)
- **Domains**: 
  - gmel.vision.kkm-intl.org
  - gmel-technology-ecosystem.vercel.app
- **Purpose**: Global CDN and development preview
- **Benefits**:
  - Edge network distribution
  - Automatic SSL
  - Git-based CI/CD
  - Zero-downtime deployments

### Recommended Architecture

```
┌─────────────────────────────────────────┐
│         User Traffic                     │
└──────────────┬──────────────────────────┘
               │
        DNS Routing
               │
       ┌───────┴────────┐
       │                │
       ▼                ▼
┌──────────────┐  ┌──────────────┐
│   Vercel     │  │   cPanel     │
│   (Edge)     │  │  (Origin)    │
│              │  │              │
│ - Static     │  │ - Dynamic    │
│ - API Proxy  │  │ - Database   │
│ - CDN        │  │ - Backend    │
└──────────────┘  └──────────────┘
```

## Technical Stack

### Frontend
- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite 5
- **Styling**: Tailwind CSS + Framer Motion
- **State Management**: React Context + Hooks

### Backend/API
- **API Layer**: Vercel Serverless Functions
- **AI Integration**: Google Gemini API
- **Proxy**: Custom API proxy for security

### Infrastructure
- **DNS**: Cloudflare/Namecheap
- **Hosting**: cPanel (primary) + Vercel (edge)
- **SSL**: Automatic via Let's Encrypt

## Security Architecture

### API Key Management
```
Environment Variables (Vercel)
├── VITE_GEMINI_API_KEY (development only)
└── GEMINI_API_KEY (serverless functions)

Production (cPanel)
├── .env (not in git)
└── Environment-specific configs
```

### Security Layers
1. **API Proxy**: `/api/gemini-proxy.ts`
   - Hides API keys from client
   - Rate limiting
   - Request validation

2. **CORS Configuration**
   - Allowed origins only
   - Credential handling

3. **Authentication**
   - Admin authentication system
   - Secure password handling

## Deployment Workflows

### Development Workflow
```bash
# Local development
npm run dev

# Test build
npm run build
npm run preview

# Deploy to Vercel (auto)
git push origin main
```

### Production Workflow (cPanel)
```bash
# Via Git Version Control in cPanel
1. Pull latest from GitHub
2. Run build: npm run build
3. Deploy to public_html
4. Configure environment variables
```

## Scaling Considerations

### Current Setup (Small Scale)
- Single origin server (cPanel)
- Vercel edge network
- Suitable for: 1K-10K daily users

### Future Scaling (Enterprise)
- Load balancer before cPanel
- Database replication
- Redis caching layer
- Microservices architecture
- Kubernetes orchestration

## Monitoring & Performance

### Key Metrics
- **Page Load Time**: < 2s (target)
- **API Response**: < 500ms
- **Uptime**: 99.9%
- **CDN Hit Rate**: > 80%

### Monitoring Tools
- Vercel Analytics (edge performance)
- cPanel metrics (server resources)
- Google Analytics (user behavior)
- Uptime monitoring (StatusCake/UptimeRobot)

## File Structure

```
GMEL-TECHNOLOGY-ECOSYSTEM/
├── api/
│   └── gemini-proxy.ts        # Serverless API proxy
├── src/
│   ├── components/            # React components
│   ├── contexts/              # State management
│   ├── pages/                 # Route pages
│   ├── services/              # API services
│   └── types/                 # TypeScript types
├── public/                    # Static assets
├── docs/                      # Documentation
│   ├── DEPLOYMENT.md
│   └── ARCHITECTURE.md        # This file
├── vite.config.ts             # Vite configuration
├── vercel.json                # Vercel config
└── package.json
```

## Environment Configuration

### Development (.env.local)
```env
VITE_GEMINI_API_KEY=your_development_key
VITE_API_BASE_URL=http://localhost:5173
```

### Production (Vercel)
```env
GEMINI_API_KEY=production_key
NODE_ENV=production
```

### Production (cPanel)
```env
VITE_GEMINI_API_KEY=production_key
VITE_API_BASE_URL=https://gmel.kkm-intl.org
```

## API Integration

### Gemini AI API
- **Version**: v1beta
- **Model**: gemini-2.0-flash-exp
- **Features**:
  - Natural language processing
  - Content generation
  - Multi-modal support

### API Flow
```
Client → /api/gemini-proxy → Gemini API → Response
         ↑
    Environment variables
    (secure, server-side)
```

## Best Practices

### Code Quality
- TypeScript strict mode
- ESLint + Prettier
- Component-based architecture
- Reusable hooks and utilities

### Performance
- Code splitting
- Lazy loading
- Image optimization
- Bundle size monitoring

### Security
- No API keys in client code
- HTTPS everywhere
- Regular dependency updates
- Security headers

## Backup & Recovery

### Backup Strategy
1. **Code**: GitHub repository (primary)
2. **Assets**: cPanel backup (weekly)
3. **Database**: Automated backups (daily)
4. **Configuration**: Documented in this repo

### Recovery Plan
1. Restore from GitHub
2. Rebuild and deploy
3. Update environment variables
4. Verify functionality

## Future Roadmap

### Phase 1: Current Implementation ✓
- [x] Basic React application
- [x] Gemini AI integration
- [x] Vercel deployment
- [x] cPanel setup preparation

### Phase 2: Enhancement (Q1 2025)
- [ ] Database integration
- [ ] User management system
- [ ] Advanced analytics
- [ ] API rate limiting

### Phase 3: Scale (Q2 2025)
- [ ] Multi-region deployment
- [ ] Microservices refactor
- [ ] Advanced caching
- [ ] Performance optimization

### Phase 4: Enterprise (Q3-Q4 2025)
- [ ] White-label capabilities
- [ ] Multi-tenancy
- [ ] Advanced security features
- [ ] Compliance certifications

## Support & Maintenance

### Development Team
- **Repository**: github.com/gino-ayyoubian/GMEL-TECHNOLOGY-ECOSYSTEM
- **Organization**: KKM International
- **Contact**: via GitHub issues

### Documentation
- Architecture: This document
- Deployment: DEPLOYMENT.md
- API: Inline code documentation
- User Guide: Coming soon

## Compliance & Standards

### Web Standards
- HTML5 semantic markup
- WCAG 2.1 accessibility
- Responsive design
- Progressive enhancement

### Industry Standards
- RESTful API design
- OAuth 2.0 ready
- GDPR considerations
- ISO 27001 aligned practices

---

**Last Updated**: January 2025  
**Version**: 1.0.0  
**Maintained by**: GMEL Technology Team
