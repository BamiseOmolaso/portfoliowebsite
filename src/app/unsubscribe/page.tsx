'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { motion } from 'framer-motion';
import Link from 'next/link';

const UNSUBSCRIBE_REASONS = {
  no_longer_interested: 'No longer interested',
  too_many_emails: 'Too many emails',
  content_not_relevant: 'Content not relevant',
  not_interesting: 'Content not interesting',
  spam: 'Marked as spam',
  other: 'Other reason'
} as const;

function UnsubscribeContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<'loading' | 'initial' | 'confirm' | 'success' | 'error' | 'feedback'>('loading');
  const [feedback, setFeedback] = useState('');
  const [reason, setReason] = useState('');
  const [message, setMessage] = useState('');

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    if (token) {
      verifyToken();
    } else {
      setStatus('error');
      setMessage('Invalid unsubscribe link. No token provided.');
    }
  }, [token]);

  const verifyToken = async () => {
    try {
      const { data: tokenData, error: tokenError } = await supabase
        .from('newsletter_subscribers')
        .select('email, unsubscribe_token_expires_at')
        .eq('unsubscribe_token', token)
        .single();
      
      if (tokenError || !tokenData) {
        setStatus('error');
        setMessage('Invalid unsubscribe link. Please try again or contact us for assistance.');
        return;
      }
      
      if (tokenData.unsubscribe_token_expires_at && 
          new Date(tokenData.unsubscribe_token_expires_at) < new Date()) {
        setStatus('error');
        setMessage('This unsubscribe link has expired. Please contact us if you wish to unsubscribe.');
        return;
      }
      
      setStatus('initial');
    } catch (error) {
      console.error('Error verifying token:', error);
      setStatus('error');
      setMessage('An error occurred while processing your request. Please try again later.');
    }
  };

  const handleUnsubscribe = async () => {
    try {
      const { error: updateError } = await supabase
        .from('newsletter_subscribers')
        .update({ is_subscribed: false })
        .eq('unsubscribe_token', token);

      if (updateError) {
        throw updateError;
      }
      
      setStatus('success');
    } catch (error) {
      console.error('Error unsubscribing:', error);
      setStatus('error');
      setMessage('An error occurred while processing your request. Please try again later.');
    }
  };

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // First, update the feedback
      const { error: feedbackError } = await supabase
        .from('newsletter_subscribers')
        .update({ 
          unsubscribe_reason: reason, 
          unsubscribe_feedback: feedback 
        })
        .eq('unsubscribe_token', token);

      if (feedbackError) throw feedbackError;

      // Then, unsubscribe the user
      const { error: unsubscribeError } = await supabase
        .from('newsletter_subscribers')
        .update({ is_subscribed: false })
        .eq('unsubscribe_token', token);

      if (unsubscribeError) throw unsubscribeError;

      setStatus('success');
    } catch (error) {
      console.error('Error in unsubscribe process:', error);
      setStatus('error');
      setMessage('An error occurred while processing your request. Please try again later.');
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4 text-white">Processing your request...</h1>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4 text-white">Error</h1>
          <p className="text-gray-400">{message}</p>
        </div>
      </div>
    );
  }

  if (status === 'initial') {
    return (
      <div className="min-h-screen bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-800 p-8 rounded-lg shadow-lg"
          >
            <h1 className="text-2xl font-bold text-white mb-6">We're sorry to see you go!</h1>
            <p className="text-gray-300 mb-6">
              Before you unsubscribe, would you like to:
            </p>
            <div className="space-y-4">
              <Link
                href="/newsletter/preferences"
                className="block w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors text-center"
              >
                Update your preferences
              </Link>
              <Link
                href="/blog"
                className="block w-full px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition-colors text-center"
              >
                Check out our latest articles
              </Link>
              <button
                onClick={() => setStatus('confirm')}
                className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                Continue with unsubscribe
              </button>
              <button
                onClick={() => window.history.back()}
                className="w-full px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition-colors"
              >
                Go Back
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  if (status === 'confirm') {
    return (
      <div className="min-h-screen bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-800 p-8 rounded-lg shadow-lg"
          >
            <h1 className="text-2xl font-bold text-white mb-6">Confirm Unsubscribe</h1>
            <p className="text-gray-300 mb-6">
              Are you sure you want to unsubscribe from our newsletter? You'll no longer receive updates about:
            </p>
            <ul className="text-gray-300 mb-6 space-y-2">
              <li>• Latest blog posts and articles</li>
              <li>• Exclusive content and insights</li>
              <li>• Updates about new features</li>
            </ul>
            <div className="space-y-4">
              <button
                onClick={() => setStatus('feedback')}
                className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                Yes, Unsubscribe Me
              </button>
              <button
                onClick={() => setStatus('initial')}
                className="w-full px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition-colors"
              >
                No, Keep Me Subscribed
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  if (status === 'feedback') {
    return (
      <div className="min-h-screen bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-800 p-8 rounded-lg shadow-lg"
          >
            <h1 className="text-2xl font-bold text-white mb-6">We'd love your feedback</h1>
            <p className="text-gray-300 mb-6">
              Before you go, please let us know why you're unsubscribing. This helps us improve our content.
            </p>
            
            <form onSubmit={handleSubmitFeedback} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Why are you unsubscribing?
                </label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                >
                  <option value="">Select a reason</option>
                  {Object.entries(UNSUBSCRIBE_REASONS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Additional feedback (optional)
                </label>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  rows={4}
                  placeholder="Please share any additional feedback..."
                />
              </div>

              <div className="flex space-x-4">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                >
                  Submit Feedback & Unsubscribe
                </button>
                <button
                  type="button"
                  onClick={() => setStatus('confirm')}
                  className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition-colors"
                >
                  Go Back
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800 p-8 rounded-lg shadow-lg text-center"
        >
          <h1 className="text-2xl font-bold text-white mb-6">You've been unsubscribed</h1>
          <p className="text-gray-300 mb-6">
            Thank you for being part of our community. We're always here if you want to come back!
          </p>
          <div className="space-y-4">
            <Link
              href="/newsletter"
              className="block w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
            >
              Resubscribe
            </Link>
            <Link
              href="/"
              className="block w-full px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition-colors"
            >
              Return to Home
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default function UnsubscribePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4 text-white">Loading...</h1>
        </div>
      </div>
    }>
      <UnsubscribeContent />
    </Suspense>
  );
} 