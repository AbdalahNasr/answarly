export type Localized<T> = { en: T; ar: T }

export type Topic = {
  slug: string
  title: Localized<string>
  description: Localized<string>
  content: Localized<string>
  tags: string[]
}

const topics: Topic[] = [
  {
    slug: "web-development",
    title: { en: "Web Development", ar: "تطوير الويب" },
    description: {
      en: "Next.js, React, TypeScript, performance tips.",
      ar: "Next.js وReact وTypeScript ونصائح الأداء.",
    },
    content: {
      en: "Full content for Web Development. Patterns, performance techniques, and examples.",
      ar: "المحتوى الكامل لموضوع تطوير الويب. الأنماط وتقنيات الأداء والأمثلة.",
    },
    tags: ["nextjs", "react", "typescript"],
  },
  {
    slug: "ai-ml",
    title: { en: "AI & ML", ar: "الذكاء الاصطناعي وتعلم الآلة" },
    description: { en: "LLMs, prompt engineering, vector search.", ar: "نماذج اللغة، هندسة الموجهات، البحث المتجهي." },
    content: {
      en: "Full content for AI & ML. Model selection, evaluation, and integration.",
      ar: "المحتوى الكامل للذكاء الاصطناعي وتعلم الآلة. اختيار النماذج وتقييمها ودمجها.",
    },
    tags: ["llms", "ai", "ml"],
  },
  {
    slug: "best-practices",
    title: { en: "Best Practices", ar: "أفضل الممارسات" },
    description: {
      en: "Security, accessibility, testing, DX.",
      ar: "الأمان وإمكانية الوصول والاختبارات وتجربة المطور.",
    },
    content: {
      en: "Full content for Best Practices. Security, a11y, testing strategies, DX.",
      ar: "المحتوى الكامل لأفضل الممارسات. الأمان وإمكانية الوصول واستراتيجيات الاختبار وتجربة المطور.",
    },
    tags: ["security", "a11y", "testing"],
  },
  {
    slug: "product-design",
    title: { en: "Product Design", ar: "تصميم المنتجات" },
    description: {
      en: "UX patterns, micro-interactions, motion.",
      ar: "أنماط تجربة المستخدم، التفاعلات الدقيقة، الحركة.",
    },
    content: {
      en: "Full content for Product Design. UX patterns and motion principles.",
      ar: "المحتوى الكامل لتصميم المنتجات. أنماط تجربة المستخدم ومبادئ الحركة.",
    },
    tags: ["ux", "design", "motion"],
  },
  {
    slug: "devops-cloud",
    title: { en: "DevOps & Cloud", ar: "عمليات التطوير والسحابة" },
    description: { en: "CI/CD, serverless, observability.", ar: "CI/CD والحوسبة عديمة الخادم والمراقبة." },
    content: {
      en: "Full content for DevOps & Cloud. Pipelines, serverless, and monitoring.",
      ar: "المحتوى الكامل لعمليات التطوير والسحابة. خطوط الأنابيب والحوسبة عديمة الخادم والمراقبة.",
    },
    tags: ["devops", "serverless", "observability"],
  },
  {
    slug: "beginner-questions",
    title: { en: "Beginner Questions", ar: "أسئلة المبتدئين" },
    description: { en: "Foundations, guides, getting started.", ar: "الأساسيات والإرشادات والبدايات." },
    content: {
      en: "Full content for Beginner Questions. Foundations and first steps.",
      ar: "المحتوى الكامل لأسئلة المبتدئين. الأساسيات وأولى الخطوات.",
    },
    tags: ["beginners", "guides", "start"],
  },
]

export function getAllTopics() {
  return topics
}
export function getAllTopicSlugs() {
  return topics.map((t) => t.slug)
}
export function getTopicBySlug(slug: string) {
  return topics.find((t) => t.slug === slug)
}
