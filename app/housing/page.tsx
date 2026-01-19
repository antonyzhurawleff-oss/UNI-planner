"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useLanguage } from "../contexts/LanguageContext";
import LanguageSwitcher from "../components/LanguageSwitcher";
import Link from "next/link";
import { getSubmission, getHousingOptions } from "../actions";
import { Submission, Country } from "../types";

import { HousingOption } from "../../lib/openai";

export default function HousingPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [city, setCity] = useState("");
  const [university, setUniversity] = useState("");
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [availableCountries, setAvailableCountries] = useState<Country[]>([]);
  const [selectedCountry, setSelectedCountry] = useState("");
  const [hasDirectParams, setHasDirectParams] = useState(false);
  const [housingOptions, setHousingOptions] = useState<HousingOption[]>([]);

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
        const universityParam = searchParams.get("university");
        
        if (countryParam && countries.includes(countryParam as Country)) {
          setSelectedCountry(countryParam);
          setHasDirectParams(true);
        } else if (countries.length > 0) {
          setSelectedCountry(countries[0]);
        }
        
        if (universityParam) {
          const decodedUniversity = decodeURIComponent(universityParam);
          setUniversity(decodedUniversity);
          setHasDirectParams(true);
          
          // Extract city from university name if possible (e.g., "Vienna University" -> "Vienna")
          const cityMatch = decodedUniversity.match(/(\w+)\s+University/i);
          if (cityMatch) {
            setCity(cityMatch[1]);
          }
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
    async function searchHousing() {
      if (!hasDirectParams || !university || !selectedCountry || loading) return;
      
      setSearching(true);
      try {
        const searchCity = city || selectedCountry;
        const result = await getHousingOptions(university, searchCity, selectedCountry);
        
        if (result.success && result.options) {
          setHousingOptions(result.options);
        } else {
          console.error("Failed to get housing options:", result.error);
          setHousingOptions([]);
        }
      } catch (error) {
        console.error("Housing search failed:", error);
        setHousingOptions([]);
      } finally {
        setSearching(false);
      }
    }

    searchHousing();
  }, [hasDirectParams, university, selectedCountry, city, loading]);

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
              <Link href={`/housing?id=${submission.id}`} className="px-3 py-2 text-blue-600 hover:text-blue-700 font-medium transition-colors text-sm border-b-2 border-blue-600">
                housing
              </Link>
              <Link href={`/essay-editor?id=${submission.id}`} className="px-3 py-2 text-gray-700 hover:text-blue-600 font-medium transition-colors text-sm">
                essay editor
              </Link>
              <Link href={`/country-info?id=${submission.id}`} className="px-3 py-2 text-gray-700 hover:text-blue-600 font-medium transition-colors text-sm">
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
            {t("housing.title")}
          </h1>
          <p className="text-xl text-gray-600">
            {t("housing.subtitle")}
          </p>
          {hasDirectParams && university && (
            <p className="text-sm text-gray-500 mt-2">
              Searching for housing near: <span className="font-semibold">{university}</span> in <span className="font-semibold">{selectedCountry}</span>
            </p>
          )}
        </div>

        {/* Search Form - only show if no direct parameters */}
        {!hasDirectParams && (
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t("housing.country")}
                </label>
                <select
                  value={selectedCountry}
                  onChange={(e) => setSelectedCountry(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">{t("housing.select_country")}</option>
                  {availableCountries.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t("housing.city")}
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder={t("housing.city_placeholder")}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t("housing.university")}
                </label>
                <input
                  type="text"
                  value={university}
                  onChange={(e) => setUniversity(e.target.value)}
                  placeholder={t("housing.university_placeholder")}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <button className="mt-6 w-full md:w-auto px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl">
              {t("housing.search_button")}
            </button>
          </div>
        )}

        {/* Loading State */}
        {searching && (
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="flex items-center justify-center">
              <svg className="animate-spin h-8 w-8 text-blue-600 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="text-lg text-gray-600">Searching for housing options...</p>
            </div>
          </div>
        )}

        {/* Housing Options Display */}
        {!searching && hasDirectParams && selectedCountry && (
          <div className="space-y-6">
            {housingOptions.length > 0 ? (
              housingOptions.map((option, index) => (
                <div key={index} className="bg-white rounded-2xl shadow-xl p-8">
                  <div className="flex flex-col md:flex-row gap-6">
                    {/* Housing Image */}
                    <div className="md:w-64 h-48 rounded-lg overflow-hidden bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 flex-shrink-0 relative">
                      {option.imageUrl ? (
                        <img
                          src={option.imageUrl}
                          alt={option.name}
                          className="w-full h-full object-cover relative z-10"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            const fallback = target.nextElementSibling as HTMLElement;
                            if (fallback) {
                              fallback.style.display = 'flex';
                            }
                          }}
                        />
                      ) : null}
                      {/* Fallback gradient with initial letter */}
                      <div 
                        className={`w-full h-full flex items-center justify-center text-white text-4xl font-bold absolute inset-0 z-0 ${option.imageUrl ? 'hidden' : 'flex'}`}
                      >
                        {option.name.charAt(0).toUpperCase()}
                      </div>
                    </div>
                    
                    {/* Details */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-2xl font-bold text-gray-800 mb-2">{option.name}</h3>
                          <p className="text-gray-600 mb-2">
                            <span className="mr-2">📍</span>
                            {option.address}
                          </p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          option.difficulty === "Easy" ? "bg-green-100 text-green-700" :
                          option.difficulty === "Medium" ? "bg-yellow-100 text-yellow-700" :
                          "bg-red-100 text-red-700"
                        }`}>
                          {option.difficulty === "Easy" ? "✓ Easy to get" : 
                           option.difficulty === "Medium" ? "⚠ Moderate" : 
                           "⚠ Hard to get"}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="p-3 bg-blue-50 rounded-lg">
                          <p className="text-sm text-gray-600 mb-1">Cost</p>
                          <p className="font-bold text-blue-600 text-lg">{option.cost}</p>
                        </div>
                        <div className="p-3 bg-purple-50 rounded-lg">
                          <p className="text-sm text-gray-600 mb-1">Availability</p>
                          <p className="font-bold text-purple-600">{option.availability}</p>
                        </div>
                      </div>
                      
                      {option.facilities.length > 0 && (
                        <div className="mb-4">
                          <p className="text-sm font-semibold text-gray-700 mb-2">Facilities:</p>
                          <div className="flex flex-wrap gap-2">
                            {option.facilities.map((facility, idx) => (
                              <span key={idx} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                                {facility}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {option.roomTypes.length > 0 && (
                        <div className="mb-4">
                          <p className="text-sm font-semibold text-gray-700 mb-2">Room Types:</p>
                          <div className="flex flex-wrap gap-2">
                            {option.roomTypes.map((type, idx) => (
                              <span key={idx} className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                                {type}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <p className="text-sm text-gray-600">
                          <span className="font-semibold">Contact:</span> {option.contact}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white rounded-2xl shadow-xl p-8 text-center text-gray-500">
                <p className="text-lg mb-2">No housing options found at this time.</p>
                <p className="text-sm">Please try again later or contact the university directly.</p>
              </div>
            )}
          </div>
        )}

        {/* Results Placeholder - only show if no direct parameters */}
        {!hasDirectParams && !searching && (
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center text-gray-500">
            <p className="text-lg">{t("housing.coming_soon")}</p>
          </div>
        )}
      </main>
    </div>
  );
}
