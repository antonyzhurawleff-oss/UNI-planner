"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useLanguage } from "../contexts/LanguageContext";
import LanguageSwitcher from "../components/LanguageSwitcher";
import Link from "next/link";
import { getSubmission } from "../actions";
import { Submission } from "../types";

export default function EssayEditorPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [essayText, setEssayText] = useState("");
  const [resumeText, setResumeText] = useState("");
  const [activeTab, setActiveTab] = useState<"essay" | "resume">("essay");
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);

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
              <Link href={`/housing?id=${submission.id}`} className="px-3 py-2 text-gray-700 hover:text-blue-600 font-medium transition-colors text-sm">
                housing
              </Link>
              <Link href={`/essay-editor?id=${submission.id}`} className="px-3 py-2 text-blue-600 hover:text-blue-700 font-medium transition-colors text-sm border-b-2 border-blue-600">
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
            {t("essay_editor.title")}
          </h1>
          <p className="text-xl text-gray-600">
            {t("essay_editor.subtitle")}
          </p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex border-b border-gray-200 mb-6">
            <button
              onClick={() => setActiveTab("essay")}
              className={`px-6 py-3 font-semibold transition-colors ${
                activeTab === "essay"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-600 hover:text-blue-600"
              }`}
            >
              {t("essay_editor.essay")}
            </button>
            <button
              onClick={() => setActiveTab("resume")}
              className={`px-6 py-3 font-semibold transition-colors ${
                activeTab === "resume"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-600 hover:text-blue-600"
              }`}
            >
              {t("essay_editor.resume")}
            </button>
          </div>

          {activeTab === "essay" ? (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t("essay_editor.essay_text")}
              </label>
              <textarea
                value={essayText}
                onChange={(e) => setEssayText(e.target.value)}
                placeholder={t("essay_editor.essay_placeholder")}
                className="w-full h-96 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
              <div className="mt-4 flex gap-4">
                <button className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all">
                  {t("essay_editor.analyze")}
                </button>
                <button className="px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-all">
                  {t("essay_editor.improve")}
                </button>
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t("essay_editor.resume_text")}
              </label>
              <textarea
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                placeholder={t("essay_editor.resume_placeholder")}
                className="w-full h-96 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
              <div className="mt-4 flex gap-4">
                <button className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all">
                  {t("essay_editor.analyze")}
                </button>
                <button className="px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-all">
                  {t("essay_editor.improve")}
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
