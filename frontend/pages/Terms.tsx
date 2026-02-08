import React from 'react';
import { Link } from 'react-router-dom';
import Logo from '../src/components/Logo';

const Terms: React.FC = () => {
  return (
    <div className="min-h-screen bg-background-light text-secondary">
      {/* Navigation */}
      <nav className="px-6 md:px-12 lg:px-20 py-6 flex items-center justify-center max-w-[1400px] mx-auto">
        <Link to="/">
          <Logo className="h-8" showText={true} />
        </Link>
      </nav>

      {/* Content */}
      <main className="max-w-[720px] mx-auto px-6 md:px-8 py-12 md:py-20 text-center">
        <header className="mb-16">
          <h1 className="font-serif text-4xl md:text-5xl text-secondary mb-4">Terms of Service</h1>
          <p className="text-stone-text text-sm tracking-wide">Last updated: February 2026</p>
        </header>

        <div className="space-y-14 text-[15px] leading-[1.85] text-stone-700">
          {/* 1. Introduction */}
          <section>
            <h2 className="font-serif text-xl md:text-2xl text-secondary mb-4">Introduction</h2>
            <p>
              Welcome to Fincurio. By creating an account or using our service, you agree to these
              terms. They're written to be clear and fair, please read them carefully.
            </p>
          </section>

          {/* 2. Account Responsibility */}
          <section>
            <h2 className="font-serif text-xl md:text-2xl text-secondary mb-4">Account Responsibility</h2>
            <p>
              When you create an account, you agree to provide accurate information, keep your
              login credentials secure and confidential, notify us promptly if you suspect
              unauthorized access, and accept responsibility for all activity under your account.
            </p>
          </section>

          {/* 3. Nature of the Service */}
          <section>
            <h2 className="font-serif text-xl md:text-2xl text-secondary mb-4">Nature of the Service</h2>
            <p>
              Fincurio is a personal financial tracking and insights tool. It helps you record
              transactions, visualize spending patterns, and reflect on your financial habits.
            </p>
            <p className="mt-4 font-medium text-secondary bg-surface-dark/60 border border-stone-300/40 rounded-xl px-5 py-4">
              Fincurio provides financial tracking and insights, not financial advice. Nothing in this
              service should be interpreted as professional financial, tax, or investment guidance.
              Always consult a qualified professional for financial decisions.
            </p>
          </section>

          {/* 4. Acceptable Use */}
          <section>
            <h2 className="font-serif text-xl md:text-2xl text-secondary mb-4">Acceptable Use</h2>
            <p>
              You agree not to use the service for any unlawful purpose, attempt to gain
              unauthorized access to our systems or other users' data, scrape or use automated
              tools to extract data, interfere with the service's infrastructure, or impersonate
              another person.
            </p>
          </section>

          {/* 5. Data Accuracy */}
          <section>
            <h2 className="font-serif text-xl md:text-2xl text-secondary mb-4">Data Accuracy</h2>
            <p>
              All financial data in Fincurio is entered manually by you. You are responsible for
              the accuracy and completeness of the transactions, amounts, and categories you record.
              Insights and summaries are generated from the data you provide, so their accuracy
              depends on yours.
            </p>
          </section>

          {/* 6. Service Availability */}
          <section>
            <h2 className="font-serif text-xl md:text-2xl text-secondary mb-4">Service Availability</h2>
            <p>
              We strive to keep Fincurio available and reliable. However, the service may
              experience occasional downtime for maintenance, updates, or unforeseen issues.
              We do not guarantee uninterrupted access and will not be liable for any losses
              resulting from service unavailability.
            </p>
          </section>

          {/* 7. Limitation of Liability */}
          <section>
            <h2 className="font-serif text-xl md:text-2xl text-secondary mb-4">Limitation of Liability</h2>
            <p>
              Fincurio is provided "as is" without warranties of any kind, express or implied.
              To the maximum extent permitted by law, we are not liable for any financial decisions
              made based on insights or data displayed in the service, any indirect, incidental, or
              consequential damages, and our total liability shall not exceed the amount you paid
              for the service (if any).
            </p>
          </section>

          {/* 8. Termination */}
          <section>
            <h2 className="font-serif text-xl md:text-2xl text-secondary mb-4">Termination</h2>
            <p>
              You may stop using Fincurio at any time. We reserve the right to suspend or
              terminate accounts that violate these terms or engage in misuse of the service.
              If your account is terminated, we may delete your data after a reasonable
              notice period.
            </p>
          </section>

          {/* 9. Changes to Terms */}
          <section>
            <h2 className="font-serif text-xl md:text-2xl text-secondary mb-4">Changes to These Terms</h2>
            <p>
              We may update these terms from time to time. When we do, we'll update the
              "Last updated" date at the top of this page. Continued use of Fincurio after
              changes are posted constitutes your acceptance of the updated terms. For significant
              changes, we'll make reasonable efforts to notify you.
            </p>
          </section>

          {/* 10. Contact */}
          <section>
            <h2 className="font-serif text-xl md:text-2xl text-secondary mb-4">Contact</h2>
            <p>
              Questions about these terms? Reach out to us at{' '}
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

export default Terms;
