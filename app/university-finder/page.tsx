"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useLanguage } from "../contexts/LanguageContext";
import LanguageSwitcher from "../components/LanguageSwitcher";
import Link from "next/link";
import { getSubmission } from "../actions";
import { Submission, Country } from "../types";

export default function UniversityFinderPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [country, setCountry] = useState("");
  const [program, setProgram] = useState("");
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);
  const [availableCountries, setAvailableCountries] = useState<Country[]>([]);

  useEffect(() => {
    async function loadSubmission() {
      const submissionId = searchParams.get("id") || localStorage.getItem("submission_id");
      
      if (!submissionId) {
        router.push("/form");
        return;
      }

      try {
        const sub = await getSubmission(submissionId);
        if (!sub) {
          router.push("/form");
          return;
        }
        setSubmission(sub);
        // Filter out "Not sure" and set available countries
        const countries = (sub.input.countries || []).filter(c => c !== "Not sure") as Country[];
        setAvailableCountries(countries);
        
        // Pre-select first country if available
        if (countries.length > 0) {
          setCountry(countries[0]);
        }
      } catch (error) {
        console.error("Failed to load submission:", error);
        router.push("/form");
      } finally {
        setLoading(false);
      }
    }

    loadSubmission();
  }, [searchParams, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-600">{t("common.loading")}</p>
        </div>
      </div>
    );
  }

  if (!submission) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                University Planner
              </h1>
            </Link>
            <nav className="flex items-center gap-4">
              <Link href={`/university-finder?id=${submission.id}`} className="px-3 py-2 text-blue-600 hover:text-blue-700 font-medium transition-colors text-sm border-b-2 border-blue-600">
                {t("nav.university_finder")}
              </Link>
              <Link href={`/housing?id=${submission.id}`} className="px-3 py-2 text-gray-700 hover:text-blue-600 font-medium transition-colors text-sm">
                {t("nav.housing")}
              </Link>
              <Link href={`/essay-editor?id=${submission.id}`} className="px-3 py-2 text-gray-700 hover:text-blue-600 font-medium transition-colors text-sm">
                {t("nav.essay_editor")}
              </Link>
              <Link href={`/country-info?id=${submission.id}`} className="px-3 py-2 text-gray-700 hover:text-blue-600 font-medium transition-colors text-sm">
                {t("nav.country_info")}
              </Link>
              <Link href={`/documents?id=${submission.id}`} className="px-3 py-2 text-gray-700 hover:text-blue-600 font-medium transition-colors text-sm">
                {t("nav.documents")}
              </Link>
              <LanguageSwitcher />
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {t("university_finder.title")}
          </h1>
          <p className="text-xl text-gray-600">
            {t("university_finder.subtitle")}
          </p>
          <p className="text-sm text-gray-500 mt-2">
            {t("university_finder.selected_countries")}: {availableCountries.join(", ")}
          </p>
        </div>

        {/* Search Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t("university_finder.search_query")}
              </label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t("university_finder.search_placeholder")}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t("university_finder.country")}
              </label>
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">{t("university_finder.select_country")}</option>
                {availableCountries.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t("university_finder.program")}
              </label>
              <input
                type="text"
                value={program}
                onChange={(e) => setProgram(e.target.value)}
                placeholder={t("university_finder.program_placeholder")}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <button className="mt-6 w-full md:w-auto px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl">
            {t("university_finder.search_button")}
          </button>
        </div>

        {/* Results Placeholder */}
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center text-gray-500">
          <p className="text-lg">{t("university_finder.coming_soon")}</p>
        </div>
      </main>
    </div>
  );
}
