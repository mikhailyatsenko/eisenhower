import Link from 'next/link';
import React from 'react';

export const PrivacyPage = () => {
  return (
    <div className="relative z-[1] mx-auto w-[calc(100%-48px)] py-12 lg:w-2/3">
      <Link
        href="/"
        className="mb-6 inline-block text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
      >
        ← Back to Home
      </Link>
      <h1 className="mb-8 text-4xl font-bold">Privacy Policy</h1>

      <section className="mb-8">
        <h2 className="mb-4 text-2xl font-semibold">1. Introduction</h2>
        <p className="text-gray-700 dark:text-gray-300">
          Welcome to Eisenhower Matrix. We are committed to protecting your
          personal information and your right to privacy. If you have any
          questions or concerns about our policy, or our practices with regards
          to your personal information, please contact us.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="mb-4 text-2xl font-semibold">
          2. Information We Collect
        </h2>
        <p className="mb-2 text-gray-700 dark:text-gray-300">
          We collect personal information that you provide to us such as name,
          email address, and contact information when you sign in via Google.
        </p>
        <p className="text-gray-700 dark:text-gray-300">
          We also collect task data that you create within the application to
          provide you with the core functionality of the Eisenhower Matrix.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="mb-4 text-2xl font-semibold">
          3. How We Use Your Information
        </h2>
        <p className="text-gray-700 dark:text-gray-300">
          We use personal information collected via our application for a
          variety of business purposes, including to facilitate account creation
          and logon process, and to manage user accounts.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="mb-4 text-2xl font-semibold">
          4. Data Storage and Security
        </h2>
        <p className="text-gray-700 dark:text-gray-300">
          We use Google Firebase for data storage and authentication. Your data
          is stored securely on Google&apos;s servers. We implement appropriate
          technical and organizational security measures designed to protect the
          security of any personal information we process.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="mb-4 text-2xl font-semibold">5. Your Privacy Rights</h2>
        <p className="text-gray-700 dark:text-gray-300">
          In some regions, you have certain rights under applicable data
          protection laws. These may include the right to request access and
          obtain a copy of your personal information, to request rectification
          or erasure.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="mb-4 text-2xl font-semibold">
          6. Updates to This Policy
        </h2>
        <p className="text-gray-700 dark:text-gray-300">
          We may update this privacy policy from time to time. The updated
          version will be indicated by an updated &quot;Revised&quot; date and
          the updated version will be effective as soon as it is accessible.
        </p>
      </section>

      <footer className="mt-12 text-sm text-gray-500">
        <p>Last updated: April 26, 2026</p>
      </footer>
    </div>
  );
};
