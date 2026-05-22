'use client'

import { useRef, useState } from 'react'
import {
  Send,
  Upload,
  FileText,
  Sparkles,
  PanelLeft,
} from 'lucide-react'
import ReactMarkdown from 'react-markdown'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content:
        'Upload a PDF and start asking questions about it.',
    },
  ])

  const [input, setInput] = useState('')
  const [fileName, setFileName] = useState('')
  const [loading, setLoading] =
    useState<boolean>(false)

  const [uploading, setUploading] =
    useState<boolean>(false)

  const [sidebarOpen, setSidebarOpen] =
    useState<boolean>(true)

  const fileInputRef =
    useRef<HTMLInputElement | null>(null)

  const handleSend = async () => {
    if (!input.trim()) return

    const userMessage: Message = {
      role: 'user',
      content: input,
    }

    setMessages((prev) => [...prev, userMessage])

    setInput('')
    setLoading(true)

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/query?q=${encodeURIComponent(
          input
        )}`
      )

      const result = await response.json()

      const aiMessage: Message = {
        role: 'assistant',
        content: result.answer,
      }

      setMessages((prev) => [...prev, aiMessage])
    } catch (e) {
      console.log(e)
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    try {
      setUploading(true)

      const file = event.target.files?.[0]

      if (!file) return

      setFileName(file.name)

      const formData = new FormData()

      formData.append('file', file)

      await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/upload`,
        {
          method: 'POST',
          body: formData,
        }
      )
    } catch (e) {
      console.log(e)
    } finally {
      setUploading(false)
    }
  }

  return (
    <main className="flex h-screen overflow-hidden bg-[#F5F7FB] text-[#111827]">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm lg:hidden"
          onClick={() =>
            setSidebarOpen(false)
          }
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`
          ${
            sidebarOpen
              ? 'w-75 opacity-100'
              : 'w-0 opacity-0 lg:w-22 lg:opacity-100'
          }

          fixed left-0 top-0 z-50
          flex h-screen flex-col
          overflow-hidden
          border-r border-black/6
          bg-white/80
          backdrop-blur-xl
          transition-all duration-300

          lg:relative
        `}
      >
        {/* HEADER */}
        <div className="border-b border-black/6 px-5 py-5">
          <div
            className={`flex items-center ${
              sidebarOpen
                ? 'justify-between'
                : 'justify-center'
            }`}
          >
            {sidebarOpen ? (
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-[20px] bg-linear-to-br from-black to-neutral-700 text-white shadow-lg">
                  <Sparkles className="h-5 w-5" />
                </div>

                <div>
                  <h1 className="text-[18px] font-semibold tracking-[-0.03em]">
                    BookLLM
                  </h1>

                  <p className="text-sm text-[#6B7280]">
                    Notebook Workspace
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-[20px] bg-linear-to-br from-black to-neutral-700 text-white shadow-lg">
                <Sparkles className="h-5 w-5" />
              </div>
            )}

            {sidebarOpen && (
          <button
            onClick={() =>
              setSidebarOpen(!sidebarOpen)
            }
            className="
              hidden lg:flex
              h-10 w-10
              items-center justify-center
              rounded-xl
              border border-black/6
              bg-white
              transition-all duration-200
              hover:bg-[#F9FAFB]
            "
          >
            <PanelLeft className="h-4 w-4" />
          </button>
        )}
          </div>
        </div>

        {/* CONTENT */}
        <div className="flex flex-1 flex-col overflow-y-auto p-4">
          {sidebarOpen ? (
            <>
              {/* SOURCES */}
              <div>
                <p className="mb-3 text-xs font-medium uppercase tracking-[0.14em] text-[#9CA3AF]">
                  Sources
                </p>

                <button
                  onClick={() =>
                    fileInputRef.current?.click()
                  }
                  className="
                    flex w-full items-center justify-center gap-2
                    rounded-2xl bg-[#111827]
                    px-4 py-3 text-sm font-medium text-white
                    shadow-[0_8px_30px_rgba(0,0,0,0.08)]
                    transition-all duration-200
                    hover:scale-[1.01]
                    hover:bg-black
                    active:scale-[0.98]
                  "
                >
                  <Upload className="h-4 w-4" />

                  {uploading
                    ? 'Uploading...'
                    : 'Upload PDF'}
                </button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </div>

              {/* FILE CARD */}
              {fileName && (
                <div
                  className="
                    mt-6 rounded-[24px]
                    border border-black/6
                    bg-white/90 p-4
                    shadow-[0_4px_20px_rgba(0,0,0,0.04)]
                    transition-all duration-200
                    hover:-translate-y-px
                    hover:shadow-md
                  "
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#F3F4F6]">
                      <FileText className="h-5 w-5 text-[#4B5563]" />
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-[#111827]">
                        {fileName}
                      </p>

                      <p className="mt-1 text-xs text-[#6B7280]">
                        Ready for chat
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* QUICK ACTIONS */}
              <div className="mt-10">
                <p className="mb-3 text-xs font-medium uppercase tracking-[0.14em] text-[#9CA3AF]">
                  Suggested
                </p>

                <div className="space-y-2">
                  {[
                    'Summarize this PDF',
                    'Explain key concepts',
                    'Generate notes',
                    'Find insights',
                  ].map((item) => (
                    <button
                      key={item}
                      onClick={() =>
                        setInput(item)
                      }
                      className="
                        w-full rounded-2xl
                        bg-white/60 px-4 py-3
                        text-left text-sm text-[#374151]
                        transition-all duration-200
                        hover:bg-white
                      "
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <>
              {/* COLLAPSED SIDEBAR */}
              <div className="flex flex-col items-center gap-4 pt-2">
                <button
                  onClick={() =>
                    setSidebarOpen(true)
                  }
                  className="
                    flex h-12 w-12 items-center justify-center
                    rounded-2xl bg-[#111827]
                    text-white
                    shadow-lg
                    transition-all duration-200
                    hover:scale-[1.05]
                  "
                >
                  <PanelLeft className="h-4 w-4" />
                </button>

                <button
                  onClick={() =>
                    fileInputRef.current?.click()
                  }
                  className="
                    flex h-12 w-12 items-center justify-center
                    rounded-2xl border border-black/6
                    bg-white
                    transition-all duration-200
                    hover:bg-[#F9FAFB]
                  "
                >
                  <Upload className="h-4 w-4" />
                </button>

                {fileName && (
                  <div
                    className="
                      flex h-12 w-12 items-center justify-center
                      rounded-2xl border border-black/6
                      bg-white
                    "
                  >
                    <FileText className="h-4 w-4 text-[#4B5563]" />
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </aside>

      {/* MAIN */}
      <section className="flex flex-1 flex-col">
        {/* TOPBAR */}
        <header
          className="
            flex h-16 items-center justify-between
            border-b border-black/6
            bg-white/70 px-5 backdrop-blur-xl
            lg:px-8
          "
        >
          <div className="flex items-center gap-3">
            {/* MOBILE SIDEBAR BUTTON */}
            <button
              onClick={() =>
                setSidebarOpen(!sidebarOpen)
              }
              className="
                flex h-10 w-10 items-center justify-center
                rounded-xl border border-black/6
                bg-white transition-all duration-200
                hover:bg-[#F9FAFB]
                lg:hidden
              "
            >
              <PanelLeft className="h-4 w-4" />
            </button>

            <div>
              <h2 className="text-sm font-semibold">
                AI Workspace
              </h2>

              <p className="text-xs text-[#6B7280]">
                Research your documents
              </p>
            </div>
          </div>
        </header>

        {/* CHAT */}
        <div className="flex-1 overflow-y-auto">
          <div className="mx-auto flex w-full max-w-5xl flex-col px-6 py-10 lg:px-14">
            {/* EMPTY STATE */}
            {messages.length === 1 && (
              <div className="flex flex-1 flex-col items-center justify-center pt-24">
                <div
                  className="
                    mb-8 flex h-24 w-24
                    items-center justify-center
                    rounded-[32px]
                    bg-white/90
                    shadow-[0_10px_40px_rgba(0,0,0,0.06)]
                    backdrop-blur-xl
                  "
                >
                  <Sparkles className="h-10 w-10 text-[#111827]" />
                </div>

                <div className="max-w-2xl text-center">
                  <h1
                    className="
                      text-[42px] font-semibold
                      leading-12
                      tracking-[-0.03em]
                      text-[#111827]
                    "
                  >
                    Upload PDFs and ask anything
                  </h1>

                  <p className="mt-5 text-[16px] leading-8 text-[#6B7280]">
                    Notebook-style AI workspace for
                    researching documents, generating
                    summaries, and chatting naturally
                    with your files.
                  </p>
                </div>

                {/* QUICK PROMPTS */}
                <div className="mt-10 flex flex-wrap justify-center gap-3">
                  {[
                    'Summarize this document',
                    'Explain this simply',
                    'Generate study notes',
                    'Find important insights',
                  ].map((item) => (
                    <button
                      key={item}
                      onClick={() =>
                        setInput(item)
                      }
                      className="
                        rounded-2xl
                        border border-black/6
                        bg-white/80
                        px-5 py-3
                        text-sm font-medium
                        text-[#374151]
                        shadow-sm
                        transition-all duration-200
                        hover:-translate-y-px
                        hover:bg-white
                        hover:shadow-md
                      "
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* MESSAGES */}
            <div className="space-y-8">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`
                    flex animate-in fade-in
                    slide-in-from-bottom-2 duration-300

                    ${
                      message.role === 'user'
                        ? 'justify-end'
                        : 'justify-start'
                    }
                  `}
                >
                  <div
                    className={`
                      max-w-3xl px-6 py-5

                      ${
                        message.role === 'user'
                          ? `
                            rounded-[26px]
                            bg-[#111827]
                            text-white
                            shadow-[0_8px_30px_rgba(0,0,0,0.12)]
                          `
                          : `
                            rounded-[28px]
                            border border-black/5
                            bg-white/90
                            text-[#111827]
                            backdrop-blur-sm
                            shadow-[0_2px_12px_rgba(0,0,0,0.04)]
                          `
                      }
                    `}
                  >
                    <article
                      className={`prose prose-sm max-w-none ${
                        message.role === 'user'
                          ? 'prose-invert'
                          : ''
                      }`}
                    >
                      <ReactMarkdown>
                        {message.content}
                      </ReactMarkdown>
                    </article>
                  </div>
                </div>
              ))}

              {/* LOADING */}
              {loading && (
                <div className="flex justify-start">
                  <div
                    className="
                      rounded-[28px]
                      border border-black/5
                      bg-white/90
                      px-6 py-5
                      shadow-[0_2px_12px_rgba(0,0,0,0.04)]
                    "
                  >
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 animate-bounce rounded-full bg-[#9CA3AF]" />

                      <div className="h-2 w-2 animate-bounce rounded-full bg-[#9CA3AF] [animation-delay:120ms]" />

                      <div className="h-2 w-2 animate-bounce rounded-full bg-[#9CA3AF] [animation-delay:240ms]" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* INPUT */}
        <div className="px-4 pb-6 pt-4 lg:px-8">
          <div
            className="
              mx-auto flex max-w-5xl items-end gap-3
              rounded-[30px]
              border border-black/6
              bg-white/80
              px-5 py-4
              backdrop-blur-xl
              shadow-[0_8px_30px_rgba(0,0,0,0.06)]
              transition-all duration-200
              focus-within:shadow-[0_10px_40px_rgba(0,0,0,0.08)]
            "
          >
            <textarea
              rows={1}
              value={input}
              onChange={(e) =>
                setInput(e.target.value)
              }
              onKeyDown={(e) => {
                if (
                  e.key === 'Enter' &&
                  !e.shiftKey
                ) {
                  e.preventDefault()
                  handleSend()
                }
              }}
              placeholder="Ask questions about your PDF..."
              className="
                max-h-55 min-h-6
                flex-1 resize-none
                bg-transparent
                text-[15px]
                leading-7
                text-[#111827]
                outline-none
                placeholder:text-[#9CA3AF]
              "
            />

            <button
              onClick={handleSend}
              className="
                flex h-11 w-11 items-center justify-center
                rounded-2xl
                bg-[#111827]
                text-white
                shadow-lg
                transition-all duration-200
                hover:scale-[1.03]
                hover:bg-black
                active:scale-[0.98]
              "
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>
    </main>
  )
}