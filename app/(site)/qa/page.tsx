"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle2 } from "lucide-react"
import AddQuestionForm from "@/components/add-question-form"
import Reveal from "@/components/reveal"
import { DebugPageListeners } from "@/hooks/use-debug"

export default function CreateQuestionPage() {
  const [justAdded, setJustAdded] = useState(false)

  return (
    <main>
      {/* Toggle with Alt+D or ?debug=1, then run window.AnswerlyDebug.report() */}
      <DebugPageListeners page="qa-add-question" />
      <section className="w-full">
        <div className="container mx-auto px-4 md:px-6 py-16 md:py-20">
          <Reveal>
            <div className="max-w-3xl">
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                {"Create a Question"}
              </h1>
              <p className="mt-2 text-zinc-600 dark:text-zinc-400">
                {
                  "Use the form below to add a new question. Choose a category (or create one), select a difficulty, and provide the question details."
                }
              </p>
            </div>
          </Reveal>

          <div className="mt-6 max-w-3xl">
            {justAdded && (
              <Alert className="mb-6 rounded-2xl border-white/60 dark:border-white/10 bg-white/90 dark:bg-white/5">
                <CheckCircle2 className="h-4 w-4" />
                <AlertTitle>{"Saved"}</AlertTitle>
                <AlertDescription>{"Your question was added successfully."}</AlertDescription>
              </Alert>
            )}

            <Card className="relative overflow-hidden rounded-2xl bg-white/90 dark:bg-white/5 border-white/60 dark:border-white/10 shadow-sm">
              {/* Ensure overlay sits behind content */}
              <span className="pointer-events-none absolute -inset-1 -z-10 opacity-0 sm:opacity-100 bg-gradient-to-br from-fuchsia-500/10 via-indigo-500/10 to-pink-500/10" />
              <CardHeader className="relative">
                <CardTitle className="text-xl">{"Question Details"}</CardTitle>
              </CardHeader>
              <CardContent className="relative">
                <AddQuestionForm onAdded={() => setJustAdded(true)} />
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </main>
  )
}
