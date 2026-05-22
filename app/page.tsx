'use client'

import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Upload, MessageSquareText, Sparkles, ArrowRight } from 'lucide-react'

export default function Home() {
  const router = useRouter()

  const features = [
    {
      icon: Upload,
      title: 'Upload Any Source',
      description:
        'Add PDFs, notes, research papers, and documents instantly.',
    },
    {
      icon: MessageSquareText,
      title: 'Ask Questions Naturally',
      description:
        'Chat with your documents and get contextual answers in seconds.',
    },
    {
      icon: Sparkles,
      title: 'AI-Powered Insights',
      description:
        'Extract summaries, explanations, and key ideas effortlessly.',
    },
  ]

  return (
    <main className="min-h-screen bg-white text-black overflow-hidden">
      
      <section className="relative flex min-h-screen items-center justify-center px-6 py-20">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(0,0,0,0.06),transparent_45%)]" />

        <div className="mx-auto grid max-w-7xl items-center gap-16 lg:grid-cols-2">
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center lg:text-left"
          >
            <div className="mb-6 inline-flex items-center rounded-full border border-black/10 bg-black/5 px-4 py-2 text-sm font-medium backdrop-blur-sm">
              AI-powered Retrieval Augmented Generation
            </div>

            <h1 className="text-5xl font-semibold leading-tight tracking-tight sm:text-6xl md:text-7xl lg:text-8xl">
              Understand
              <span className="block">Anything.</span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-black/70 sm:text-xl lg:mx-0">
              Upload your documents and chat with them instantly. Get
              accurate answers, summaries, and insights directly from your
              own sources.
            </p>

            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row lg:items-start">
              <button
                onClick={() => router.push('/chat')}
                className="group flex items-center gap-2 rounded-2xl bg-black px-8 py-4 text-lg font-medium text-white transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl"
              >
                Try BookLLM
                <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
              </button>

              <button className="rounded-2xl border border-black/10 px-8 py-4 text-lg font-medium transition-all duration-300 hover:bg-black hover:text-white">
                Learn More
              </button>
            </div>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-sm text-black/60 lg:justify-start">
              <div>⚡ Instant responses</div>
              <div>🔒 Private & secure</div>
              <div>📚 Multi-document support</div>
            </div>
          </motion.div>

          
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7 }}
            className="relative"
          >
            <div className="relative rounded border border-black/10 bg-white p-4 shadow-2xl">
              <div className="rounded bg-black p-6 text-white">
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <p className="text-lg font-semibold">Research Assistant</p>
                    <p className="text-sm text-white/70">
                      Ask questions about your files
                    </p>
                  </div>

                  <div className="rounded-full bg-white/10 px-3 py-1 text-sm">
                    Live AI
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="rounded-2xl bg-white/10 p-4">
                    <p className="text-sm text-white/70">User</p>
                    <p className="mt-1">
                      Summarize the key findings from the uploaded report.
                    </p>
                  </div>

                  <div className="rounded-2xl bg-white p-4 text-black">
                    <p className="text-sm text-black/60">BookLLM</p>
                    <p className="mt-1 leading-relaxed">
                      The report highlights a 34% increase in efficiency after
                      implementing AI-assisted workflows across teams.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute -bottom-8 -left-8 hidden rounded-3xl border border-black/10 bg-white p-5 shadow-xl md:block">
              <p className="text-sm text-black/50">Documents indexed</p>
              <p className="mt-1 text-3xl font-semibold">12,430+</p>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="px-6 pb-24">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-black/50">
              Features
            </p>
            <h2 className="mt-4 text-4xl font-semibold sm:text-5xl">
              Your AI-powered research partner
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => {
              const Icon = feature.icon

              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="rounded-3xl border border-black/10 bg-white p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-black text-white">
                    <Icon className="h-7 w-7" />
                  </div>

                  <h3 className="text-2xl font-semibold">{feature.title}</h3>

                  <p className="mt-3 leading-relaxed text-black/65">
                    {feature.description}
                  </p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>
    </main>
  )
}
