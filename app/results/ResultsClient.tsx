"use client";

import { useState, useMemo } from "react";
import { Submission, Program, AdmissionPlan } from "../types";
import { generatePlanForProgram } from "../actions";
import Link from "next/link";
import { useLanguage } from "../contexts/LanguageContext";
import LanguageSwitcher from "../components/LanguageSwitcher";

interface ResultsClientProps {
  submission: Submission;
}

export default function ResultsClient({ submission }: ResultsClientProps) {
  // Save submission ID to localStorage for access from other pages
  if (typeof window !== 'undefined') {
    localStorage.setItem("submission_id", submission.id);
  }

  // Handle both old format (universities) and new format (programs)
  const response = submission.response || {};
  let programs: Program[] = [];
  
  if (response.programs && Array.isArray(response.programs)) {
    programs = response.programs;
  } else if (response.universities && Array.isArray(response.universities)) {
    // Convert old format to new format for backward compatibility
    programs = response.universities.map((uni: any) => ({
      name: uni.name || "Program",
      field: uni.field || "",
      university: uni.name || "",
      country: uni.country || "",
      language: "English" as const,
      category: uni.category || "Realistic" as const,
      reason: uni.reason || "",
      admissionStatus: uni.admissionStatus,
      requiredImprovements: uni.requiredImprovements,
    }));
  }
  
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
  const [selectedProgramIndex, setSelectedProgramIndex] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [plan, setPlan] = useState<AdmissionPlan | null>(response.plan || null);
  const [programPlan, setProgramPlan] = useState<AdmissionPlan | null>(null); // Plan for selected program
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [planError, setPlanError] = useState<string | null>(null);
  const { t } = useLanguage();

  // Group programs by country, then by status within each country
  const programsByCountryAndStatus = useMemo(() => {
    const grouped: Record<string, { canApply: Program[]; needImprovement: Program[] }> = {};
    
    if (!programs || !Array.isArray(programs)) {
      return grouped;
    }
    
    programs.forEach((program) => {
      if (!grouped[program.country]) {
        grouped[program.country] = { canApply: [], needImprovement: [] };
      }
      
      // Programs that can be applied to now (including eligible)
      if (program.admissionStatus === "Can apply now" || program.admissionStatus === "Eligible now") {
        grouped[program.country].canApply.push(program);
      } else {
        // Programs that need improvement
        grouped[program.country].needImprovement.push(program);
      }
    });
    
    return grouped;
  }, [programs]);

  // Helper function to get country flag emoji
  const getCountryFlag = (country: string): string => {
    const flagMap: Record<string, string> = {
      "Austria": "🇦🇹",
      "Germany": "🇩🇪",
      "Netherlands": "🇳🇱",
      "France": "🇫🇷",
      "UK": "🇬🇧",
      "United Kingdom": "🇬🇧",
      "Switzerland": "🇨🇭",
      "Spain": "🇪🇸",
      "Italy": "🇮🇹",
      "Belgium": "🇧🇪",
      "Sweden": "🇸🇪",
      "Norway": "🇳🇴",
      "Denmark": "🇩🇰",
      "Finland": "🇫🇮",
      "Poland": "🇵🇱",
      "Czech Republic": "🇨🇿",
      "Portugal": "🇵🇹",
      "Ireland": "🇮🇪",
      "Greece": "🇬🇷",
    };
    return flagMap[country] || "🌍";
  };

  // Helper function to get university image URL from internet
  const getUniversityImageUrl = (university: string, country: string, existingUrl?: string): string => {
    if (existingUrl && existingUrl.startsWith('http')) {
      return existingUrl;
    }
    
    // Map of real university image URLs - using specific university campus photos
    // Using Wikimedia Commons and other reliable sources for real university photos
    const universityImageMap: Record<string, string> = {
      // Austria
      "University of Vienna": "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f7/Uni_Wien_2006_-_Blick_auf_die_Stiege_10_%28Kaiser-Franz-Josef-Kai%29.JPG/1200px-Uni_Wien_2006_-_Blick_auf_die_Stiege_10_%28Kaiser-Franz-Josef-Kai%29.JPG",
      "Vienna University of Economics and Business": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/31/WU_Vienna_Campus_2021_01.jpg/1200px-WU_Vienna_Campus_2021_01.jpg",
      "WU Vienna": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/31/WU_Vienna_Campus_2021_01.jpg/1200px-WU_Vienna_Campus_2021_01.jpg",
      // Germany
      "University of Heidelberg": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d5/Heidelberg_University_-_Old_Town_view.jpg/1200px-Heidelberg_University_-_Old_Town_view.jpg",
      "Technical University of Munich": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ee/TUM_Arcisstra%C3%9Fe_Munich_2014.jpg/1200px-TUM_Arcisstra%C3%9Fe_Munich_2014.jpg",
      "TU Munich": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ee/TUM_Arcisstra%C3%9Fe_Munich_2014.jpg/1200px-TUM_Arcisstra%C3%9Fe_Munich_2014.jpg",
      "Ludwig Maximilian University of Munich": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a1/LMU_Main_Building_Munich.jpg/1200px-LMU_Main_Building_Munich.jpg",
      "LMU Munich": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a1/LMU_Main_Building_Munich.jpg/1200px-LMU_Main_Building_Munich.jpg",
      "LMU": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a1/LMU_Main_Building_Munich.jpg/1200px-LMU_Main_Building_Munich.jpg",
      "Frankfurt University of Applied Sciences": "https://images.pexels.com/photos/267885/pexels-photo-267885.jpeg?auto=compress&cs=tinysrgb&w=1200&h=800&fit=crop",
      "Frankfurt University": "https://images.pexels.com/photos/267885/pexels-photo-267885.jpeg?auto=compress&cs=tinysrgb&w=1200&h=800&fit=crop",
      "University of Frankfurt": "https://images.pexels.com/photos/267885/pexels-photo-267885.jpeg?auto=compress&cs=tinysrgb&w=1200&h=800&fit=crop",
      // Netherlands
      "University of Amsterdam": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Amsterdam_Universiteit_van_Amsterdam_2006.jpg/1200px-Amsterdam_Universiteit_van_Amsterdam_2006.jpg",
      "Delft University of Technology": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/TU_Delft_Library.jpg/1200px-TU_Delft_Library.jpg",
      "TU Delft": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/TU_Delft_Library.jpg/1200px-TU_Delft_Library.jpg",
      // France
      "Sorbonne University": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/La_Sorbonne_%28Paris%29.jpg/1200px-La_Sorbonne_%28Paris%29.jpg",
      // UK
      "University of Oxford": "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f4/Radcliffe_Camera%2C_Oxford%2C_UK_-_Diliff.jpg/1200px-Radcliffe_Camera%2C_Oxford%2C_UK_-_Diliff.jpg",
      "Oxford": "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f4/Radcliffe_Camera%2C_Oxford%2C_UK_-_Diliff.jpg/1200px-Radcliffe_Camera%2C_Oxford%2C_UK_-_Diliff.jpg",
      "University of Cambridge": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/74/King%27s_College_Chapel%2C_Cambridge.jpg/1200px-King%27s_College_Chapel%2C_Cambridge.jpg",
      "Cambridge": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/74/King%27s_College_Chapel%2C_Cambridge.jpg/1200px-King%27s_College_Chapel%2C_Cambridge.jpg",
    };

    // Try exact match first
    if (universityImageMap[university]) {
      return universityImageMap[university];
    }

    // Try case-insensitive match
    const exactMatch = Object.keys(universityImageMap).find(key => 
      key.toLowerCase() === university.toLowerCase()
    );
    if (exactMatch) {
      return universityImageMap[exactMatch];
    }

    // Try partial match (e.g., "Frankfurt University" matches "Frankfurt University of Applied Sciences")
    const partialMatch = Object.keys(universityImageMap).find(key => 
      university.toLowerCase().includes(key.toLowerCase()) || 
      key.toLowerCase().includes(university.toLowerCase())
    );
    if (partialMatch) {
      return universityImageMap[partialMatch];
    }

    // Fallback: Return a generic university campus image from Pexels
    return `https://images.pexels.com/photos/267885/pexels-photo-267885.jpeg?auto=compress&cs=tinysrgb&w=1200&h=800&fit=crop`;
  };

  const openModal = (program: Program, index: number) => {
    setSelectedProgram(program);
    setSelectedProgramIndex(index);
    setIsModalOpen(true);
    setPlanError(null);
    // Reset program plan when opening modal
    setProgramPlan(null);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedProgram(null);
    setSelectedProgramIndex(null);
  };

  const handleGeneratePlan = async () => {
    if (selectedProgramIndex === null || !submission.id) return;

    setIsGeneratingPlan(true);
    setPlanError(null);

    try {
      const result = await generatePlanForProgram(submission.id, selectedProgramIndex);
      if (result.success && result.plan) {
        // Validate plan structure before setting
        const validatedPlan: AdmissionPlan = {
          "Now – 3 months": Array.isArray(result.plan["Now – 3 months"]) ? result.plan["Now – 3 months"] : [],
          "3–6 months": Array.isArray(result.plan["3–6 months"]) ? result.plan["3–6 months"] : [],
          "Before deadlines": Array.isArray(result.plan["Before deadlines"]) ? result.plan["Before deadlines"] : [],
        };
        
        // Set plan for the specific program (shown in modal)
        setProgramPlan(validatedPlan);
        // Also update the main plan
        setPlan(validatedPlan);
      } else {
        setPlanError(result.error || "Failed to generate plan");
      }
    } catch (error: any) {
      console.error("Error generating plan:", error);
      setPlanError(error.message || "Failed to generate plan");
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  const renderProgramCard = (program: Program, index: number) => {
    const universityImageUrl = getUniversityImageUrl(program.university, program.country, program.imageUrl);
    
    return (
      <div
        key={index}
        className="border-l-4 pl-6 py-4 rounded-r-lg transition-all hover:shadow-lg cursor-pointer overflow-hidden"
        style={{
          borderColor: program.category === "Realistic" ? "#10b981" : "#f59e0b",
          backgroundColor: program.category === "Realistic" ? "#f0fdf4" : "#fffbeb",
        }}
        onClick={() => openModal(program, index)}
      >
        <div className="flex gap-4">
          {/* University Image */}
          <div className="flex-shrink-0 w-32 h-32 rounded-lg overflow-hidden bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500">
            <img
              src={universityImageUrl}
              alt={program.university}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
            {/* Fallback gradient with initial letter */}
            <div className="w-full h-full flex items-center justify-center text-white text-2xl font-bold">
              {program.university.charAt(0).toUpperCase()}
            </div>
          </div>

          {/* Program Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-3 flex-wrap gap-2">
              <div className="flex-1 min-w-0">
                <h3 className="text-xl font-bold text-gray-900 mb-1">{program.name}</h3>
                <p className="text-lg font-semibold text-blue-600 mb-1">{program.university}</p>
                <div className="flex items-center gap-3 text-sm text-gray-600 flex-wrap mt-2">
                  <span className="flex items-center">
                    <span className="mr-1">📍</span>
                    {program.country}
                  </span>
                  <span className="flex items-center">
                    <span className="mr-1">📚</span>
                    {program.field}
                  </span>
                  <span className={`flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    program.language === "English" 
                      ? "bg-blue-100 text-blue-700" 
                      : "bg-gray-100 text-gray-700"
                  }`}>
                    {program.language === "English" ? "🇬🇧 English" : "🌍 Local"}
                  </span>
                  {program.admissionStatus && (
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                      program.admissionStatus === "Can apply now" || program.admissionStatus === "Eligible now"
                        ? "bg-green-100 text-green-700"
                        : "bg-orange-100 text-orange-700"
                    }`}>
                      {program.admissionStatus === "Can apply now" ? "✓ Can apply" :
                       program.admissionStatus === "Eligible now" ? "✓ Eligible" :
                       "⚠ Need improvement"}
                    </span>
                  )}
                </div>
                {program.applicationDeadline && (
                  <div className="mt-2 text-sm text-gray-600">
                    <span className="font-medium">Deadline: </span>
                    {program.applicationDeadline}
                  </div>
                )}
              </div>
              <span
                className={`px-4 py-2 rounded-full text-sm font-bold ${
                  program.category === "Realistic"
                    ? "bg-green-500 text-white"
                    : "bg-amber-500 text-white"
                }`}
              >
                {program.category}
              </span>
            </div>
            <p className="text-gray-700 leading-relaxed">{program.reason}</p>
          </div>
        </div>
      </div>
    );
  };

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
              <Link href={`/housing?id=${submission.id}`} className="px-3 py-2 text-gray-700 hover:text-blue-600 font-medium transition-colors text-sm">
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

      <div className="max-w-6xl mx-auto">
        <div className="mb-8 text-center pt-4">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Your Admission Plan
          </h1>
          <p className="text-gray-600 text-lg">
            Generated for {submission.input.email}
          </p>
        </div>

        {/* Group by Country, then by Status */}
        <section className="bg-white rounded-2xl shadow-xl p-8 md:p-10 mb-8 border border-gray-100">
          <h2 className="text-3xl font-bold mb-6 text-gray-800">Recommended Programs</h2>
          
          {!programs || programs.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg mb-4">No programs found in your submission.</p>
              <p className="text-gray-500 text-sm">Please check your submission data or create a new plan.</p>
            </div>
          ) : Object.keys(programsByCountryAndStatus).length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg mb-4">Programs data is incomplete.</p>
              <p className="text-gray-500 text-sm">Please create a new admission plan.</p>
            </div>
          ) : (
            <div className="space-y-12">
              {Object.entries(programsByCountryAndStatus).map(([country, statusGroups]) => (
              <div key={country} className="border-b border-gray-200 last:border-b-0 pb-8 last:pb-0">
                <h3 className="text-2xl font-bold mb-6 text-gray-800 border-l-4 border-blue-500 pl-4">
                  {getCountryFlag(country)} {country}
                </h3>
                
                  {/* Programs you can apply to now */}
                  {statusGroups.canApply.length > 0 && (
                    <div className="mb-8">
                      <div className="space-y-4">
                        {statusGroups.canApply.map((program) => {
                          const originalIndex = programs.findIndex((p) => p === program);
                          return renderProgramCard(program, originalIndex);
                        })}
                      </div>
                    </div>
                  )}

                {/* Programs that need improvement */}
                {statusGroups.needImprovement.length > 0 && (
                  <div>
                    <h4 className="text-xl font-bold mb-4 text-orange-700 flex items-center">
                      <span className="mr-2">📈</span>
                      Potential Programs (Need Improvement)
                    </h4>
                    <p className="text-gray-600 mb-4 text-sm">These programs require better grades/scores</p>
                    <div className="space-y-4">
                      {statusGroups.needImprovement.map((program) => {
                        const originalIndex = programs.findIndex((p) => p === program);
                        return (
                          <div key={originalIndex}>
                            {renderProgramCard(program, originalIndex)}
                            {program.requiredImprovements && (
                              <div className="mt-3 p-4 bg-orange-50 border-l-4 border-orange-400 rounded">
                                <p className="text-sm font-medium text-orange-800">
                                  <span className="font-bold">What to improve: </span>
                                  {program.requiredImprovements}
                                </p>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            ))}
            </div>
          )}
        </section>

        {/* Admission Plan Section - only show if plan exists */}
        {plan && (
          <section id="admission-plan-section" className="bg-white rounded-2xl shadow-xl p-8 md:p-10 border border-gray-100">
            <h2 className="text-3xl font-bold mb-2 text-gray-800">Admission Timeline</h2>
            <p className="text-gray-600 mb-8">Your personalized action plan</p>

            {/* Requirements Section - Show first if exists */}
            {plan.requirements && (
              <div className="bg-purple-50 rounded-lg p-6 mb-8 border-l-4 border-purple-500">
                <h3 className="text-xl font-bold mb-4 text-purple-700 flex items-center">
                  <span className="mr-2">📋</span>
                  Admission Requirements
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* GPA Requirements */}
                  {plan.requirements.gpaRequirements && (
                    <div className="bg-white rounded-lg p-4">
                      <p className="text-sm font-semibold text-gray-700 mb-1">GPA/Grade Requirements:</p>
                      <p className="text-gray-900">{plan.requirements.gpaRequirements}</p>
                    </div>
                  )}

                  {/* Language Exam Requirements */}
                  {plan.requirements.languageExams && plan.requirements.languageExams.length > 0 && (
                    <div className="bg-white rounded-lg p-4">
                      <p className="text-sm font-semibold text-gray-700 mb-2">Language Exam Requirements:</p>
                      <ul className="list-disc list-inside space-y-1">
                        {plan.requirements.languageExams.map((exam, idx) => (
                          <li key={idx} className="text-gray-900 text-sm">{exam}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Entrance Exams */}
                  {plan.requirements.entranceExams && plan.requirements.entranceExams.length > 0 && (
                    <div className="bg-white rounded-lg p-4">
                      <p className="text-sm font-semibold text-gray-700 mb-2">Entrance Exams:</p>
                      <ul className="list-disc list-inside space-y-1">
                        {plan.requirements.entranceExams.map((exam, idx) => (
                          <li key={idx} className="text-gray-900 text-sm">{exam}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Other Requirements */}
                  {(plan.requirements.videoEssay || plan.requirements.portfolio || plan.requirements.recommendationLetters) && (
                    <div className="bg-white rounded-lg p-4">
                      <p className="text-sm font-semibold text-gray-700 mb-2">Additional Requirements:</p>
                      <ul className="space-y-1">
                        {plan.requirements.videoEssay && (
                          <li className="text-gray-900 text-sm">🎥 Video essay/video interview required</li>
                        )}
                        {plan.requirements.portfolio && (
                          <li className="text-gray-900 text-sm">🎨 Portfolio required</li>
                        )}
                        {plan.requirements.recommendationLetters && plan.requirements.recommendationLetters > 0 && (
                          <li className="text-gray-900 text-sm">📝 {plan.requirements.recommendationLetters} recommendation letter(s) required</li>
                        )}
                      </ul>
                    </div>
                  )}

                  {/* Other Requirements List */}
                  {plan.requirements.otherRequirements && plan.requirements.otherRequirements.length > 0 && (
                    <div className="bg-white rounded-lg p-4">
                      <p className="text-sm font-semibold text-gray-700 mb-2">Other Requirements:</p>
                      <ul className="list-disc list-inside space-y-1">
                        {plan.requirements.otherRequirements.map((req, idx) => (
                          <li key={idx} className="text-gray-900 text-sm">{req}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="space-y-8">
              <div className="mb-6 pb-6 border-b border-gray-200">
                <h3 className="text-xl font-bold mb-4 text-blue-600 flex items-center">
                  <span className="mr-2">📅</span>
                  Now – 3 months
                </h3>
                <ul className="space-y-3">
                  {plan["Now – 3 months"]?.map((item, index) => (
                    <li key={index} className="flex items-start group">
                      <span className="mr-3 mt-1 text-green-500 font-bold text-lg">✓</span>
                      <span className="text-gray-700 group-hover:text-gray-900 transition-colors">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mb-6 pb-6 border-b border-gray-200">
                <h3 className="text-xl font-bold mb-4 text-purple-600 flex items-center">
                  <span className="mr-2">📅</span>
                  3–6 months
                </h3>
                <ul className="space-y-3">
                  {plan["3–6 months"]?.map((item, index) => (
                    <li key={index} className="flex items-start group">
                      <span className="mr-3 mt-1 text-green-500 font-bold text-lg">✓</span>
                      <span className="text-gray-700 group-hover:text-gray-900 transition-colors">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-bold mb-4 text-amber-600 flex items-center">
                  <span className="mr-2">⏰</span>
                  Before deadlines
                </h3>
                <ul className="space-y-3">
                  {plan["Before deadlines"]?.map((item, index) => (
                    <li key={index} className="flex items-start group">
                      <span className="mr-3 mt-1 text-green-500 font-bold text-lg">✓</span>
                      <span className="text-gray-700 group-hover:text-gray-900 transition-colors">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>
        )}

        {/* Footer */}
        <div className="mt-10 text-center">
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            Create another plan
          </Link>
        </div>
      </div>

      {/* Modal for Program Details */}
      {isModalOpen && selectedProgram && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={closeModal}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800">Program Details</h2>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
              >
                ×
              </button>
            </div>

             <div className="p-6 space-y-6">
               {/* University Image */}
               <div className="relative w-full h-64 rounded-lg overflow-hidden shadow-lg bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500">
                 <img
                   src={getUniversityImageUrl(selectedProgram.university, selectedProgram.country, selectedProgram.imageUrl)}
                   alt={selectedProgram.university}
                   className="w-full h-full object-cover relative z-10"
                   loading="eager"
                   onError={(e) => {
                     const target = e.target as HTMLImageElement;
                     target.style.display = 'none';
                     // Show fallback when image fails
                     const fallback = target.nextElementSibling as HTMLElement;
                     if (fallback) {
                       fallback.style.display = 'flex';
                     }
                   }}
                   onLoad={(e) => {
                     // Hide fallback when image loads successfully
                     const fallback = (e.target as HTMLImageElement).nextElementSibling as HTMLElement;
                     if (fallback) {
                       fallback.style.display = 'none';
                     }
                   }}
                 />
                 {/* Fallback gradient - shown only if image fails */}
                 <div 
                   className="w-full h-full flex items-center justify-center text-white text-5xl font-bold absolute inset-0 z-0"
                 >
                   {selectedProgram.university.charAt(0).toUpperCase()}
                 </div>
               </div>

              <div>
                <h3 className="text-3xl font-bold text-gray-900 mb-2">{selectedProgram.name}</h3>
                <p className="text-2xl font-semibold text-blue-600 mb-4">{selectedProgram.university}</p>
                {selectedProgram.description && (
                  <p className="text-gray-700 leading-relaxed mb-4">{selectedProgram.description}</p>
                )}
                {selectedProgram.programStructure && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg border-l-4 border-blue-500">
                    <h4 className="text-lg font-bold text-gray-800 mb-2">📚 Program Structure</h4>
                    <p className="text-gray-700 leading-relaxed whitespace-pre-line">{selectedProgram.programStructure}</p>
                  </div>
                )}
              </div>

              {/* Contact Information - Always show section */}
              <div className="border-t border-gray-200 pt-6">
                <h4 className="text-xl font-bold mb-4 text-gray-800">Contact Information</h4>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <span className="mr-3 text-2xl">🌐</span>
                    {selectedProgram.websiteUrl ? (
                      <a
                        href={selectedProgram.websiteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {selectedProgram.websiteUrl}
                      </a>
                    ) : (
                      <span className="text-gray-400">Not specified</span>
                    )}
                  </div>
                  <div className="flex items-center">
                    <span className="mr-3 text-2xl">📧</span>
                    {selectedProgram.contactEmail ? (
                      <a
                        href={`mailto:${selectedProgram.contactEmail}`}
                        className="text-blue-600 hover:underline"
                      >
                        {selectedProgram.contactEmail}
                      </a>
                    ) : (
                      <span className="text-gray-400">Not specified</span>
                    )}
                  </div>
                  <div className="flex items-center">
                    <span className="mr-3 text-2xl">📞</span>
                    {selectedProgram.contactPhone ? (
                      <a
                        href={`tel:${selectedProgram.contactPhone}`}
                        className="text-blue-600 hover:underline"
                      >
                        {selectedProgram.contactPhone}
                      </a>
                    ) : (
                      <span className="text-gray-400">Not specified</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Dates and Deadlines - Always show section */}
              <div className="border-t border-gray-200 pt-6">
                <h4 className="text-xl font-bold mb-4 text-gray-800">Important Dates</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className={`p-4 rounded-lg ${selectedProgram.applicationStartDate ? 'bg-blue-50' : 'bg-gray-50'}`}>
                    <p className="text-sm text-gray-600 mb-1">Application Opens</p>
                    <p className={`font-semibold ${selectedProgram.applicationStartDate ? 'text-gray-900' : 'text-gray-400'}`}>
                      {selectedProgram.applicationStartDate || "Not specified"}
                    </p>
                  </div>
                  <div className={`p-4 rounded-lg ${selectedProgram.applicationDeadline ? 'bg-red-50' : 'bg-gray-50'}`}>
                    <p className="text-sm text-gray-600 mb-1">Application Deadline</p>
                    <p className={`font-semibold ${selectedProgram.applicationDeadline ? 'text-gray-900' : 'text-gray-400'}`}>
                      {selectedProgram.applicationDeadline || "Not specified"}
                    </p>
                  </div>
                  <div className={`p-4 rounded-lg ${selectedProgram.tuitionFee ? 'bg-purple-50' : 'bg-gray-50'}`}>
                    <p className="text-sm text-gray-600 mb-1">Tuition Fee</p>
                    <p className={`font-semibold ${selectedProgram.tuitionFee ? 'text-gray-900' : 'text-gray-400'}`}>
                      {selectedProgram.tuitionFee || "Not specified"}
                    </p>
                  </div>
                  {selectedProgram.semesterStartDate && (
                    <div className="p-4 bg-green-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Semester Start</p>
                      <p className="font-semibold text-gray-900">{selectedProgram.semesterStartDate}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Admission Status */}
              {selectedProgram.admissionStatus && (
                <div className={`p-4 rounded-lg ${
                  selectedProgram.admissionStatus === "Can apply now" || selectedProgram.admissionStatus === "Eligible now"
                    ? "bg-green-50 border border-green-200"
                    : "bg-orange-50 border border-orange-200"
                }`}>
                  <p className="font-semibold text-gray-900 mb-2">
                    Admission Status: {selectedProgram.admissionStatus}
                  </p>
                  {selectedProgram.requiredImprovements && (
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">Required: </span>
                      {selectedProgram.requiredImprovements}
                    </p>
                  )}
                </div>
              )}

              {/* Quick Links to Other Sections */}
              <div className="border-t border-gray-200 pt-6">
                <h4 className="text-lg font-semibold mb-4 text-gray-800">More Information</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <Link
                    href={`/housing?id=${submission.id}&country=${encodeURIComponent(selectedProgram.country)}&university=${encodeURIComponent(selectedProgram.university)}`}
                    className="px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-md hover:shadow-lg text-center text-sm"
                  >
                    housing info
                  </Link>
                  <Link
                    href={`/country-info?id=${submission.id}&country=${encodeURIComponent(selectedProgram.country)}`}
                    className="px-4 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white font-medium rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all shadow-md hover:shadow-lg text-center text-sm"
                  >
                    country&city info
                  </Link>
                  <Link
                    href={`/documents?id=${submission.id}&country=${encodeURIComponent(selectedProgram.country)}`}
                    className="px-4 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-medium rounded-lg hover:from-green-600 hover:to-green-700 transition-all shadow-md hover:shadow-lg text-center text-sm"
                  >
                    documentation guide
                  </Link>
                </div>
              </div>

              {/* Generate Plan Button and Display */}
              {selectedProgramIndex !== null && (
                <div className="border-t border-gray-200 pt-6">
                  {planError && (
                    <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                      {planError}
                    </div>
                  )}
                  {!programPlan ? (
                    <button
                      onClick={handleGeneratePlan}
                      disabled={isGeneratingPlan}
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-6 rounded-lg font-semibold text-lg hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transform transition-all hover:scale-[1.02] shadow-lg hover:shadow-xl"
                    >
                      {isGeneratingPlan ? (
                        <span className="flex items-center justify-center">
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Generating plan...
                        </span>
                      ) : (
                        "🎯 Generate Admission Plan for This Program"
                      )}
                    </button>
                  ) : (
                    <div className="space-y-6">
                      <div className="text-center text-green-600 mb-4">
                        <p className="font-semibold">✓ Plan has been generated for this program</p>
                      </div>
                      
                      {/* Display Plan in Modal */}
                      {programPlan && (
                        <div className="bg-blue-50 rounded-lg p-6">
                          <h4 className="text-xl font-bold mb-4 text-gray-800">Admission Plan for {selectedProgram.university}</h4>
                          
                          <div className="space-y-6">
                            {/* Requirements Section - Show first */}
                            {programPlan.requirements && (
                              <div className="bg-white rounded-lg p-5 mb-6 border-l-4 border-purple-500">
                                <h5 className="text-lg font-bold mb-4 text-purple-700 flex items-center">
                                  <span className="mr-2">📋</span>
                                  Admission Requirements
                                </h5>
                                
                                <div className="space-y-4">
                                  {/* GPA Requirements */}
                                  {programPlan.requirements.gpaRequirements && (
                                    <div>
                                      <p className="text-sm font-semibold text-gray-700 mb-1">GPA/Grade Requirements:</p>
                                      <p className="text-gray-900">{programPlan.requirements.gpaRequirements}</p>
                                    </div>
                                  )}

                                  {/* Language Exam Requirements */}
                                  {programPlan.requirements.languageExams && programPlan.requirements.languageExams.length > 0 && (
                                    <div>
                                      <p className="text-sm font-semibold text-gray-700 mb-1">Language Exam Requirements:</p>
                                      <ul className="list-disc list-inside space-y-1">
                                        {programPlan.requirements.languageExams.map((exam, idx) => (
                                          <li key={idx} className="text-gray-900">{exam}</li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}

                                  {/* Entrance Exams */}
                                  {programPlan.requirements.entranceExams && programPlan.requirements.entranceExams.length > 0 && (
                                    <div>
                                      <p className="text-sm font-semibold text-gray-700 mb-1">Entrance Exams:</p>
                                      <ul className="list-disc list-inside space-y-1">
                                        {programPlan.requirements.entranceExams.map((exam, idx) => (
                                          <li key={idx} className="text-gray-900">{exam}</li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}

                                  {/* Video Essay */}
                                  {programPlan.requirements.videoEssay && (
                                    <div className="flex items-center">
                                      <span className="mr-2">🎥</span>
                                      <p className="text-gray-900">Video essay/video interview required</p>
                                    </div>
                                  )}

                                  {/* Portfolio */}
                                  {programPlan.requirements.portfolio && (
                                    <div className="flex items-center">
                                      <span className="mr-2">🎨</span>
                                      <p className="text-gray-900">Portfolio required</p>
                                    </div>
                                  )}

                                  {/* Recommendation Letters */}
                                  {programPlan.requirements.recommendationLetters && programPlan.requirements.recommendationLetters > 0 && (
                                    <div>
                                      <p className="text-sm font-semibold text-gray-700 mb-1">Recommendation Letters:</p>
                                      <p className="text-gray-900">{programPlan.requirements.recommendationLetters} letter(s) required</p>
                                    </div>
                                  )}

                                  {/* Other Requirements */}
                                  {programPlan.requirements.otherRequirements && programPlan.requirements.otherRequirements.length > 0 && (
                                    <div>
                                      <p className="text-sm font-semibold text-gray-700 mb-1">Other Requirements:</p>
                                      <ul className="list-disc list-inside space-y-1">
                                        {programPlan.requirements.otherRequirements.map((req, idx) => (
                                          <li key={idx} className="text-gray-900">{req}</li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Now - 3 months */}
                            {programPlan["Now – 3 months"] && Array.isArray(programPlan["Now – 3 months"]) && (
                              <div>
                                <h5 className="text-lg font-bold mb-3 text-blue-600 flex items-center">
                                  <span className="mr-2">📅</span>
                                  Now – 3 months
                                </h5>
                                <ul className="space-y-2 ml-7">
                                  {programPlan["Now – 3 months"].map((item, index) => (
                                    <li key={index} className="flex items-start">
                                      <span className="mr-3 mt-1 text-green-500 font-bold">✓</span>
                                      <span className="text-gray-700">{String(item || "")}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {/* 3-6 months */}
                            {programPlan["3–6 months"] && Array.isArray(programPlan["3–6 months"]) && (
                              <div>
                                <h5 className="text-lg font-bold mb-3 text-purple-600 flex items-center">
                                  <span className="mr-2">📅</span>
                                  3–6 months
                                </h5>
                                <ul className="space-y-2 ml-7">
                                  {programPlan["3–6 months"].map((item, index) => (
                                    <li key={index} className="flex items-start">
                                      <span className="mr-3 mt-1 text-green-500 font-bold">✓</span>
                                      <span className="text-gray-700">{String(item || "")}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {/* Before deadlines */}
                            {programPlan["Before deadlines"] && Array.isArray(programPlan["Before deadlines"]) && (
                              <div>
                                <h5 className="text-lg font-bold mb-3 text-amber-600 flex items-center">
                                  <span className="mr-2">⏰</span>
                                  Before deadlines
                                </h5>
                                <ul className="space-y-2 ml-7">
                                  {programPlan["Before deadlines"].map((item, index) => (
                                    <li key={index} className="flex items-start">
                                      <span className="mr-3 mt-1 text-green-500 font-bold">✓</span>
                                      <span className="text-gray-700">{String(item || "")}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
