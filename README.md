# Dr. Oluwabamise David Omolaso's Portfolio Website

A modern, responsive portfolio website showcasing Dr. Oluwabamise David Omolaso's expertise in healthcare data science, AI applications, and cloud technologies.

## Features

- Modern dark theme with purple accent colors
- Responsive design for all devices
- Smooth animations and transitions
- Blog section for sharing insights
- Portfolio showcase
- Contact form with email notifications
- Newsletter subscription with admin notifications
- About section with experience timeline
- Downloadable resume
- Performance monitoring
- Dashboard for managing newsletters and subscribers

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

## Getting Started

### Prerequisites

- Node.js 18.x or later
- npm or yarn

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
│   │   └── subscribers/   # Subscriber management API
│   ├── blog/              # Blog section
│   ├── contact/           # Contact page
│   ├── dashboard/         # Admin dashboard
│   │   └── newsletters/   # Newsletter management
│   ├── portfolio/         # Portfolio section
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── layout/           # Layout components
│   │   ├── Navbar.tsx    # Navigation bar
│   │   └── Footer.tsx    # Footer component
│   ├── ContactForm.tsx   # Contact form component
│   └── Newsletter.tsx    # Newsletter subscription component
├── lib/                  # Utility functions
│   ├── resend.ts         # Email sending utilities
│   └── supabase.ts       # Supabase client utilities
├── types/                # TypeScript type definitions
│   ├── newsletter.d.ts   # Newsletter types
│   ├── html-to-text.d.ts # HTML to text types
│   └── jsdom.d.ts        # JSDOM types
└── public/               # Static assets
```

## Recent Updates

- **Newsletter Subscription**: Added a newsletter subscription feature with email notifications for both subscribers and admin
- **Contact Form Improvements**: Enhanced contact form with redirection to home page after successful submission
- **TypeScript Improvements**: Added custom type definitions for third-party libraries and improved type safety
- **Performance Monitoring**: Implemented performance monitoring for Core Web Vitals
- **Admin Dashboard**: Added a dashboard for managing newsletters and subscribers
- **Email Notifications**: Integrated Resend for sending welcome emails and admin notifications
- **Security Enhancements**: Added HTML sanitization for user inputs and rate limiting for API routes

## Customization

1. Update the content in the respective page components
2. Modify the color scheme in `globals.css`
3. Add your own images to the `public` directory
4. Update the social media links in the Footer component
5. Add your resume PDF to the `public` directory
6. Configure your email templates in the `lib/resend.ts` file

## Deployment

The site can be deployed to any platform that supports Next.js applications, such as:

- Vercel (recommended)
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
