import React from 'react';
import { Link } from 'react-router-dom';
import Logo from '../src/components/Logo';

const Privacy: React.FC = () => {
  return (
    <div className="min-h-screen bg-background-light text-secondary">
      {/* Navigation — matches Landing page header */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background-light/80 backdrop-blur-md px-4 md:px-8 lg:px-14">
        <div className="max-w-[1400px] mx-auto">
          <div className="flex items-center justify-between py-5 border-b border-secondary/[0.06]">
            <Link to="/">
              <Logo className="h-10" showText={true} />
            </Link>
          </div>
        </div>
      </nav>

      {/* Content — centered reading column */}
      <main className="max-w-[1800px] mx-auto px-6 md:px-12 lg:px-20 pt-32 md:pt-40 pb-16 md:pb-24">
        <header className="mb-20 text-center">
          <h1 className="font-serif text-4xl md:text-5xl text-secondary mb-4">Privacy</h1>
          <p className="text-stone-text text-sm tracking-wide">Last updated: February 2026</p>
        </header>

        <div className="space-y-14 text-[15px] leading-[1.85] text-stone-700">
          {/* 1. Introduction */}
          <section>
            <h2 className="font-serif text-xl md:text-2xl text-secondary mb-4">Introduction</h2>
            <p>
              Fincurio is built to help you understand your relationship with money. We believe
              that starts with trust, so we treat your data with care, transparency, and respect.
              This policy explains what we collect, why, and how you stay in control.
            </p>
          </section>

          {/* 2. What We Collect */}
          <section>
            <h2 className="font-serif text-xl md:text-2xl text-secondary mb-4">What We Collect</h2>
            <p className="mb-6">We only collect information that you provide directly:</p>

            <div className="mb-6">
              <h3 className="font-medium text-secondary mb-2">Account Information</h3>
              <p className="text-stone-600">Your name, email address, and password (securely hashed, never stored in plain text).</p>
            </div>

            <div className="mb-6">
              <h3 className="font-medium text-secondary mb-2">Preferences</h3>
              <p className="text-stone-600">Your preferred currency.</p>
            </div>

            <div className="mb-6">
              <h3 className="font-medium text-secondary mb-2">Financial Information</h3>
              <p className="text-stone-600">
                Transactions you enter (date, amount, type, merchant, notes), the categories
                you assign, and insights derived from your activity (calculated, never shared).
              </p>
            </div>

            <p className="text-stone-500 text-sm italic">
              We do not connect to your bank. All financial data is manually entered by you.
            </p>
          </section>

          {/* 3. How We Use Your Data */}
          <section>
            <h2 className="font-serif text-xl md:text-2xl text-secondary mb-4">How We Use Your Data</h2>
            <p className="mb-4">Your data is used to power the features you use:</p>
            <p className="text-stone-600">
              Displaying your financial dashboard and spending summaries, generating insights
              and category breakdowns, sending account-related emails (verification, password reset),
              and improving product reliability.
            </p>
            <p className="mt-6 font-medium text-secondary">
              We do not sell your data. We do not share it with advertisers. Ever.
            </p>
          </section>

          {/* 4. Data Security */}
          <section>
            <h2 className="font-serif text-xl md:text-2xl text-secondary mb-4">Data Security</h2>
            <p className="mb-4">We take reasonable measures to protect your information:</p>
            <p className="text-stone-600">
              All data is transmitted over HTTPS. Passwords are hashed using industry-standard
              algorithms. Your data is stored in a secure, managed database. Authentication uses
              short-lived tokens with secure refresh mechanisms, and access to production systems
              is restricted.
            </p>
            <p className="mt-4">
              No system is perfectly secure, but we are committed to following best practices
              and responding promptly to any issues.
            </p>
          </section>

          {/* 5. Third-Party Services */}
          <section>
            <h2 className="font-serif text-xl md:text-2xl text-secondary mb-4">Third-Party Services</h2>
            <p className="mb-4">
              We use a small number of trusted services to operate Fincurio:
            </p>
            <p className="text-stone-600">
              A hosting provider for running the application, a database provider for securely
              storing your data, and an email provider for sending verification and password
              reset emails.
            </p>
            <p className="mt-4">
              These services only receive the minimum data necessary to function.
              We do not share your data with advertising or analytics platforms.
            </p>
          </section>

          {/* 6. Your Control */}
          <section>
            <h2 className="font-serif text-xl md:text-2xl text-secondary mb-4">Your Control</h2>
            <p className="mb-4">You are in control of your data at all times.</p>
            <p className="text-stone-600">
              You can edit or delete any transaction, update your profile and preferences,
              change your password, or request deletion of your account and all associated data.
            </p>
            <p className="mt-4">
              To request account deletion, contact us at the email below. We will process
              your request promptly.
            </p>
          </section>

          {/* 7. Cookies */}
          <section>
            <h2 className="font-serif text-xl md:text-2xl text-secondary mb-4">Cookies &amp; Local Storage</h2>
            <p>
              Fincurio uses local storage to maintain your login session. We do not use
              third-party tracking cookies or advertising pixels. Your session tokens are
              stored locally on your device and are used solely for authentication.
            </p>
          </section>

          {/* 8. Contact */}
          <section>
            <h2 className="font-serif text-xl md:text-2xl text-secondary mb-4">Contact</h2>
            <p>
              If you have questions about this privacy policy or how your data is handled,
              reach out to us at{' '}
              <a href="mailto:support@fincurio.com" className="text-primary hover:underline">
                support@fincurio.com
              </a>.
            </p>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-12 text-center">
        <p className="text-stone-400 text-xs tracking-wide">
          &copy; {new Date().getFullYear()} Fincurio. Your Money, Understood.
        </p>
      </footer>
    </div>
  );
};

export default Privacy;
