"use client";

import { useState } from "react";
import { getSubmissionsForEmail } from "../actions";
import { Submission } from "../types";
import Link from "next/link";
import { useLanguage } from "../contexts/LanguageContext";
import LanguageSwitcher from "../components/LanguageSwitcher";

export default function AccessPage() {
  const [email, setEmail] = useState("");
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { t } = useLanguage();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const results = await getSubmissionsForEmail(email);
      setSubmissions(results);
      if (results.length === 0) {
        setError(t("access.noPlans"));
      }
    } catch (err) {
      setError(t("access.error"));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen py-12 px-4 bg-gray-50">
      {/* Header with language switcher */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50 mb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-end items-center h-16">
            <LanguageSwitcher />
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">{t("access.title")}</h1>
          <p className="text-gray-600">
            {t("access.subtitle")}
          </p>
          <Link
            href="/"
            className="text-blue-600 hover:text-blue-700 underline mt-4 inline-block"
          >
            {t("access.backHome")}
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-8 mb-8">
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              {t("access.emailLabel")}
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="your.email@example.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-md font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? t("access.loading") : t("access.viewPlans")}
          </button>
        </form>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {submissions.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold mb-6">{t("access.yourPlans")}</h2>
            <div className="space-y-4">
              {submissions.map((submission) => (
                <div
                  key={submission.id}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-gray-500">
                        {new Date(submission.createdAt).toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        {submission.input.admissionType} • {submission.input.countries.join(", ")}
                      </p>
                      <p className="text-sm text-gray-600">
                        {submission.response.programs?.length || 0} {t("access.universitiesRecommended")}
                      </p>
                    </div>
                    <Link
                      href={`/results?id=${submission.id}`}
                      className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
                    >
                      {t("access.viewPlan")}
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
