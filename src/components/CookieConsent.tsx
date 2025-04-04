'use client';

import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import Link from 'next/link';

interface CookiePreferences {
  essential: boolean;
  analytics: boolean;
  marketing: boolean;
}

const COOKIE_CONSENT_KEY = 'portfolio_cookie_consent';
const COOKIE_PREFERENCES_KEY = 'portfolio_cookie_preferences';

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    essential: true, // Always true and cannot be changed
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    // Check if user has already made a choice
    const consent = Cookies.get(COOKIE_CONSENT_KEY);
    const savedPreferences = Cookies.get(COOKIE_PREFERENCES_KEY);
    
    if (!consent) {
      setIsVisible(true);
    }
    
    if (savedPreferences) {
      try {
        const parsedPreferences = JSON.parse(savedPreferences);
        // Ensure all values are booleans
        setPreferences({
          essential: Boolean(parsedPreferences.essential),
          analytics: Boolean(parsedPreferences.analytics),
          marketing: Boolean(parsedPreferences.marketing),
        });
      } catch (e) {
        console.error('Error parsing cookie preferences:', e);
      }
    }
  }, []);

  const handleAcceptAll = () => {
    const newPreferences = {
      essential: true,
      analytics: true,
      marketing: true,
    };
    
    setPreferences(newPreferences);
    Cookies.set(COOKIE_CONSENT_KEY, 'true', { expires: 365 });
    Cookies.set(COOKIE_PREFERENCES_KEY, JSON.stringify(newPreferences), { expires: 365 });
    setIsVisible(false);
    setShowPreferences(false);
    
    // Here you can initialize analytics and marketing tools
    initializeCookies(newPreferences);
  };

  const handleAcceptSelected = () => {
    Cookies.set(COOKIE_CONSENT_KEY, 'true', { expires: 365 });
    Cookies.set(COOKIE_PREFERENCES_KEY, JSON.stringify(preferences), { expires: 365 });
    setIsVisible(false);
    setShowPreferences(false);
    
    // Initialize cookies based on preferences
    initializeCookies(preferences);
  };

  const handleDecline = () => {
    Cookies.set(COOKIE_CONSENT_KEY, 'false', { expires: 365 });
    Cookies.set(COOKIE_PREFERENCES_KEY, JSON.stringify({ essential: true, analytics: false, marketing: false }), { expires: 365 });
    setIsVisible(false);
    setShowPreferences(false);
  };

  const initializeCookies = (prefs: CookiePreferences) => {
    // Initialize analytics if accepted
    if (prefs.analytics) {
      // Add your analytics initialization code here
      console.log('Analytics cookies initialized');
    }

    // Initialize marketing if accepted
    if (prefs.marketing) {
      // Add your marketing cookies initialization code here
      console.log('Marketing cookies initialized');
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900 text-white p-4 shadow-lg z-50">
      <div className="container mx-auto max-w-6xl">
        {!showPreferences ? (
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex-1">
              <p className="text-sm">
                We use cookies to enhance your browsing experience, serve personalized content, and analyze our traffic. 
                By clicking "Accept All", you consent to our use of cookies.{' '}
                <Link href="/privacy-policy" className="text-purple-400 hover:underline">
                  Learn more
                </Link>
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowPreferences(true)}
                className="px-4 py-2 text-sm bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
              >
                Customize
              </button>
              <button
                onClick={handleAcceptAll}
                className="px-4 py-2 text-sm bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
              >
                Accept All
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Cookie Preferences</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Essential Cookies</p>
                  <p className="text-sm text-gray-400">Required for the website to function properly</p>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.essential}
                  disabled
                  className="h-4 w-4 text-purple-600 rounded border-gray-300"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Analytics Cookies</p>
                  <p className="text-sm text-gray-400">Help us understand how visitors interact with our website</p>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.analytics}
                  onChange={(e) => setPreferences({ ...preferences, analytics: e.target.checked })}
                  className="h-4 w-4 text-purple-600 rounded border-gray-300"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Marketing Cookies</p>
                  <p className="text-sm text-gray-400">Used to deliver personalized advertisements</p>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.marketing}
                  onChange={(e) => setPreferences({ ...preferences, marketing: e.target.checked })}
                  className="h-4 w-4 text-purple-600 rounded border-gray-300"
                />
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <button
                onClick={handleDecline}
                className="px-4 py-2 text-sm bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
              >
                Decline All
              </button>
              <button
                onClick={handleAcceptSelected}
                className="px-4 py-2 text-sm bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
              >
                Save Preferences
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 