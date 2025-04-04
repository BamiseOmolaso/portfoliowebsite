'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import ReCAPTCHA from 'react-google-recaptcha';

const Newsletter = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [requiresCaptcha, setRequiresCaptcha] = useState(false);
  const [captchaToken, setCaptchaToken] = useState('');

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setStatus('loading');

    if (!email || !validateEmail(email)) {
      setError('Please enter a valid email address');
      setStatus('error');
      return;
    }

    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          name,
          captchaToken: requiresCaptcha ? captchaToken : undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.requiresCaptcha) {
          setRequiresCaptcha(true);
          setError('Please complete the CAPTCHA verification');
        } else {
          setError(data.error || 'Failed to subscribe to newsletter');
        }
        setStatus('error');
        return;
      }

      setStatus('success');
      setMessage('Thank you for subscribing to our newsletter!');
      setEmail('');
      setName('');
      setCaptchaToken('');
      
      // Redirect to home page after 2 seconds
      setTimeout(() => {
        router.push('/');
      }, 2000);
    } catch (error) {
      setError('An error occurred. Please try again later.');
      setStatus('error');
    }
  };

  const handleCaptchaChange = (token: string | null) => {
    setCaptchaToken(token || '');
  };

  return (
    <div className="min-h-screen bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800 p-8 rounded-lg shadow-lg"
        >
          <h2 className="text-2xl font-bold text-white mb-6">Subscribe to Newsletter</h2>

          {status === 'success' ? (
            <div className="bg-green-500/10 border border-green-500 text-green-500 px-4 py-3 rounded">
              {message}
              <p className="mt-2 text-sm">Redirecting to home page...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                  Name (Optional)
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Your name"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className={`w-full px-4 py-2 bg-gray-700 border ${
                    error ? 'border-red-500' : 'border-gray-600'
                  } rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                  placeholder="your@email.com"
                  disabled={status === 'loading'}
                />
                {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
              </div>

              {requiresCaptcha && (
                <div className="flex justify-center">
                  <ReCAPTCHA
                    sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!}
                    onChange={handleCaptchaChange}
                  />
                </div>
              )}

              {status === 'error' && (
                <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded">
                  {message}
                </div>
              )}

              <button
                type="submit"
                disabled={status === 'loading' || (requiresCaptcha && !captchaToken)}
                className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {status === 'loading' ? 'Subscribing...' : 'Subscribe'}
              </button>
            </form>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Newsletter;
