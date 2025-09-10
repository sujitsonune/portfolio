# Sujit Portfolio

A modern, responsive portfolio website built with Next.js 14, React, TypeScript, and Firebase. Features a comprehensive admin panel, real-time data management, and optimized performance.

## 🚀 Features

### Core Features
- **Modern Stack**: Next.js 14 with App Router, React 18, TypeScript
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Performance Optimized**: Code splitting, lazy loading, image optimization
- **SEO Ready**: Meta tags, structured data, sitemap generation
- **PWA Support**: Service worker, offline functionality, installable
- **Dark/Light Theme**: System preference detection with manual toggle

### Admin Features
- **Firebase Authentication**: Secure admin login system
- **Content Management**: Real-time content updates
- **Image Upload**: Firebase Storage integration
- **Analytics Dashboard**: Performance monitoring and user insights

### Development Features
- **TypeScript**: Full type safety
- **ESLint & Prettier**: Code quality and formatting
- **Jest & Playwright**: Unit and E2E testing
- **GitHub Actions**: Automated CI/CD pipeline
- **Vercel Deployment**: Automatic deployments with preview environments

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Custom components with accessibility focus
- **Animations**: Framer Motion, CSS animations
- **Icons**: Lucide React

### Backend & Database
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth
- **Storage**: Firebase Storage
- **API**: Next.js API Routes
- **Real-time**: Firebase real-time listeners

### DevOps & Deployment
- **Hosting**: Vercel (Primary), Firebase Hosting (Backup)
- **CI/CD**: GitHub Actions
- **Monitoring**: Sentry, Vercel Analytics
- **Testing**: Jest, Playwright, Lighthouse CI

## 📦 Installation

### Prerequisites
```bash
node >= 18.0.0
npm >= 9.0.0
git
```

### Local Development
```bash
# Clone the repository
git clone https://github.com/sujitsonune/portfolio.git
cd portfolio

# Install dependencies
npm install

# Copy environment template
cp .env.example .env.local

# Configure environment variables (see Environment Setup)
nano .env.local

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## ⚙️ Environment Setup

### Required Environment Variables

Create a `.env.local` file in the root directory:

```bash
# Application Configuration
NODE_ENV=development
NEXT_PUBLIC_APP_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME="Sujit Portfolio"

# Firebase Configuration (Client-side)
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Firebase Admin SDK (Server-side)
FIREBASE_ADMIN_PROJECT_ID=your_project_id
FIREBASE_ADMIN_CLIENT_EMAIL=your_service_account_email
FIREBASE_ADMIN_PRIVATE_KEY="your_private_key_with_newlines"

# Contact Form Configuration
EMAILJS_SERVICE_ID=your_emailjs_service_id
EMAILJS_TEMPLATE_ID=your_emailjs_template_id
EMAILJS_PUBLIC_KEY=your_emailjs_public_key

# Admin Configuration
ADMIN_EMAIL=admin@yourdomain.com
CONTACT_EMAIL=contact@yourdomain.com

# Optional: Analytics & Monitoring
NEXT_PUBLIC_SENTRY_DSN=https://your_sentry_dsn_here
NEXT_PUBLIC_VERCEL_ANALYTICS_ID=your_vercel_analytics_id
```

### Firebase Setup

1. Create a new Firebase project at [Firebase Console](https://console.firebase.google.com)
2. Enable Authentication with Email/Password provider
3. Create a Firestore database
4. Set up Firebase Storage
5. Generate a service account key for admin operations
6. Configure security rules (provided in `firestore.rules` and `storage.rules`)

## 🚀 Deployment

### Automatic Deployment (Recommended)

1. **Fork or clone this repository**
2. **Connect to Vercel**:
   - Visit [Vercel Dashboard](https://vercel.com/dashboard)
   - Import your GitHub repository
   - Configure environment variables
   - Deploy automatically on every push to `main`

3. **GitHub Actions**: Automated CI/CD pipeline handles:
   - Code quality checks (ESLint, TypeScript)
   - Testing (Jest, Playwright)
   - Security scans
   - Performance audits
   - Deployment

### Manual Deployment

#### Vercel CLI
```bash
# Install Vercel CLI
npm install -g vercel

