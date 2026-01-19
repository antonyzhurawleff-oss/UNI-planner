"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useLanguage } from "../contexts/LanguageContext";
import LanguageSwitcher from "../components/LanguageSwitcher";
import Link from "next/link";
import { getSubmission, getDocumentGuide } from "../actions";
import { Submission, Country } from "../types";
import { DocumentGuide } from "@/lib/openai";

export default function DocumentsClient() {
  const { t } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [documentType, setDocumentType] = useState("");
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);
  const [availableCountries, setAvailableCountries] = useState<Country[]>([]);
  const [selectedCountry, setSelectedCountry] = useState("");
  const [hasDirectParams, setHasDirectParams] = useState(false);
  const [documentGuide, setDocumentGuide] = useState<DocumentGuide | null>(null);
  const [searching, setSearching] = useState(false);

  const documentTypes = [
    { key: "visa", label: t("documents.visa"), icon: "🛂" },
    { key: "residence_permit", label: t("documents.residence_permit"), icon: "📋" },
    { key: "bank_account", label: t("documents.bank_account"), icon: "💳" },
    { key: "health_insurance", label: t("documents.health_insurance"), icon: "🏥" },
    { key: "registration", label: t("documents.registration"), icon: "📝" },
  ];

  const getCountryFlag = (country: string): string => {
    const flagMap: Record<string, string> = {
      "Austria": "🇦🇹",
      "Germany": "🇩🇪",
      "Netherlands": "🇳🇱",
      "France": "🇫🇷",
      "UK": "🇬🇧",
      "United Kingdom": "🇬🇧",
      "Italy": "🇮🇹",
    };
    return flagMap[country] || "🌍";
  };

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
        const countries = (sub.input.countries || []).filter(c => c !== "Not sure") as Country[];
        setAvailableCountries(countries);
        
        // Pre-fill from URL parameters
        const countryParam = searchParams.get("country");
        if (countryParam && countries.includes(countryParam as Country)) {
          setSelectedCountry(countryParam);
          setHasDirectParams(true);
          // Set default document type to visa if direct params
          setDocumentType("visa");
        } else if (countries.length > 0) {
          setSelectedCountry(countries[0]);
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

  // Load document guide when country and document type are selected
  useEffect(() => {
    async function loadDocumentGuide() {
      if (!selectedCountry || !documentType) {
        setDocumentGuide(null);
        return;
      }

      setSearching(true);
      try {
        const result = await getDocumentGuide(selectedCountry, documentType);
        if (result.success && result.guide) {
          setDocumentGuide(result.guide);
        } else {
          console.error("Failed to load document guide:", result.error);
          setDocumentGuide(null);
        }
      } catch (error) {
        console.error("Error loading document guide:", error);
        setDocumentGuide(null);
      } finally {
        setSearching(false);
      }
    }

    loadDocumentGuide();
  }, [selectedCountry, documentType]);

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
              <Link href={`/housing?id=${submission.id}`} className="px-3 py-2 text-gray-700 hover:text-blue-600 font-medium transition-colors text-sm">
                housing
              </Link>
              <Link href={`/essay-editor?id=${submission.id}`} className="px-3 py-2 text-gray-700 hover:text-blue-600 font-medium transition-colors text-sm">
                essay editor
              </Link>
              <Link href={`/country-info?id=${submission.id}`} className="px-3 py-2 text-gray-700 hover:text-blue-600 font-medium transition-colors text-sm">
                country info
              </Link>
              <Link href={`/documents?id=${submission.id}`} className="px-3 py-2 text-blue-600 hover:text-blue-700 font-medium transition-colors text-sm border-b-2 border-blue-600">
                documentation guide
              </Link>
              <LanguageSwitcher />
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {t("documents.title")}
          </h1>
          <p className="text-xl text-gray-600">
            {t("documents.subtitle")}
          </p>
        </div>

        {/* Selection Form - only show if no direct parameters */}
        {!hasDirectParams && (
          <div className="space-y-8">
            {/* Country Selection */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <label className="block text-sm font-semibold text-gray-700 mb-4">
                {t("documents.select_country") || "Select a country to view information"}
              </label>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {availableCountries.map((country) => (
                  <button
                    key={country}
                    onClick={() => setSelectedCountry(country)}
                    className={`p-6 rounded-lg border-2 transition-all ${
                      selectedCountry === country
                        ? "border-blue-600 bg-blue-50"
                        : "border-gray-200 bg-white hover:border-blue-300"
                    }`}
                  >
                    <div className="text-4xl mb-2">{getCountryFlag(country)}</div>
                    <div className="font-semibold text-gray-800 text-sm">{country}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Document Type Selection */}
            {selectedCountry && (
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <label className="block text-sm font-semibold text-gray-700 mb-4">
                  {t("documents.select_document") || "Select document type"}
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {documentTypes.map((type) => (
                    <button
                      key={type.key}
                      onClick={() => setDocumentType(type.key)}
                      className={`p-6 rounded-lg border-2 transition-all ${
                        documentType === type.key
                          ? "border-blue-600 bg-blue-50"
                          : "border-gray-200 bg-white hover:border-blue-300"
                      }`}
                    >
                      <div className="text-4xl mb-2">{type.icon}</div>
                      <div className="font-semibold text-gray-800 text-sm text-center">{type.label}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Loading State */}
        {searching && selectedCountry && documentType && (
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <p className="text-lg text-gray-600">{t("common.loading")}</p>
          </div>
        )}

        {/* Document Info Display */}
        {!searching && selectedCountry && documentType && documentGuide && (
          <div className="space-y-6">
            {/* Overview */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h2 className="text-3xl font-bold mb-4 text-slate-700">
                {documentGuide.documentType} - {documentGuide.country}
              </h2>
              <p className="text-lg text-gray-700 leading-relaxed mb-6">{documentGuide.overview}</p>

              {/* Requirements */}
              {documentGuide.requirements && documentGuide.requirements.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-2xl font-bold mb-4 text-slate-700 flex items-center">
                    <span className="mr-2">📋</span>
                    Eligibility Requirements
                  </h3>
                  <ul className="space-y-2">
                    {documentGuide.requirements.map((req, index) => (
                      <li key={index} className="flex items-start">
                        <span className="mr-3 mt-1 text-slate-500 font-bold">•</span>
                        <span className="text-gray-700">{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Documents Needed */}
              {documentGuide.documentsNeeded && documentGuide.documentsNeeded.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-2xl font-bold mb-4 text-slate-700 flex items-center">
                    <span className="mr-2">📄</span>
                    Documents Needed
                  </h3>
                  <ul className="space-y-2">
                    {documentGuide.documentsNeeded.map((doc, index) => (
                      <li key={index} className="flex items-start">
                        <span className="mr-3 mt-1 text-slate-500 font-bold">•</span>
                        <span className="text-gray-700">{doc}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Application Steps */}
              {documentGuide.applicationSteps && documentGuide.applicationSteps.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-2xl font-bold mb-4 text-slate-700 flex items-center">
                    <span className="mr-2">📝</span>
                    Step-by-Step Application Procedure
                  </h3>
                  <ol className="space-y-3">
                    {documentGuide.applicationSteps.map((step, index) => (
                      <li key={index} className="flex items-start">
                        <span className="mr-3 mt-1 text-slate-600 font-bold min-w-[24px]">{index + 1}.</span>
                        <span className="text-gray-700">{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              {/* Processing Time & Costs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {documentGuide.processingTime && (
                  <div className="p-6 bg-slate-50 rounded-lg border border-slate-200">
                    <h4 className="text-lg font-bold mb-2 text-slate-700">⏱️ Processing Time</h4>
                    <p className="text-gray-700">{documentGuide.processingTime}</p>
                  </div>
                )}
                {documentGuide.costs && (
                  <div className="p-6 bg-slate-50 rounded-lg border border-slate-200">
                    <h4 className="text-lg font-bold mb-2 text-slate-700">💰 Costs</h4>
                    <p className="text-gray-700">{documentGuide.costs}</p>
                  </div>
                )}
              </div>

              {/* Important Notes */}
              {documentGuide.importantNotes && documentGuide.importantNotes.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-2xl font-bold mb-4 text-slate-700 flex items-center">
                    <span className="mr-2">⚠️</span>
                    Important Notes & Tips
                  </h3>
                  <ul className="space-y-2">
                    {documentGuide.importantNotes.map((note, index) => (
                      <li key={index} className="flex items-start">
                        <span className="mr-3 mt-1 text-slate-500 font-bold">•</span>
                        <span className="text-gray-700">{note}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Official Links */}
              {documentGuide.officialLinks && documentGuide.officialLinks.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-2xl font-bold mb-4 text-slate-700 flex items-center">
                    <span className="mr-2">🔗</span>
                    Official Resources
                  </h3>
                  <ul className="space-y-2">
                    {documentGuide.officialLinks.map((link, index) => (
                      <li key={index}>
                        <a
                          href={link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 underline break-all"
                        >
                          {link}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* No Info State */}
        {!searching && selectedCountry && documentType && !documentGuide && (
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center text-gray-500">
            <p className="text-lg mb-2">No information found for {documentTypes.find(t => t.key === documentType)?.label} in {selectedCountry}.</p>
            <p className="text-sm">Please try again later.</p>
          </div>
        )}
      </main>
    </div>
  );
}
