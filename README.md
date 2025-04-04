# Dr. Oluwabamise David Omolaso's Portfolio Website

A modern, responsive portfolio website showcasing Dr. Oluwabamise David Omolaso's expertise in healthcare data science, AI applications, and cloud technologies.

## Features

- Modern dark theme with purple accent colors
- Responsive design for all devices
- Smooth animations and transitions
- Blog section for sharing insights
- Portfolio showcase with tag filtering
- Contact form with email notifications and spam protection
- Newsletter subscription with admin notifications and preferences management
- About section with experience timeline
- Downloadable resume
- Performance monitoring dashboard
- Admin dashboard for managing newsletters and subscribers
- Cookie consent management
- reCAPTCHA integration for form protection
- Rate limiting and security measures
- Email authentication and verification

## Technologies Used

- Next.js 14.2.26
- TypeScript
- Tailwind CSS
- Framer Motion
- React Icons
- Supabase for database and authentication
- Resend for email notifications
- TipTap for rich text editing
- DOMPurify for HTML sanitization
- Zod for schema validation
- Google reCAPTCHA for form protection
- js-cookie for cookie management
- Upstash Redis for rate limiting

## Getting Started

### Prerequisites

- Node.js 18.x or later
- npm or yarn
- Supabase account
- Resend account
- Google reCAPTCHA keys
- Upstash Redis account (for rate limiting)

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/portfolio-website.git
cd portfolio-website
```

2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Create a `.env.local` file in the root directory and add your environment variables:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Email
RESEND_API_KEY=your_resend_api_key
RESEND_FROM_EMAIL=your_from_email
CONTACT_EMAIL=your_contact_email

# Rate Limiting
UPSTASH_REDIS_REST_URL=your_upstash_redis_url
UPSTASH_REDIS_REST_TOKEN=your_upstash_redis_token

# reCAPTCHA
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your_recaptcha_site_key
RECAPTCHA_SECRET_KEY=your_recaptcha_secret_key
```

4. Run the development server:

```bash
npm run dev
# or
yarn dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the result.

## Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── about/             # About page
│   ├── api/               # API routes
│   │   ├── contact/       # Contact form API
│   │   ├── newsletter/    # Newsletter subscription API
│   │   ├── performance/   # Performance monitoring API
│   │   ├── subscribers/   # Subscriber management API
│   │   └── email-auth/    # Email authentication API
│   ├── blog/              # Blog section
│   ├── contact/           # Contact page
│   ├── admin/             # Admin dashboard
│   │   ├── newsletters/   # Newsletter management
│   │   ├── performance/   # Performance metrics
│   │   └── email-auth/    # Email authentication
│   ├── newsletter/        # Newsletter pages
│   │   ├── preferences/   # Subscriber preferences
│   │   └── unsubscribe/   # Unsubscribe page
│   ├── portfolio/         # Portfolio section
│   ├── privacy-policy/    # Privacy policy page
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── layout/           # Layout components
│   │   ├── Navbar.tsx    # Navigation bar
│   │   └── Footer.tsx    # Footer component
│   ├── ContactForm.tsx   # Contact form component
│   ├── Newsletter.tsx    # Newsletter subscription component
│   ├── CookieConsent.tsx # Cookie consent component
│   └── ErrorBoundary.tsx # Error boundary component
├── lib/                  # Utility functions
│   ├── resend.ts         # Email sending utilities
│   ├── supabase.ts       # Supabase client utilities
│   ├── security.ts       # Security utilities
│   ├── rate-limit.ts     # Rate limiting utilities
│   ├── sanitize.ts       # Input sanitization utilities
│   └── cache.ts          # Caching utilities
├── types/                # TypeScript type definitions
│   ├── newsletter.d.ts   # Newsletter types
│   ├── html-to-text.d.ts # HTML to text types
│   ├── jsdom.d.ts        # JSDOM types
│   └── global.d.ts       # Global type definitions
└── public/               # Static assets
```

## Recent Updates

- **Security Enhancements**:
  - Added reCAPTCHA protection for forms
  - Implemented rate limiting for API routes
  - Enhanced input sanitization
  - Added IP blacklisting for suspicious activity
  - Implemented cookie consent management

- **Newsletter System**:
  - Added subscriber preferences management
  - Implemented unsubscribe functionality with feedback
  - Enhanced email authentication
  - Added performance metrics tracking
  - Improved admin dashboard for newsletter management

- **Performance Improvements**:
  - Added caching strategies
  - Optimized database queries
  - Implemented error boundaries
  - Enhanced loading states
  - Added performance monitoring

- **User Experience**:
  - Added cookie consent banner
  - Enhanced form validation
  - Improved error handling
  - Added success notifications
  - Enhanced mobile responsiveness

## Customization

1. Update the content in the respective page components
2. Modify the color scheme in `globals.css`
3. Add your own images to the `public` directory
4. Update the social media links in the Footer component
5. Add your resume PDF to the `public` directory
6. Configure your email templates in the `lib/resend.ts` file
7. Update reCAPTCHA keys in `.env.local`
8. Configure rate limiting settings in `lib/rate-limit.ts`

## Deployment

The site is deployed on Vercel at [https://oluwabamiseomolaso.vercel.app/](https://oluwabamiseomolaso.vercel.app/)

Other deployment options:
- Netlify
- AWS Amplify
- Google Cloud Platform

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contact

Dr. Oluwabamise David Omolaso - [davidbams3@gmail.com](mailto:davidbams3@gmail.com)

Project Link: [https://github.com/yourusername/portfolio-website](https://github.com/yourusername/portfolio-website)