# Login and deploy
vercel login
vercel --prod
```

#### Firebase Hosting (Backup)
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Build and deploy
npm run build
npm run export
firebase deploy --only hosting
```

## 🧪 Testing

### Unit Tests
```bash
npm run test              # Run Jest tests
npm run test:watch        # Run tests in watch mode
npm run test:coverage     # Generate coverage report
```

### E2E Tests
```bash
npm run test:e2e          # Run Playwright tests
npm run test:e2e:ui       # Run with UI mode
npm run test:e2e:debug    # Debug mode
```

### Performance Testing
```bash
npm run lighthouse        # Lighthouse CI audit
npm run test:performance  # Performance benchmarks
```

## 📁 Project Structure

```
portfolio/
├── src/
│   ├── app/              # Next.js App Router
│   │   ├── api/          # API routes
│   │   ├── admin/        # Admin panel pages
│   │   └── globals.css   # Global styles
│   ├── components/       # React components
│   │   ├── admin/        # Admin-specific components
│   │   ├── layout/       # Layout components
│   │   ├── sections/     # Page sections
│   │   └── ui/           # Reusable UI components
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Utility libraries
│   ├── stores/           # State management
│   ├── types/            # TypeScript type definitions
│   └── utils/            # Helper functions
├── public/               # Static assets
├── docs/                 # Documentation
├── e2e/                  # End-to-end tests
├── scripts/              # Build and deployment scripts
└── .github/workflows/    # GitHub Actions
```

## 🔧 Available Scripts

### Development
```bash
npm run dev               # Start development server
npm run build             # Build for production
npm run start             # Start production server
npm run lint              # Run ESLint
npm run lint:fix          # Fix ESLint errors
npm run type-check        # TypeScript type checking
```

### Testing & Quality
```bash
npm run test              # Unit tests
npm run test:e2e          # E2E tests
npm run lighthouse        # Performance audit
npm run analyze           # Bundle analysis
```

### Deployment
```bash
npm run deploy:vercel     # Deploy to Vercel
npm run deploy:firebase   # Deploy to Firebase
npm run backup            # Backup database
npm run restore           # Restore database
```

## 🔐 Security

### Security Features
- Content Security Policy (CSP) headers
- Firebase Security Rules
- Input validation and sanitization
- Authentication middleware
- Rate limiting on API routes
- Secure environment variable handling

### Security Checklist
- [ ] Environment variables properly configured
- [ ] Firebase security rules deployed
- [ ] CSP headers configured
- [ ] HTTPS enforced in production
- [ ] Admin access properly restricted
- [ ] Error messages sanitized

## 📊 Performance

### Optimization Features
- Next.js Image optimization
- Code splitting and lazy loading
- Tree shaking and dead code elimination
- Service Worker for caching
- CDN integration via Vercel
- Bundle size monitoring

### Performance Metrics
- Lighthouse CI integration
- Core Web Vitals monitoring
- Real User Monitoring (RUM)
- Bundle size analysis
- Performance budgets

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Write tests for new features
- Ensure accessibility compliance
- Update documentation
- Follow commit message conventions

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [Firebase](https://firebase.google.com/) - Backend services
- [Vercel](https://vercel.com/) - Deployment platform
- [Tailwind CSS](https://tailwindcss.com/) - Styling framework
- [Framer Motion](https://www.framer.com/motion/) - Animations
- [Lucide](https://lucide.dev/) - Icons

## 📞 Contact

- **Email**: [contact@sujitportfolio.com](mailto:contact@sujitportfolio.com)
- **LinkedIn**: [Sujit Sonune](https://linkedin.com/in/sujitsonune)
- **Portfolio**: [https://sujitportfolio.com](https://sujitportfolio.com)

---

**Made with ❤️ by Sujit Sonune**
