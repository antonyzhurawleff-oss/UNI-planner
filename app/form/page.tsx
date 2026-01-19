"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { submitForm } from "../actions";
import { AdmissionType, Country, ProgramField, ProgramLanguage } from "../types";
import { useLanguage } from "../contexts/LanguageContext";
import LanguageSwitcher from "../components/LanguageSwitcher";

export default function FormPage() {
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { t } = useLanguage();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    
    const formData = new FormData(e.currentTarget);
    const result = await submitForm(formData);
    
    if (result?.error) {
      setError(result.error);
      setIsSubmitting(false);
    } else if (result?.success && result?.id) {
      // Save submission ID to localStorage for access from other pages
      localStorage.setItem("submission_id", result.id);
      router.push(`/results?id=${result.id}`);
    } else {
      setError(t("form.error.unexpected"));
      setIsSubmitting(false);
    }
  }

  const programFields: ProgramField[] = [
    "Business & Management",
    "Computer Science & IT",
    "Engineering",
    "Medicine & Health",
    "Law",
    "Arts & Humanities",
    "Social Sciences",
    "Natural Sciences",
    "Economics",
    "Psychology",
    "Architecture",
    "Not sure"
  ];

  return (
    <div className="min-h-screen py-12 px-4 bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header with language switcher */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50 mb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              University Planner
            </Link>
            <nav className="flex items-center gap-4">
              <LanguageSwitcher />
            </nav>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8 pt-8">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">
            {t("form.title")}
          </h1>
          <p className="text-lg text-gray-600">
            {t("form.subtitle")}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-6 py-4 rounded-lg mb-6 shadow-sm">
            <p className="font-medium">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl p-8 md:p-10 space-y-10 border border-gray-100">
          {/* Progress indicator / Section divider */}
          <div className="pb-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-700 flex items-center">
              <span className="mr-2">📋</span>
              {t("form.section.basic_info")}
            </h2>
          </div>
          {/* Admission Type */}
          <div>
            <label htmlFor="admissionType" className="block text-sm font-semibold text-gray-800 mb-3 flex items-center">
              <span className="mr-2">🎓</span>
              {t("form.admissionType")} <span className="text-red-500 ml-1">{t("common.required")}</span>
            </label>
            <div className="grid grid-cols-2 gap-4">
              <label className="flex items-center p-4 border-2 border-gray-200 rounded-xl hover:border-blue-400 hover:bg-blue-50 cursor-pointer transition-all has-[:checked]:border-blue-600 has-[:checked]:bg-blue-50">
                <input
                  type="radio"
                  name="admissionType"
                  value="Bachelor"
                  required
                  className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <div className="font-semibold text-gray-800">Bachelor</div>
                  <div className="text-xs text-gray-500">{t("form.undergraduate")}</div>
                </div>
              </label>
              <label className="flex items-center p-4 border-2 border-gray-200 rounded-xl hover:border-purple-400 hover:bg-purple-50 cursor-pointer transition-all has-[:checked]:border-purple-600 has-[:checked]:bg-purple-50">
                <input
                  type="radio"
                  name="admissionType"
                  value="Master"
                  required
                  className="mr-3 h-4 w-4 text-purple-600 focus:ring-purple-500"
                />
                <div>
                  <div className="font-semibold text-gray-800">Master</div>
                  <div className="text-xs text-gray-500">{t("form.graduate")}</div>
                </div>
              </label>
            </div>
          </div>

          {/* Section divider */}
          <div className="pt-4 pb-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-700 flex items-center">
              <span className="mr-2">🌍</span>
              {t("form.section.preferences")}
            </h2>
          </div>

          {/* Target Countries */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-4">
              {t("form.targetCountries")} <span className="text-red-500 ml-1">{t("common.required")}</span>
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {(["Germany", "Netherlands", "Italy", "France", "UK", "Austria", "Not sure"] as Country[]).map((country) => {
                const flags: Record<string, string> = {
                  "Germany": "🇩🇪",
                  "Netherlands": "🇳🇱",
                  "Italy": "🇮🇹",
                  "France": "🇫🇷",
                  "UK": "🇬🇧",
                  "Austria": "🇦🇹",
                  "Not sure": "❓"
                };
                return (
                  <label key={country} className="flex items-center p-3 border-2 border-gray-200 rounded-xl hover:bg-blue-50 hover:border-blue-400 cursor-pointer transition-all has-[:checked]:border-blue-600 has-[:checked]:bg-blue-50">
                    <input
                      type="checkbox"
                      name="countries"
                      value={country}
                      className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="text-base font-medium">{flags[country]} {country}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Program Fields */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-4">
              {t("form.programs")} <span className="text-red-500 ml-1">{t("common.required")}</span>
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {programFields.map((field) => (
                <label key={field} className="flex items-center p-3 border-2 border-gray-200 rounded-xl hover:bg-purple-50 hover:border-purple-400 cursor-pointer transition-all has-[:checked]:border-purple-600 has-[:checked]:bg-purple-50">
                  <input
                    type="checkbox"
                    name="programs"
                    value={field}
                    className="mr-2 h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                  />
                  <span className="text-sm font-medium">{field}</span>
                </label>
              ))}
            </div>
            <p className="mt-3 text-xs text-gray-500 flex items-center">
              <span className="mr-1">💡</span>
              {t("form.selectPrograms")}
            </p>
          </div>

          {/* Program Language */}
          <div>
            <label htmlFor="programLanguage" className="block text-sm font-semibold text-gray-800 mb-3 flex items-center">
              <span className="mr-2">🗣️</span>
              {t("form.programLanguage")} <span className="text-red-500 ml-1">{t("common.required")}</span>
            </label>
            <select
              id="programLanguage"
              name="programLanguage"
              required
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-800"
            >
              <option value="">{t("form.selectProgramLanguage")}</option>
              <option value="English">{t("form.englishPrograms")}</option>
              <option value="Local">{t("form.localPrograms")}</option>
              <option value="Either">{t("form.eitherLanguage")}</option>
            </select>
            <p className="mt-2 text-xs text-gray-500 flex items-center">
              <span className="mr-1">💡</span>
              {t("form.programLanguageDesc")}
            </p>
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-gray-800 mb-3 flex items-center">
              <span className="mr-2">📧</span>
              {t("form.email")} <span className="text-red-500 ml-1">{t("common.required")}</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              required
              placeholder="your.email@example.com"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-800"
            />
            <p className="mt-2 text-xs text-gray-500 flex items-center">
              <span className="mr-1">💡</span>
              {t("form.emailDesc")}
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-6 rounded-lg font-semibold text-lg hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transform transition-all hover:scale-[1.02] shadow-lg hover:shadow-xl"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {t("form.generating")}
              </span>
            ) : (
              t("form.submit")
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link
            href="/access"
            className="text-blue-600 hover:text-blue-700 underline text-sm"
          >
            {t("form.accessLink")}
          </Link>
        </div>
      </div>
    </div>
  );
}
