import { notFound } from "next/navigation"
import { getTopicBySlug, getAllTopicSlugs } from "@/lib/topics"
import TopicDetail from "@/components/topic-detail"

// Pre-render all topics
export function generateStaticParams() {
  return getAllTopicSlugs().map((slug) => ({ slug }))
}

export default function TopicPage({ params }: { params: { slug: string } }) {
  const { slug } = params
  const topic = getTopicBySlug(slug)
  if (!topic) notFound()
  return <TopicDetail topic={topic} />
}
