"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type Language = "en" | "ru" | "de" | "sr";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");

  useEffect(() => {
    // Load language from localStorage on mount
    const saved = localStorage.getItem("language") as Language;
    if (saved && ["en", "ru", "de", "sr"].includes(saved)) {
      setLanguageState(saved);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("language", lang);
  };

  // Simple translation function - for now returns key, can be expanded with translation objects
  const t = (key: string): string => {
    const translations: Record<string, Record<Language, string>> = {
      // Header
      "header.registration": { en: "Registration", ru: "Регистрация", de: "Registrierung", sr: "Регистрација" },
      "header.help": { en: "Help", ru: "Помощь", de: "Hilfe", sr: "Помоћ" },
      // Landing page
      "landing.title": { en: "Tired of endless university searches?", ru: "Устали от бесконечного поиска университетов?", de: "Müde von der endlosen Universitätssuche?", sr: "Уморени од бесконачне потраге за универзитетима?" },
      "landing.subtitle": { en: "Get your personalized admission plan with program recommendations, deadlines, and detailed instructions in just a few minutes", ru: "Получите персональный план поступления с рекомендациями программ, дедлайнами и детальными инструкциями всего за несколько минут", de: "Erhalten Sie Ihren persönlichen Zulassungsplan mit Programmvorschlägen, Fristen und detaillierten Anweisungen in nur wenigen Minuten", sr: "Добијте персонализовани план уписа са препорукама програма, роковима и детаљним упутствима за само неколико минута" },
      "landing.cta": { en: "Apply", ru: "Поступить", de: "Bewerben", sr: "Пријави се" },
      "landing.access": { en: "Access plan", ru: "Доступ к плану", de: "Plan zugreifen", sr: "Приступ плану" },
      "landing.features.title1": { en: "Personal recommendations", ru: "Персональные рекомендации", de: "Persönliche Empfehlungen", sr: "Персонализоване препоруке" },
      "landing.features.desc1": { en: "Programs are matched based on your grades, budget and preferences", ru: "Программы подбираются на основе ваших оценок, бюджета и предпочтений", de: "Programme werden basierend auf Ihren Noten, Budget und Präferenzen abgestimmt", sr: "Програми се подударају на основу ваших оцена, буџета и преференци" },
      "landing.features.title2": { en: "Deadlines and dates", ru: "Дедлайны и даты", de: "Fristen und Termine", sr: "Рокови и датуми" },
      "landing.features.desc2": { en: "Get exact application deadlines and start dates", ru: "Получите точные даты подачи документов и начала обучения", de: "Erhalten Sie genaue Bewerbungsfristen und Starttermine", sr: "Добијте тачне рокове за пријаве и датуме почетка" },
      "landing.features.title3": { en: "Detailed information", ru: "Детальная информация", de: "Detaillierte Informationen", sr: "Детаљне информације" },
      "landing.features.desc3": { en: "Admissions office contacts, tuition fees and requirements", ru: "Контакты приемной комиссии, стоимость обучения и требования", de: "Kontakte der Zulassungsstelle, Studiengebühren und Anforderungen", sr: "Контакти уписне комисије, школарина и услови" },
      "landing.ready.title": { en: "Ready to start?", ru: "Готовы начать?", de: "Bereit zu starten?", sr: "Спремни да почнете?" },
      "landing.ready.desc": { en: "Create your admission plan right now", ru: "Создайте свой план поступления прямо сейчас", de: "Erstellen Sie jetzt Ihren Zulassungsplan", sr: "Креирајте ваш план уписа управо сада" },
      "landing.ready.button": { en: "Start now →", ru: "Начать сейчас →", de: "Jetzt starten →", sr: "Почните сада →" },
            "footer.copyright": { en: "© 2024 University Planner. All rights reserved.", ru: "© 2024 University Planner. Все права защищены.", de: "© 2024 University Planner. Alle Rechte vorbehalten.", sr: "© 2024 Универзитетски Планер. Сва права задржана." },
            // University Finder
            "university_finder.title": { en: "University Finder", ru: "Подбор Университета", de: "Universitätssuche", sr: "Претрага Универзитета" },
            "university_finder.subtitle": { en: "Find the perfect university for your studies", ru: "Найдите идеальный университет для обучения", de: "Finden Sie die perfekte Universität für Ihr Studium", sr: "Пронађите савршен универзитет за ваше студије" },
            "university_finder.search_query": { en: "Search Query", ru: "Поисковый запрос", de: "Suchanfrage", sr: "Претрага" },
            "university_finder.search_placeholder": { en: "Enter university name or program", ru: "Введите название университета или программы", de: "Geben Sie den Universitäts- oder Programmnamen ein", sr: "Унесите име универзитета или програм" },
            "university_finder.country": { en: "Country", ru: "Страна", de: "Land", sr: "Земља" },
            "university_finder.select_country": { en: "Select country", ru: "Выберите страну", de: "Land auswählen", sr: "Изаберите земљу" },
            "university_finder.program": { en: "Program", ru: "Программа", de: "Programm", sr: "Програм" },
            "university_finder.program_placeholder": { en: "Enter program name", ru: "Введите название программы", de: "Geben Sie den Programmnamen ein", sr: "Унесите име програма" },
            "university_finder.search_button": { en: "Search Universities", ru: "Найти Университеты", de: "Universitäten suchen", sr: "Претражи Универзитете" },
            "university_finder.coming_soon": { en: "This feature is coming soon. Use the main form to generate your admission plan.", ru: "Эта функция скоро появится. Используйте основную форму для генерации плана поступления.", de: "Diese Funktion wird bald verfügbar sein. Verwenden Sie das Hauptformular, um Ihren Zulassungsplan zu erstellen.", sr: "Ова функција ће ускоро бити доступна. Користите главни образац за генерисање вашег плана уписа." },
            // Housing
            "housing.title": { en: "Student Housing", ru: "Общежития", de: "Studentenwohnheime", sr: "Студентски смештај" },
            "housing.subtitle": { en: "Find accommodation near your university", ru: "Найдите жилье рядом с университетом", de: "Finden Sie Unterkünfte in der Nähe Ihrer Universität", sr: "Пронађите смештај у близини вашег универзитета" },
            "housing.country": { en: "Country", ru: "Страна", de: "Land", sr: "Земља" },
            "housing.select_country": { en: "Select country", ru: "Выберите страну", de: "Land auswählen", sr: "Изаберите земљу" },
            "housing.city": { en: "City", ru: "Город", de: "Stadt", sr: "Град" },
            "housing.city_placeholder": { en: "Enter city name", ru: "Введите название города", de: "Geben Sie den Stadtnamen ein", sr: "Унесите име града" },
            "housing.university": { en: "University", ru: "Университет", de: "Universität", sr: "Универзитет" },
            "housing.university_placeholder": { en: "Enter university name", ru: "Введите название университета", de: "Geben Sie den Universitätsnamen ein", sr: "Унесите име универзитета" },
            "housing.search_button": { en: "Search Housing", ru: "Найти Жилье", de: "Unterkünfte suchen", sr: "Претражи смештај" },
            "housing.coming_soon": { en: "This feature is coming soon.", ru: "Эта функция скоро появится.", de: "Diese Funktion wird bald verfügbar sein.", sr: "Ова функција ће ускоро бити доступна." },
            // Essay Editor
            "essay_editor.title": { en: "Essay & Resume Editor", ru: "Редактор Эссе и Резюме", de: "Aufsatz- und Lebenslauf-Editor", sr: "Уређивач есеја и резјумеа" },
            "essay_editor.subtitle": { en: "Improve your application documents with AI", ru: "Улучшите ваши документы для поступления с помощью ИИ", de: "Verbessern Sie Ihre Bewerbungsunterlagen mit KI", sr: "Побољшајте ваше документе за пријаву уз помоћ AI" },
            "essay_editor.essay": { en: "Essay", ru: "Эссе", de: "Aufsatz", sr: "Есеј" },
            "essay_editor.resume": { en: "Resume / CV", ru: "Резюме", de: "Lebenslauf", sr: "Резјуме / Биографија" },
            "essay_editor.essay_text": { en: "Essay Text", ru: "Текст эссе", de: "Aufsatztext", sr: "Текст есеја" },
            "essay_editor.essay_placeholder": { en: "Paste your motivation letter or essay here...", ru: "Вставьте ваше мотивационное письмо или эссе здесь...", de: "Fügen Sie hier Ihr Motivationsschreiben oder Aufsatz ein...", sr: "Налепите ваше мотивационо писмо или есеј овде..." },
            "essay_editor.resume_text": { en: "Resume / CV Text", ru: "Текст резюме", de: "Lebenslauftext", sr: "Текст резјумеа / Биографије" },
            "essay_editor.resume_placeholder": { en: "Paste your resume or CV here...", ru: "Вставьте ваше резюме здесь...", de: "Fügen Sie hier Ihren Lebenslauf ein...", sr: "Налепите ваш резјуме или биографију овде..." },
            "essay_editor.analyze": { en: "Analyze", ru: "Анализировать", de: "Analysieren", sr: "Анализирај" },
            "essay_editor.improve": { en: "Improve", ru: "Улучшить", de: "Verbessern", sr: "Побољшај" },
            // Country Info
            "country_info.title": { en: "Country Information", ru: "Информация о Стране", de: "Länderinformationen", sr: "Информације о земљи" },
            "country_info.subtitle": { en: "Learn about countries and cost of living for students", ru: "Узнайте о странах и стоимости жизни для студентов", de: "Erfahren Sie mehr über Länder und Lebenshaltungskosten für Studenten", sr: "Сазнајте о земљама и трошковима живота за студенте" },
            "country_info.select_country": { en: "Select a country to view information", ru: "Выберите страну для просмотра информации", de: "Wählen Sie ein Land aus, um Informationen anzuzeigen", sr: "Изаберите земљу за приказ информација" },
            "country_info.about": { en: "About", ru: "О", de: "Über", sr: "О" },
            "country_info.cost_of_living": { en: "Cost of Living", ru: "Стоимость Жизни", de: "Lebenshaltungskosten", sr: "Трошкови живота" },
            "country_info.accommodation": { en: "Accommodation", ru: "Жилье", de: "Unterkunft", sr: "Смештај" },
            "country_info.food": { en: "Food", ru: "Еда", de: "Essen", sr: "Храна" },
            "country_info.transport": { en: "Transport", ru: "Транспорт", de: "Transport", sr: "Превоз" },
            "country_info.total": { en: "Total Monthly", ru: "Всего в месяц", de: "Gesamt monatlich", sr: "Укупно месечно" },
            "country_info.general_info": { en: "General Information", ru: "Общая Информация", de: "Allgemeine Informationen", sr: "Опште информације" },
            "country_info.coming_soon": { en: "Detailed information coming soon.", ru: "Подробная информация скоро появится.", de: "Detaillierte Informationen werden bald verfügbar sein.", sr: "Детаљне информације ће ускоро бити доступне." },
            // Documents
            "documents.title": { en: "Documentation Guide", ru: "Руководство по Документам", de: "Dokumentationsleitfaden", sr: "Водич за документацију" },
            "documents.subtitle": { en: "Step-by-step guide for visas, residence permits, and more", ru: "Пошаговое руководство по визам, видам на жительство и другим документам", de: "Schritt-für-Schritt-Anleitung für Visa, Aufenthaltsgenehmigungen und mehr", sr: "Корак-по-корак водич за визе, дозволе за боравак и више" },
            "documents.country": { en: "Country", ru: "Страна", de: "Land", sr: "Земља" },
            "documents.select_country": { en: "Select country", ru: "Выберите страну", de: "Land auswählen", sr: "Изаберите земљу" },
            "documents.document_type": { en: "Document Type", ru: "Тип Документа", de: "Dokumenttyp", sr: "Тип документа" },
            "documents.select_document": { en: "Select document type", ru: "Выберите тип документа", de: "Dokumenttyp auswählen", sr: "Изаберите тип документа" },
            "documents.visa": { en: "Student Visa", ru: "Студенческая Виза", de: "Studentenvisum", sr: "Студентска виза" },
            "documents.residence_permit": { en: "Residence Permit", ru: "Вид на Жительство", de: "Aufenthaltsgenehmigung", sr: "Дозвола за боравак" },
            "documents.bank_account": { en: "Bank Account", ru: "Банковский Счет", de: "Bankkonto", sr: "Банковни рачун" },
            "documents.health_insurance": { en: "Health Insurance", ru: "Медицинская Страховка", de: "Krankenversicherung", sr: "Здравствено осигурање" },
            "documents.registration": { en: "Registration", ru: "Регистрация", de: "Registrierung", sr: "Регистрација" },
            "documents.requirements": { en: "Requirements", ru: "Требования", de: "Anforderungen", sr: "Услови" },
            "documents.procedure": { en: "Application Procedure", ru: "Процедура Оформления", de: "Antragsverfahren", sr: "Процедура пријаве" },
            "documents.coming_soon": { en: "Detailed guide coming soon.", ru: "Подробное руководство скоро появится.", de: "Detaillierter Leitfaden wird bald verfügbar sein.", sr: "Детаљан водич ће ускоро бити доступан." },
      // Form page
      "form.title": { en: "University Admissions Planner", ru: "Планировщик поступления в университеты", de: "Universitäts-Zulassungsplaner", sr: "Планирач уписа на универзитетима" },
      "form.subtitle": { en: "Get your personalized admission plan with program recommendations in minutes", ru: "Получите персональный план поступления с рекомендациями программ за несколько минут", de: "Erhalten Sie Ihren persönlichen Zulassungsplan mit Programmvorschlägen in wenigen Minuten", sr: "Добијте персонализовани план уписа са препорукама програма за минуте" },
      "form.admissionType": { en: "Admission Type", ru: "Тип поступления", de: "Zulassungstyp", sr: "Тип уписа" },
      "form.selectAdmissionType": { en: "Select admission type", ru: "Выберите тип поступления", de: "Zulassungstyp auswählen", sr: "Изаберите тип уписа" },
      "form.targetCountries": { en: "Target Countries", ru: "Целевые страны", de: "Zielländer", sr: "Циљне земље" },
      "form.programs": { en: "Desired Programs/Fields", ru: "Желаемые программы/направления", de: "Gewünschte Programme/Bereiche", sr: "Жељени програми/области" },
      "form.selectPrograms": { en: "Select one or more fields of study", ru: "Выберите одно или несколько направлений обучения", de: "Wählen Sie ein oder mehrere Studienbereiche", sr: "Изаберите једну или више области студија" },
      "form.programLanguage": { en: "Program Language", ru: "Язык программы", de: "Programmsprache", sr: "Језик програма" },
      "form.selectProgramLanguage": { en: "Select program language", ru: "Выберите язык программы", de: "Programmsprache auswählen", sr: "Изаберите језик програма" },
      "form.programLanguageDesc": { en: "Choose if you want programs in English, local language, or both", ru: "Выберите, хотите ли вы программы на английском, местном языке или оба", de: "Wählen Sie, ob Sie Programme auf Englisch, Landessprache oder beide möchten", sr: "Изаберите да ли желите програме на енглеском, локалном језику или оба" },
      "form.englishPrograms": { en: "English-taught programs", ru: "Программы на английском языке", de: "Programme auf Englisch", sr: "Програми на енглеском језику" },
      "form.localPrograms": { en: "Local language programs", ru: "Программы на местном языке", de: "Programme in Landessprache", sr: "Програми на локалном језику" },
      "form.eitherLanguage": { en: "Either (English or Local)", ru: "Любой (английский или местный)", de: "Entweder (Englisch oder Landessprache)", sr: "Било који (енглески или локални)" },
      "form.grades": { en: "Grades / Academic Performance", ru: "Оценки / Академическая успеваемость", de: "Noten / Akademische Leistung", sr: "Оцене / Академски успех" },
      "form.gradesPlaceholder": { en: "e.g., 3.5 GPA, 85% average, A-levels: AAB", ru: "например, 3.5 GPA, 85% средний балл, A-levels: AAB", de: "z.B. 3,5 GPA, 85% Durchschnitt, A-Levels: AAB", sr: "нпр., 3.5 просек, 85% просек, A-levels: AAB" },
      "form.languageExam": { en: "Language Exam", ru: "Языковой экзамен", de: "Sprachprüfung", sr: "Језички испит" },
      "form.selectExam": { en: "Select exam", ru: "Выберите экзамен", de: "Prüfung auswählen", sr: "Изаберите испит" },
      "form.examScore": { en: "Exam Score (optional)", ru: "Балл экзамена (необязательно)", de: "Prüfungsergebnis (optional)", sr: "Резултат испита (опционо)" },
      "form.examScorePlaceholder": { en: "e.g., 7.5, 100", ru: "например, 7.5, 100", de: "z.B. 7,5, 100", sr: "нпр., 7.5, 100" },
      "form.budget": { en: "Budget", ru: "Бюджет", de: "Budget", sr: "Буџет" },
      "form.selectBudget": { en: "Select budget", ru: "Выберите бюджет", de: "Budget auswählen", sr: "Изаберите буџет" },
      "form.email": { en: "Email", ru: "Email", de: "E-Mail", sr: "Имејл" },
      "form.emailDesc": { en: "We'll send your results to this email", ru: "Мы отправим результаты на этот email", de: "Wir senden Ihnen die Ergebnisse an diese E-Mail", sr: "Послаћемо вам резултате на овај имејл" },
      "form.submit": { en: "🎓 Generate my admission plan", ru: "🎓 Сгенерировать мой план поступления", de: "🎓 Meinen Zulassungsplan generieren", sr: "🎓 Генериши мој план уписа" },
      "form.generating": { en: "Generating your plan...", ru: "Генерация вашего плана...", de: "Ihr Plan wird generiert...", sr: "Генерисање вашег плана..." },
      "form.accessLink": { en: "Already have a plan? Access it here", ru: "Уже есть план? Получить доступ здесь", de: "Haben Sie bereits einen Plan? Hier zugreifen", sr: "Већ имате план? Приступите му овде" },
      "form.error.unexpected": { en: "Unexpected response. Please try again.", ru: "Неожиданный ответ. Пожалуйста, попробуйте снова.", de: "Unerwartete Antwort. Bitte versuchen Sie es erneut.", sr: "Неочекиван одговор. Молимо покушајте поново." },
      // Access page
      "access.title": { en: "Access Your Plans", ru: "Доступ к вашим планам", de: "Zugriff auf Ihre Pläne", sr: "Приступите вашим плановима" },
      "access.subtitle": { en: "Enter your email to view your admission plans", ru: "Введите ваш email для просмотра планов поступления", de: "Geben Sie Ihre E-Mail ein, um Ihre Zulassungspläne anzuzeigen", sr: "Унесите ваш имејл за приказ ваших планова уписа" },
      "access.backHome": { en: "← Back to home", ru: "← Вернуться на главную", de: "← Zurück zur Startseite", sr: "← Назад на почетну" },
      "access.emailLabel": { en: "Email Address", ru: "Адрес электронной почты", de: "E-Mail-Adresse", sr: "Адреса имејла" },
      "access.viewPlans": { en: "View My Plans", ru: "Просмотреть мои планы", de: "Meine Pläne anzeigen", sr: "Погледај моје планове" },
      "access.loading": { en: "Loading...", ru: "Загрузка...", de: "Wird geladen...", sr: "Учитавање..." },
      "access.noPlans": { en: "No submissions found for this email address.", ru: "Для этого адреса электронной почты не найдено планов.", de: "Für diese E-Mail-Adresse wurden keine Pläne gefunden.", sr: "Нема пронађених поднешаја за ову адресу имејла." },
      "access.error": { en: "Failed to retrieve submissions. Please try again.", ru: "Не удалось получить планы. Пожалуйста, попробуйте снова.", de: "Pläne konnten nicht abgerufen werden. Bitte versuchen Sie es erneut.", sr: "Није успело преузимање поднешаја. Молимо покушајте поново." },
      "access.yourPlans": { en: "Your Plans", ru: "Ваши планы", de: "Ihre Pläne", sr: "Ваши планови" },
      "access.viewPlan": { en: "View Plan", ru: "Просмотреть план", de: "Plan anzeigen", sr: "Погледај план" },
      "access.universitiesRecommended": { en: "universities recommended", ru: "университетов рекомендовано", de: "Universitäten empfohlen", sr: "препоручених универзитета" },
      // Common
      "common.required": { en: "*", ru: "*", de: "*", sr: "*" },
      "common.select": { en: "Select", ru: "Выбрать", de: "Auswählen", sr: "Изабери" },
      "common.loading": { en: "Loading...", ru: "Загрузка...", de: "Wird geladen...", sr: "Учитавање..." },
      // Additional translations
      "university_finder.selected_countries": { en: "Selected countries", ru: "Выбранные страны", de: "Ausgewählte Länder", sr: "Одабране земље" },
      "housing.selected_countries": { en: "Selected countries", ru: "Выбранные страны", de: "Ausgewählte Länder", sr: "Одабране земље" },
      // Form section dividers  
      "form.section.basic_info": { en: "Basic Information", ru: "Основная информация", de: "Grundinformationen", sr: "Основне информације" },
      "form.section.preferences": { en: "Preferences", ru: "Предпочтения", de: "Präferenzen", sr: "Преференце" },
      "form.section.academic": { en: "Academic Background", ru: "Академическая подготовка", de: "Akademischer Hintergrund", sr: "Академска позадина" },
      "form.section.budget": { en: "Budget & Contact", ru: "Бюджет и контакты", de: "Budget & Kontakt", sr: "Буџет и контакт" },
      "form.undergraduate": { en: "Undergraduate degree", ru: "Бакалавриат", de: "Bachelor-Abschluss", sr: "Основне студије" },
      "form.graduate": { en: "Graduate degree", ru: "Магистратура", de: "Master-Abschluss", sr: "Мастер студије" },
      "form.budget.free": { en: "No tuition fees", ru: "Без платы за обучение", de: "Keine Studiengebühren", sr: "Без школарине" },
      "form.budget.per_year": { en: "per year", ru: "в год", de: "pro Jahr", sr: "годишње" },
      // Navigation
      "nav.housing": { en: "housing", ru: "жилье", de: "Unterkünfte", sr: "смештај" },
      "nav.essay_editor": { en: "essay editor", ru: "редактор эссе", de: "Aufsatz-Editor", sr: "уређивач есеја" },
      "nav.country_info": { en: "country info", ru: "информация о стране", de: "Länderinfo", sr: "информације о земљи" },
      "nav.documentation": { en: "documentation guide", ru: "руководство по документам", de: "Dokumentationsleitfaden", sr: "водич за документе" },
    };

    const translation = translations[key]?.[language] || key;
    return translation;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return context;
}
