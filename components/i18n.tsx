"use client"

import type React from "react"
import { createContext, useContext, useEffect, useMemo, useState } from "react"

type Lang = "en" | "ar"

type Dict = {
  nav: {
    home: string
    ask: string
    topics: string
    history: string
    qa: string
    login: string
    brand: string
    quiz: string
    leaderboard: string
    profile: string
    myQuestions: string
    logout: string
  }
  hero: {
    badge: string
    title: string
    desc: string
    ctaPrimary: string
    ctaSecondary: string
  }
  topics: { title: string; desc: string }
  topicsPage: { title: string; desc: string; clearFilters: string }
  ui: { searchPlaceholder: string; searchAria: string; noResults: string; back: string; openSearch: string }
  login: {
    title: string
    username: string
    usernamePh: string
    password: string
    passwordPh: string
    signIn: string
    signInWith: string
    or: string
    forgot: string
    signup: string
    success: string
  }
  qaPage: { title: string; desc: string; placeholder: string; ask: string; answer: string; empty: string }
  historyPage: { title: string; empty: string; clear: string; open: string }
  footer: { rights: (year: number) => string }
  questionTypes: {
    multiple_choice: string
    true_false: string
    code_snippet: string
    open_ended: string
    listening: string
    fill_in_blank: string
    match_pairs: string
    ordering: string
    math_equation: string
    graph_chart: string
    diagram_label: string
    image_mcq: string
  }
}

const en: Dict = {
  nav: {
    home: "Home",
    ask: "Ask Question",
    topics: "Topics",
  leaderboard: "Leaderboard",
  profile: "Profile",
    history: "History",
    qa: "Q&A",
    login: "Login",
    brand: "Answerly",
    quiz: "Quiz",
    myQuestions: "My Questions",
    logout: "Logout",
  },
  hero: {
    badge: "Ask. Answer. Grow together.",
    title: "A modern Q&A platform for curious minds",
    desc: "Ask questions, share knowledge, and help others—on a fast and friendly platform with elegant design and smooth interactions.",
    ctaPrimary: "Start Answering",
    ctaSecondary: "Ask a Question",
  },
  topics: { title: "Trending Topics", desc: "Explore popular areas people are discussing right now." },
  topicsPage: { title: "All Topics", desc: "Browse every topic and filter by tags.", clearFilters: "Clear filters" },
  ui: {
    searchPlaceholder: "Search...",
    searchAria: "Search",
    noResults: "No items found.",
    back: "Back",
    openSearch: "Search all topics",
  },
  login: {
    title: "Welcome back",
    username: "Email",
    usernamePh: "Enter your email",
    password: "Password",
    passwordPh: "Enter your password",
    signIn: "Sign in",
    signInWith: "Sign in with",
    or: "or",
    forgot: "Forgot password?",
    signup: "Create an account",
    success: "Signed in successfully!",
  },
  qaPage: {
    title: "Ask Questions, Get Answers",
    desc: "Submit your question and browse recent answers. This demo stores questions locally for now.",
    placeholder: "Type your question...",
    ask: "Ask",
    answer: "Answer",
    empty: "No questions yet. Be the first to ask!",
  },
  historyPage: {
    title: "Your History",
    empty: "No history yet. Ask a question to get started.",
    clear: "Clear history",
    open: "Revisit",
  },
  footer: { rights: (year) => `© ${year} Answerly. All rights reserved.` },
  questionTypes: {
    multiple_choice: "Multiple Choice",
    true_false: "True / False",
    code_snippet: "Code Snippet",
    open_ended: "Open Ended",
    listening: "Listening",
    fill_in_blank: "Fill in Blank",
    match_pairs: "Match Pairs",
    ordering: "Ordering",
    math_equation: "Math / Equation",
    graph_chart: "Graph / Chart",
    diagram_label: "Diagram Label",
    image_mcq: "Image MCQ",
  },
}

