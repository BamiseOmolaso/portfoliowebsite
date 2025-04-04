import React from 'react';

export const metadata = {
  title: 'Privacy Policy | Dr. Oluwabamise David Omolaso',
  description: 'Privacy policy and cookie information for Dr. Oluwabamise David Omolaso\'s portfolio website.',
};

export default function PrivacyPolicy() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
      
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Introduction</h2>
        <p className="mb-4">
          This Privacy Policy explains how Dr. Oluwabamise David Omolaso ("we", "us", or "our") collects, uses, and shares your personal information when you visit our portfolio website.
        </p>
        <p className="mb-4">
          We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you about how we look after your personal data when you visit our website and tell you about your privacy rights and how the law protects you.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Information We Collect</h2>
        <p className="mb-4">
          We may collect, use, store and transfer different kinds of personal data about you, including:
        </p>
        <ul className="list-disc pl-6 mb-4 space-y-2">
          <li>Identity Data: name, username</li>
          <li>Contact Data: email address</li>
          <li>Technical Data: internet protocol (IP) address, browser type and version, time zone setting and location, browser plug-in types and versions, operating system and platform, and other technology on the devices you use to access this website</li>
          <li>Usage Data: information about how you use our website</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">How We Use Your Information</h2>
        <p className="mb-4">
          We use your personal data for the following purposes:
        </p>
        <ul className="list-disc pl-6 mb-4 space-y-2">
          <li>To provide and maintain our website</li>
          <li>To notify you about changes to our website</li>
          <li>To provide customer support</li>
          <li>To gather analysis or valuable information so that we can improve our website</li>
          <li>To monitor the usage of our website</li>
          <li>To detect, prevent and address technical issues</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Cookies</h2>
        <p className="mb-4">
          We use cookies and similar tracking technologies to track activity on our website and hold certain information. Cookies are files with a small amount of data which may include an anonymous unique identifier.
        </p>
        <p className="mb-4">
          You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept cookies, you may not be able to use some portions of our website.
        </p>
        <h3 className="text-xl font-semibold mb-2">Types of Cookies We Use</h3>
        <ul className="list-disc pl-6 mb-4 space-y-2">
          <li><strong>Essential Cookies:</strong> These cookies are necessary for the website to function and cannot be switched off in our systems.</li>
          <li><strong>Analytics Cookies:</strong> These cookies help us understand how visitors interact with our website.</li>
          <li><strong>Functionality Cookies:</strong> These cookies allow the website to provide enhanced functionality and personalization.</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Your Rights</h2>
        <p className="mb-4">
          Under certain circumstances, you have rights under data protection laws in relation to your personal data, including the right to:
        </p>
        <ul className="list-disc pl-6 mb-4 space-y-2">
          <li>Request access to your personal data</li>
          <li>Request correction of your personal data</li>
          <li>Request erasure of your personal data</li>
          <li>Object to processing of your personal data</li>
          <li>Request restriction of processing your personal data</li>
          <li>Request transfer of your personal data</li>
          <li>Right to withdraw consent</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
        <p className="mb-4">
          If you have any questions about this Privacy Policy, please contact us at:
        </p>
        <p className="mb-4">
          Email: <a href="mailto:contact@example.com" className="text-purple-500 hover:underline">contact@example.com</a>
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Changes to This Privacy Policy</h2>
        <p className="mb-4">
          We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date.
        </p>
        <p className="mb-4">
          Last Updated: {new Date().toLocaleDateString()}
        </p>
      </section>
    </div>
  );
} 