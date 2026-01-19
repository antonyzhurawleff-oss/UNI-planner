"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useLanguage } from "../contexts/LanguageContext";
import LanguageSwitcher from "../components/LanguageSwitcher";
import Link from "next/link";
import { getSubmission, getCountryInfo } from "../actions";
import { Submission, Country as CountryType } from "../types";
import { CountryInfo } from "../../lib/openai";

export default function CountryInfoPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedCountry, setSelectedCountry] = useState("");
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [availableCountries, setAvailableCountries] = useState<CountryType[]>([]);
  const [hasDirectParams, setHasDirectParams] = useState(false);
  const [countryInfo, setCountryInfo] = useState<CountryInfo | null>(null);

  const getCountryFlag = (country: string): string => {
    const flagMap: Record<string, string> = {
      "Austria": "🇦🇹",
      "Germany": "🇩🇪",
      "Netherlands": "🇳🇱",
      "France": "🇫🇷",
      "UK": "🇬🇧",
      "United Kingdom": "🇬🇧",
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
        const countries = (sub.input.countries || []).filter(c => c !== "Not sure") as CountryType[];
        setAvailableCountries(countries);
        
        // Pre-fill from URL parameters
        const countryParam = searchParams.get("country");
        if (countryParam && countries.includes(countryParam as CountryType)) {
          setSelectedCountry(countryParam);
          setHasDirectParams(true);
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

  useEffect(() => {
    async function loadCountryInfo() {
      if (!selectedCountry || loading) return;
      
      setSearching(true);
      try {
        const result = await getCountryInfo(selectedCountry);
        
        if (result.success && result.info) {
          setCountryInfo(result.info);
        } else {
          console.error("Failed to get country info:", result.error);
          setCountryInfo(null);
        }
      } catch (error) {
        console.error("Country info search failed:", error);
        setCountryInfo(null);
      } finally {
        setSearching(false);
      }
    }

    loadCountryInfo();
  }, [selectedCountry, loading]);

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
              <Link href={`/country-info?id=${submission.id}`} className="px-3 py-2 text-blue-600 hover:text-blue-700 font-medium transition-colors text-sm border-b-2 border-blue-600">
                country info
              </Link>
              <Link href={`/documents?id=${submission.id}`} className="px-3 py-2 text-gray-700 hover:text-blue-600 font-medium transition-colors text-sm">
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
            {t("country_info.title")}
          </h1>
          <p className="text-xl text-gray-600">
            {t("country_info.subtitle")}
          </p>
        </div>

        {/* Country Selector - only show if no direct parameters */}
        {!hasDirectParams && (
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <label className="block text-sm font-semibold text-gray-700 mb-4">
              {t("country_info.select_country")}
            </label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {availableCountries.map((country) => (
                <button
                  key={country}
                  onClick={() => setSelectedCountry(country)}
                  className={`p-6 rounded-lg border-2 transition-all ${
                    selectedCountry === country
                      ? "border-blue-600 bg-blue-50"
                      : "border-gray-200 hover:border-blue-300"
                  }`}
                >
                  <div className="text-4xl mb-2">{getCountryFlag(country)}</div>
                  <div className="font-semibold text-gray-800">{country}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Loading State */}
        {searching && selectedCountry && (
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="flex items-center justify-center">
              <svg className="animate-spin h-8 w-8 text-blue-600 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="text-lg text-gray-600">Loading information about {selectedCountry}...</p>
            </div>
          </div>
        )}

        {/* Country Info Display */}
        {!searching && selectedCountry && countryInfo && (
          <div className="space-y-6">
            {/* Overview */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h2 className="text-3xl font-bold mb-4 text-gray-800 flex items-center">
                <span className="mr-3 text-4xl">{getCountryFlag(selectedCountry)}</span>
                {countryInfo.name}
              </h2>
              <p className="text-lg text-gray-700 leading-relaxed mb-6">{countryInfo.overview}</p>

              {/* Advantages */}
              {countryInfo.advantages && countryInfo.advantages.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-2xl font-bold mb-4 text-slate-700 flex items-center">
                    <span className="mr-2">✅</span>
                    Advantages of Studying in {countryInfo.name}
                  </h3>
                  <ul className="space-y-2">
                    {countryInfo.advantages.map((advantage, index) => (
                      <li key={index} className="flex items-start">
                        <span className="mr-3 mt-1 text-slate-500 font-bold">•</span>
                        <span className="text-gray-700">{advantage}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Benefits for Students */}
              {countryInfo.benefitsForStudents && countryInfo.benefitsForStudents.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-2xl font-bold mb-4 text-slate-700 flex items-center">
                    <span className="mr-2">🎓</span>
                    Benefits for International Students
                  </h3>
                  <ul className="space-y-2">
                    {countryInfo.benefitsForStudents.map((benefit, index) => (
                      <li key={index} className="flex items-start">
                        <span className="mr-3 mt-1 text-slate-500 font-bold">•</span>
                        <span className="text-gray-700">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Challenges */}
              {countryInfo.challenges && countryInfo.challenges.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-2xl font-bold mb-4 text-slate-700 flex items-center">
                    <span className="mr-2">⚠️</span>
                    Challenges to Consider
                  </h3>
                  <ul className="space-y-2">
                    {countryInfo.challenges.map((challenge, index) => (
                      <li key={index} className="flex items-start">
                        <span className="mr-3 mt-1 text-slate-500 font-bold">•</span>
                        <span className="text-gray-700">{challenge}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Nuances */}
              {countryInfo.nuances && countryInfo.nuances.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-2xl font-bold mb-4 text-slate-700 flex items-center">
                    <span className="mr-2">ℹ️</span>
                    Important Nuances
                  </h3>
                  <ul className="space-y-2">
                    {countryInfo.nuances.map((nuance, index) => (
                      <li key={index} className="flex items-start">
                        <span className="mr-3 mt-1 text-slate-500 font-bold">•</span>
                        <span className="text-gray-700">{nuance}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Cost of Living */}
            {countryInfo.costOfLiving && (
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <h3 className="text-2xl font-bold mb-6 text-slate-700">
                  💰 Cost of Living for Students
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  <div className="p-4 bg-blue-50/30 rounded-lg border border-blue-100">
                    <p className="text-sm text-slate-600 mb-1">Accommodation</p>
                    <p className="font-bold text-slate-700 text-lg">{countryInfo.costOfLiving.accommodation}</p>
                  </div>
                  <div className="p-4 bg-emerald-50/30 rounded-lg border border-emerald-100">
                    <p className="text-sm text-slate-600 mb-1">Food</p>
                    <p className="font-bold text-slate-700 text-lg">{countryInfo.costOfLiving.food}</p>
                  </div>
                  <div className="p-4 bg-indigo-50/30 rounded-lg border border-indigo-100">
                    <p className="text-sm text-slate-600 mb-1">Transport</p>
                    <p className="font-bold text-slate-700 text-lg">{countryInfo.costOfLiving.transport}</p>
                  </div>
                  <div className="p-4 bg-amber-50/30 rounded-lg border border-amber-100">
                    <p className="text-sm text-slate-600 mb-1">Utilities</p>
                    <p className="font-bold text-slate-700 text-lg">{countryInfo.costOfLiving.utilities}</p>
                  </div>
                  <div className="p-4 bg-rose-50/30 rounded-lg border border-rose-100">
                    <p className="text-sm text-slate-600 mb-1">Entertainment</p>
                    <p className="font-bold text-slate-700 text-lg">{countryInfo.costOfLiving.entertainment}</p>
                  </div>
                  <div className="p-4 bg-teal-50/30 rounded-lg border border-teal-100">
                    <p className="text-sm text-slate-600 mb-1">Health Insurance</p>
                    <p className="font-bold text-slate-700 text-lg">{countryInfo.costOfLiving.healthInsurance}</p>
                  </div>
                </div>

                <div className="p-6 bg-slate-50 rounded-lg border-l-4 border-slate-500">
                  <p className="text-sm font-semibold text-slate-700 mb-2">Total Monthly Estimate</p>
                  <p className="text-3xl font-bold text-slate-800 mb-4">{countryInfo.costOfLiving.totalMonthly}</p>
                  {countryInfo.costOfLiving.detailedBreakdown && (
                    <p className="text-gray-700 leading-relaxed">{countryInfo.costOfLiving.detailedBreakdown}</p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* No Info State */}
        {!searching && selectedCountry && !countryInfo && (
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center text-gray-500">
            <p className="text-lg mb-2">No information found for {selectedCountry}.</p>
            <p className="text-sm">Please try again later.</p>
          </div>
        )}
      </main>
    </div>
  );
}