const ar: Dict = {
  nav: {
    home: "الرئيسية",
    ask: "اطرح سؤالاً",
    topics: "المواضيع",
  leaderboard: "لوحة المتصدرين",
  profile: "الملف",
    history: "السجل",
    qa: "الأسئلة والأجوبة",
    login: "تسجيل الدخول",
    brand: "Answerly",
    quiz: "اختبار",
    myQuestions: "أسئلتي",
    logout: "تسجيل الخروج",
  },
  hero: {
    badge: "اسأل. أجب. نتطور معاً.",
    title: "منصّة أسئلة وأجوبة حديثة للعقول الفضولية",
    desc: "اطرح الأسئلة وشارك المعرفة وساعد الآخرين—منصّة سريعة وودية بتصميم أنيق وتفاعلات سلسة.",
    ctaPrimary: "ابدأ بالإجابة",
    ctaSecondary: "اطرح سؤالاً",
  },
  topics: { title: "المواضيع الرائجة", desc: "استكشف أبرز المجالات التي يناقشها الآخرون الآن." },
  topicsPage: { title: "جميع المواضيع", desc: "تصفّح كل المواضيع وفلتر حسب الوسوم.", clearFilters: "مسح عوامل التصفية" },
  ui: {
    searchPlaceholder: "ابحث...",
    searchAria: "ابحث",
    noResults: "لا توجد نتائج.",
    back: "عودة",
    openSearch: "ابحث في جميع المواضيع",
  },
  login: {
    title: "مرحباً بعودتك",
    username: "اسم المستخدم",
    usernamePh: "أدخل اسم المستخدم",
    password: "كلمة المرور",
    passwordPh: "أدخل كلمة المرور",
    signIn: "تسجيل الدخول",
    signInWith: "تسجيل عبر",
    or: "أو",
    forgot: "هل نسيت كلمة المرور؟",
    signup: "إنشاء حساب",
    success: "تم تسجيل الدخول بنجاح!",
  },
  qaPage: {
    title: "اطرح الأسئلة واحصل على الإجابات",
    desc: "أرسل سؤالك وتصفّح الأسئلة. يتم حفظ الأسئلة محلياً في هذا العرض.",
    placeholder: "اكتب سؤالك...",
    ask: "أرسل",
    answer: "الإجابة",
    empty: "لا توجد أسئلة بعد. كن أول من يسأل!",
  },
  historyPage: { title: "سجلّك", empty: "لا يوجد سجل بعد. اطرح سؤالاً للبدء.", clear: "مسح السجل", open: "عرض" },
  footer: { rights: (year) => `© ${year} Answerly. جميع الحقوق محفوظة.` },
  questionTypes: {
    multiple_choice: "خيار من متعدد",
    true_false: "صح أو خطأ",
    code_snippet: "مقتطف برمجية",
    open_ended: "سؤال مفتوح",
    listening: "استماع",
    fill_in_blank: "ملء الفراغات",
    match_pairs: "مطابقة الأزواج",
    ordering: "ترتيب",
    math_equation: "معادلة رياضية",
    graph_chart: "رسم بياني",
    diagram_label: "تسمية المخطط",
    image_mcq: "خيار من متعدد مع صورة",
  },
}

type Ctx = { lang: Lang; setLang: (l: Lang) => void; dict: Dict; mounted: boolean }
const I18nContext = createContext<Ctx | null>(null)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en")
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])
  
  useEffect(() => {
    if (!mounted) return
    
    const stored = localStorage.getItem("lang") as Lang | null
    if (stored) setLangState(stored)
  }, [mounted])
  
  useEffect(() => {
    if (!mounted) return
    
    document.documentElement.lang = lang
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr"
    localStorage.setItem("lang", lang)
  }, [lang, mounted])
  
  const setLang = (l: Lang) => setLangState(l)
  const dict = lang === "ar" ? ar : en
  const value = useMemo(() => ({ lang, setLang, dict, mounted }), [lang, mounted])
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n() {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error("useI18n must be used within LanguageProvider")
  return ctx
}
