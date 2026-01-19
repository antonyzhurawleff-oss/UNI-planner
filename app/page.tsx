"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLanguage } from "./contexts/LanguageContext";
import LanguageSwitcher from "./components/LanguageSwitcher";

export default function Home() {
  const router = useRouter();
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                University Planner
              </h1>
            </div>
            <nav className="flex items-center gap-4">
              <LanguageSwitcher />
              <button className="px-4 py-2 text-gray-700 hover:text-blue-600 font-medium transition-colors">
                {t("header.registration")}
              </button>
              <button className="px-4 py-2 text-gray-700 hover:text-blue-600 font-medium transition-colors">
                {t("header.help")}
              </button>
            </nav>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section - Enhanced */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          <div className="text-center relative">
            {/* Floating background elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
              <div className="absolute top-40 right-10 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
              <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
            </div>
            
            <div className="relative z-10">
              <h2 className="text-6xl md:text-7xl lg:text-8xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent leading-tight animate-fade-in">
                {t("landing.title")}
              </h2>
              <p className="text-xl md:text-2xl text-gray-600 mb-4 max-w-3xl mx-auto leading-relaxed">
                {t("landing.subtitle")}
              </p>
              <p className="text-lg text-gray-500 mb-12 max-w-2xl mx-auto">
                Get personalized admission plans, find housing, explore countries, and navigate documentation — all in one place
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
                <button
                  onClick={() => router.push("/form")}
                  className="px-10 py-5 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold text-lg rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all shadow-xl hover:shadow-2xl transform hover:scale-105"
                >
                  🎓 {t("landing.cta")}
                </button>
                <Link
                  href="/access"
                  className="px-10 py-5 bg-white text-gray-700 font-semibold text-lg rounded-xl border-2 border-gray-200 hover:border-blue-300 transition-all shadow-md hover:shadow-lg"
                >
                  {t("landing.access")}
                </Link>
              </div>
            </div>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-24 max-w-4xl mx-auto">
            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg text-center border border-gray-100">
              <div className="text-3xl font-bold text-blue-600 mb-2">100+</div>
              <div className="text-sm text-gray-600">Universities</div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg text-center border border-gray-100">
              <div className="text-3xl font-bold text-purple-600 mb-2">50+</div>
              <div className="text-sm text-gray-600">Countries</div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg text-center border border-gray-100">
              <div className="text-3xl font-bold text-pink-600 mb-2">24/7</div>
              <div className="text-sm text-gray-600">Support</div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg text-center border border-gray-100">
              <div className="text-3xl font-bold text-blue-600 mb-2">AI</div>
              <div className="text-sm text-gray-600">Powered</div>
            </div>
          </div>
        </section>

        {/* Features Section - Enhanced */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-16">
            <h3 className="text-4xl md:text-5xl font-bold mb-4 text-gray-800">
              Everything You Need
            </h3>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Comprehensive tools and resources to make your study abroad journey seamless
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all border border-gray-100 transform hover:-translate-y-2">
              <div className="text-5xl mb-4">🎯</div>
              <h4 className="text-xl font-bold mb-3 text-gray-800">{t("landing.features.title1")}</h4>
              <p className="text-gray-600 leading-relaxed">
                {t("landing.features.desc1")}
              </p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all border border-gray-100 transform hover:-translate-y-2">
              <div className="text-5xl mb-4">📅</div>
              <h4 className="text-xl font-bold mb-3 text-gray-800">{t("landing.features.title2")}</h4>
              <p className="text-gray-600 leading-relaxed">
                {t("landing.features.desc2")}
              </p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all border border-gray-100 transform hover:-translate-y-2">
              <div className="text-5xl mb-4">💼</div>
              <h4 className="text-xl font-bold mb-3 text-gray-800">{t("landing.features.title3")}</h4>
              <p className="text-gray-600 leading-relaxed">
                {t("landing.features.desc3")}
              </p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all border border-gray-100 transform hover:-translate-y-2">
              <div className="text-5xl mb-4">🏠</div>
              <h4 className="text-xl font-bold mb-3 text-gray-800">Housing Finder</h4>
              <p className="text-gray-600 leading-relaxed">
                Discover real student housing options with costs, availability, and photos
              </p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all border border-gray-100 transform hover:-translate-y-2">
              <div className="text-5xl mb-4">🌍</div>
              <h4 className="text-xl font-bold mb-3 text-gray-800">Country Insights</h4>
              <p className="text-gray-600 leading-relaxed">
                Detailed information about countries, cost of living, and student benefits
              </p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all border border-gray-100 transform hover:-translate-y-2">
              <div className="text-5xl mb-4">📋</div>
              <h4 className="text-xl font-bold mb-3 text-gray-800">Document Guide</h4>
              <p className="text-gray-600 leading-relaxed">
                Step-by-step guides for visas, residence permits, and all required documents
              </p>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="bg-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h3 className="text-4xl md:text-5xl font-bold mb-4 text-gray-800">
                How It Works
              </h3>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Get your personalized admission plan in just a few simple steps
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
              {/* Connection lines for desktop */}
              <div className="hidden md:block absolute top-16 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-blue-200 via-purple-200 to-pink-200"></div>
              
              <div className="text-center relative z-10">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white text-3xl font-bold mx-auto mb-6 shadow-lg">
                  1
                </div>
                <h4 className="text-xl font-bold mb-3 text-gray-800">Fill Out Form</h4>
                <p className="text-gray-600 leading-relaxed">
                  Tell us about your academic background, preferred countries, and study goals
                </p>
              </div>

              <div className="text-center relative z-10">
                <div className="w-20 h-20 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white text-3xl font-bold mx-auto mb-6 shadow-lg">
                  2
                </div>
                <h4 className="text-xl font-bold mb-3 text-gray-800">Get Matched</h4>
                <p className="text-gray-600 leading-relaxed">
                  Our AI analyzes your profile and matches you with suitable universities and programs
                </p>
              </div>

              <div className="text-center relative z-10">
                <div className="w-20 h-20 bg-gradient-to-r from-pink-600 to-blue-600 rounded-full flex items-center justify-center text-white text-3xl font-bold mx-auto mb-6 shadow-lg">
                  3
                </div>
                <h4 className="text-xl font-bold mb-3 text-gray-800">Explore & Apply</h4>
                <p className="text-gray-600 leading-relaxed">
                  Review detailed plans, find housing, check requirements, and start your application
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section - Enhanced */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-3xl p-12 md:p-16 text-white shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative z-10">
              <div className="text-6xl mb-6">🚀</div>
              <h3 className="text-4xl md:text-5xl font-bold mb-4">{t("landing.ready.title")}</h3>
              <p className="text-xl md:text-2xl mb-8 opacity-90 max-w-2xl mx-auto">
                {t("landing.ready.desc")}
              </p>
              <button
                onClick={() => router.push("/form")}
                className="px-10 py-5 bg-white text-blue-600 font-semibold text-lg rounded-xl hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                {t("landing.ready.button")}
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer - Enhanced */}
      <footer className="mt-20 border-t border-gray-200 py-12 bg-white/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <h5 className="font-bold text-gray-800 mb-4">University Planner</h5>
              <p className="text-gray-600 text-sm">
                Your comprehensive guide to studying abroad
              </p>
            </div>
            <div>
              <h5 className="font-bold text-gray-800 mb-4">Quick Links</h5>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/form" className="text-gray-600 hover:text-blue-600">
                    Create Plan
                  </Link>
                </li>
                <li>
                  <Link href="/access" className="text-gray-600 hover:text-blue-600">
                    Access Plan
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h5 className="font-bold text-gray-800 mb-4">Contact</h5>
              <p className="text-gray-600 text-sm">
                Need help? We're here for you 24/7
              </p>
            </div>
          </div>
          <div className="border-t border-gray-200 pt-8 text-center text-gray-600 text-sm">
            <p>{t("footer.copyright")}</p>
          </div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}
