'use client'
import { signIn, signOut, useSession } from "next-auth/react"
import { useEffect, useRef, useState } from 'react'
import {
  Send,
  Upload,
  FileText,
  Sparkles,
  PanelLeft,
  Check,
  BookOpen,
  X,
  ChevronRight,
} from 'lucide-react'
import ReactMarkdown from 'react-markdown'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Citation {
  document_name: string
  source: string
  page: number
  chunk_id: string
  chunk_index_in_page: number
  text: string
}

interface CitationMap {
  [key: string]: Citation
}

interface Message {
  role: 'user' | 'assistant'
  content: string
  citations?: CitationMap   // only on assistant messages
}

// ─── Citation Popup ────────────────────────────────────────────────────────────

function CitationPopup({
  citation,
  index,
  onClose,
}: {
  citation: Citation
  index: string
  onClose: () => void
}) {
  return (
    <div
      className="
        fixed inset-0 z-50 flex items-end justify-center
        bg-black/20 backdrop-blur-sm
        sm:items-center
      "
      onClick={onClose}
    >
      <div
        className="
          w-full max-w-lg
          rounded-t-[28px] sm:rounded-[28px]
          border border-black/8
          bg-white/95 backdrop-blur-xl
          p-6 shadow-2xl
        "
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 text-xs font-bold text-amber-700">
              {index}
            </div>
            <div>
              <p className="text-sm font-semibold text-[#111827]">
                {citation.document_name}
              </p>
              <p className="text-xs text-[#6B7280]">
                Page {citation.page + 1}
                {citation.chunk_index_in_page !== undefined &&
                  ` · Chunk ${citation.chunk_index_in_page + 1}`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-xl border border-black/6 bg-[#F9FAFB] hover:bg-[#F3F4F6]"
          >
            <X className="h-4 w-4 text-[#6B7280]" />
          </button>
        </div>

        {/* Excerpt */}
        <div className="rounded-2xl bg-amber-50 border border-amber-100 p-4">
          <p className="text-[13px] leading-6 text-[#374151]">
            {citation.text}
          </p>
        </div>

        {/* Source path */}
        <p className="mt-3 text-[11px] text-[#9CA3AF] font-mono">
          {citation.source}
        </p>
      </div>
    </div>
  )
}

// ─── Inline citation chip rendered inside assistant messages ──────────────────

function CitationChip({
  index,
  citation,
}: {
  index: string
  citation: Citation
}) {
  const [hovered, setHovered] = useState(false)

  return (
    <span
      className="relative inline-block align-super mx-0.5"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <span
        className="
          inline-flex h-5 min-w-5 items-center justify-center
          rounded-full bg-amber-100
          px-1.5 text-[10px] font-bold text-amber-700
          border border-amber-200
          cursor-pointer leading-none
          transition-all duration-150
          hover:bg-amber-200 hover:scale-110
        "
      >
        {index}
      </span>

      {/* Hover tooltip */}
      {hovered && (
        <span
          className="
            absolute bottom-full left-1/2 z-50 mb-2
            w-72 -translate-x-1/2
            rounded-2xl border border-black/8
            bg-white/95 backdrop-blur-xl
            p-4 shadow-xl
            pointer-events-none
          "
        >
          {/* Arrow */}
          <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 h-3 w-3 rotate-45 bg-white border-r border-b border-black/8 block" />

          <span className="flex items-center gap-2 mb-2">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-100 text-[9px] font-bold text-amber-700 flex-shrink-0">
              {index}
            </span>
            <span className="text-[12px] font-semibold text-[#111827] truncate">
              {citation.document_name}
            </span>
            <span className="ml-auto text-[10px] text-[#9CA3AF] flex-shrink-0">
              p.{citation.page + 1}
            </span>
          </span>

          <span className="block rounded-xl bg-amber-50 border border-amber-100 px-3 py-2">
            <span className="text-[11px] leading-5 text-[#374151] line-clamp-4 block">
              {citation.text}
            </span>
          </span>
        </span>
      )}
    </span>
  )
}

// ─── Parse assistant content and inject citation chips ────────────────────────
// The backend wraps citations like [1], [2] in the answer text.
// This component finds those patterns and replaces them with interactive chips.

function AssistantMessage({
  content,
  citations,
}: {
  content: string
  citations?: CitationMap
}) {
  if (!citations || Object.keys(citations).length === 0) {
    return (
      <article className="prose prose-sm max-w-none">
        <ReactMarkdown>{content}</ReactMarkdown>
      </article>
    )
  }

  // Match [CITATION_ID:N] markers from the backend
  const parts = content.split(/(\[CITATION_ID:\d+\])/g)

  // Deduplicate: track rendered citation IDs per render pass
  const rendered = new Set<string>()

  return (
    <article className="prose prose-sm max-w-none">
      <p className="leading-7 text-[15px]">
        {parts.map((part, i) => {
          const match = part.match(/^\[CITATION_ID:(\d+)\]$/)
          if (match) {
            const idx = match[1]
            if (rendered.has(idx)) return null  // skip duplicate markers
            rendered.add(idx)
            if (citations[idx]) {
              return (
                <CitationChip
                  key={i}
                  index={idx}
                  citation={citations[idx]}
                />
              )
            }
          }
          return <span key={i}>{part}</span>
        })}
      </p>
    </article>
  )
}

// ─── Sources Panel (right drawer) ─────────────────────────────────────────────

function CitationsPanel({
  citations,
  onSelect,
  onClose,
}: {
  citations: CitationMap
  onSelect: (idx: string) => void
  onClose: () => void
}) {
  const entries = Object.entries(citations)
  if (entries.length === 0) return null

  return (
    <aside
      className="
        hidden lg:flex flex-col
        w-72 border-l border-black/6
        bg-white/80 backdrop-blur-xl
      "
    >
      <div className="flex items-center justify-between border-b border-black/6 px-5 py-4">
        <div className="flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-[#6B7280]" />
          <p className="text-sm font-semibold text-[#111827]">Sources</p>
        </div>
        <button
          onClick={onClose}
          className="flex h-8 w-8 items-center justify-center rounded-xl hover:bg-[#F9FAFB]"
        >
          <X className="h-4 w-4 text-[#9CA3AF]" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {entries.map(([idx, citation]) => (
          <button
            key={idx}
            onClick={() => onSelect(idx)}
            className="
              w-full text-left
              rounded-2xl border border-black/6
              bg-white/90 p-4
              shadow-[0_2px_8px_rgba(0,0,0,0.04)]
              transition-all duration-200
              hover:-translate-y-px hover:shadow-md
            "
          >
            <div className="flex items-start gap-3">
              <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-amber-100 text-[11px] font-bold text-amber-700">
                {idx}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-[#111827]">
                  {citation.document_name}
                </p>
                <p className="mt-0.5 text-xs text-[#6B7280]">
                  Page {citation.page + 1}
                </p>
                <p className="mt-2 line-clamp-3 text-xs leading-5 text-[#374151]">
                  {citation.text}
                </p>
              </div>
              <ChevronRight className="h-4 w-4 flex-shrink-0 text-[#D1D5DB]" />
            </div>
          </button>
        ))}
      </div>
    </aside>
  )
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function Chat() {
  const { data: session } = useSession()

  const [sources, setSources] = useState<string[]>([])
  const [selected, setSelected] = useState<string[]>([])
  const [activeCitations, setActiveCitations] = useState<CitationMap>({})
  const [selectedCitationIdx, setSelectedCitationIdx] = useState<string | null>(null)

  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Upload a PDF and start asking questions about it.',
    },
  ])

  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [citationsPanelOpen, setCitationsPanelOpen] = useState(false)

  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const messagesEndRef = useRef<HTMLDivElement | null>(null)

  // Restore sources from localStorage on mount
  useEffect(() => {
    const storedSources = localStorage.getItem('sources')
    if (storedSources) {
      setSources(JSON.parse(storedSources))
    }
  }, [])

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const toggleSource = (source: string) => {
    setSelected((prev) =>
      prev.includes(source) ? prev.filter((s) => s !== source) : [...prev, source]
    )
  }

  const handleSend = async () => {
    if (!input.trim()) return

    if (selected.length === 0) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Please select at least one source to query from.' },
      ])
      return
    }

    const userMessage: Message = { role: 'user', content: input }
    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setLoading(true)

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.accessToken}`,
        },
        body: JSON.stringify({ query: input, sources: selected }),
      })

      const result = await response.json()
      // result shape: { answer: string, citations: { "1": {...}, "2": {...} } }

      const newCitations: CitationMap = result.citations ?? {}

      const aiMessage: Message = {
        role: 'assistant',
        content: result.answer,
        citations: newCitations,
      }

      setMessages((prev) => [...prev, aiMessage])
      setActiveCitations(newCitations)

      // Auto-open the citations panel if there are any
      if (Object.keys(newCitations).length > 0) {
        setCitationsPanelOpen(true)
      }
    } catch (e) {
      console.error(e)
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Something went wrong. Please try again.' },
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true)
      const file = event.target.files?.[0]
      if (!file) return

      const formData = new FormData()
      formData.append('file', file)

      await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/upload`, {
        method: 'POST',
        body: formData,
        headers: { Authorization: `Bearer ${session?.accessToken}` },
      })

      const updated = [...sources, file.name]
      setSources(updated)
      setSelected((prev) => [...prev, file.name]) // auto-select new uploads
      localStorage.setItem('sources', JSON.stringify(updated))
    } catch (e) {
      console.error(e)
    } finally {
      setUploading(false)
      // Reset file input so the same file can be re-uploaded
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const openCitationPopup = (idx: string) => {
    setSelectedCitationIdx(idx)
  }

  return (
    <main className="flex h-screen overflow-hidden bg-[#F5F7FB] text-[#111827]">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── SIDEBAR ── */}
      <aside
        className={`
          ${sidebarOpen ? 'w-75 opacity-100' : 'w-0 opacity-0 lg:w-22 lg:opacity-100'}
          fixed left-0 top-0 z-50
          flex h-screen flex-col overflow-hidden
          border-r border-black/6 bg-white/80 backdrop-blur-xl
          transition-all duration-300
          lg:relative
        `}
      >
        {/* Sidebar header */}
        <div className="border-b border-black/6 px-5 py-5">
          <div className={`flex items-center ${sidebarOpen ? 'justify-between' : 'justify-center'}`}>
            {sidebarOpen ? (
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-[20px] bg-gradient-to-br from-black to-neutral-700 text-white shadow-lg">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <h1 className="text-[18px] font-semibold tracking-[-0.03em]">BookLLM</h1>
                  <p className="text-sm text-[#6B7280]">Notebook Workspace</p>
                </div>
              </div>
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-[20px] bg-gradient-to-br from-black to-neutral-700 text-white shadow-lg">
                <Sparkles className="h-5 w-5" />
              </div>
            )}
            {sidebarOpen && (
              <button
                onClick={() => setSidebarOpen(false)}
                className="hidden lg:flex h-10 w-10 items-center justify-center rounded-xl border border-black/6 bg-white transition-all duration-200 hover:bg-[#F9FAFB]"
              >
                <PanelLeft className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Sidebar content */}
        <div className="flex flex-1 flex-col overflow-y-auto p-4">
          {sidebarOpen ? (
            <>
              {/* Sources section */}
              <div>
                <p className="mb-3 text-xs font-medium uppercase tracking-[0.14em] text-[#9CA3AF]">
                  Sources
                </p>

                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="
                    flex w-full items-center justify-center gap-2
                    rounded-2xl bg-[#111827] px-4 py-3
                    text-sm font-medium text-white
                    shadow-[0_8px_30px_rgba(0,0,0,0.08)]
                    transition-all duration-200
                    hover:scale-[1.01] hover:bg-black
                    active:scale-[0.98]
                    disabled:opacity-60
                  "
                >
                  <Upload className="h-4 w-4" />
                  {uploading ? 'Uploading…' : 'Upload PDF'}
                </button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </div>

              {/* Source cards */}
              {sources.length > 0 && (
                <div className="mt-4 space-y-2">
                  {sources.map((source, index) => {
                    const isSelected = selected.includes(source)
                    return (
                      <button
                        key={index}
                        onClick={() => toggleSource(source)}
                        className="
                          w-full text-left
                          rounded-[24px] border border-black/6
                          bg-white/90 p-4
                          shadow-[0_4px_20px_rgba(0,0,0,0.04)]
                          transition-all duration-200
                          hover:-translate-y-px hover:shadow-md
                        "
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#F3F4F6]">
                            <FileText className="h-5 w-5 text-[#4B5563]" />
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-[#111827]">
                              {source}
                            </p>
                            <p className="mt-1 text-xs text-[#6B7280]">
                              {isSelected ? 'Selected' : 'Click to select'}
                            </p>
                          </div>

                          {/* Checkbox */}
                          <div
                            className={`
                              ml-auto flex h-5 w-5 flex-shrink-0 items-center justify-center
                              rounded-full border transition-all duration-200
                              ${isSelected
                                ? 'bg-[#111827] border-[#111827]'
                                : 'border-[#D1D5DB]'
                              }
                            `}
                          >
                            {isSelected && <Check className="h-3 w-3 text-white" />}
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}

              {/* Quick prompts */}
              <div className="mt-8">
                <p className="mb-3 text-xs font-medium uppercase tracking-[0.14em] text-[#9CA3AF]">
                  Suggested
                </p>
                <div className="space-y-2">
                  {['Summarize this PDF', 'Explain key concepts', 'Generate notes', 'Find insights'].map(
                    (item) => (
                      <button
                        key={item}
                        onClick={() => setInput(item)}
                        className="w-full rounded-2xl bg-white/60 px-4 py-3 text-left text-sm text-[#374151] transition-all duration-200 hover:bg-white"
                      >
                        {item}
                      </button>
                    )
                  )}
                </div>
              </div>
            </>
          ) : (
            /* Collapsed sidebar icons */
            <div className="flex flex-col items-center gap-4 pt-2">
              <button
                onClick={() => setSidebarOpen(true)}
                className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#111827] text-white shadow-lg transition-all duration-200 hover:scale-[1.05]"
              >
                <PanelLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex h-12 w-12 items-center justify-center rounded-2xl border border-black/6 bg-white transition-all duration-200 hover:bg-[#F9FAFB]"
              >
                <Upload className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* ── MAIN ── */}
      <section className="flex flex-1 flex-col overflow-hidden">
        {/* Topbar */}
        <header className="flex h-16 items-center justify-between border-b border-black/6 bg-white/70 px-5 backdrop-blur-xl lg:px-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-black/6 bg-white transition-all duration-200 hover:bg-[#F9FAFB] lg:hidden"
            >
              <PanelLeft className="h-4 w-4" />
            </button>
            <div>
              <h2 className="text-sm font-semibold">AI Workspace</h2>
              <p className="text-xs text-[#6B7280]">Research your documents</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {session ? (
              <>
                <p className="text-sm text-[#111827]">
                  {session.user?.name || session.user?.email}
                </p>
                <button
                  onClick={() => signOut()}
                  className="text-sm font-medium text-[#374151] hover:text-[#111827]"
                >
                  Sign out
                </button>
              </>
            ) : (
              <button
                onClick={() => signIn()}
                className="text-sm font-medium text-[#374151] hover:text-[#111827]"
              >
                Sign in
              </button>
            )}
          </div>
        </header>

        {/* Chat + citations panel row */}
        <div className="flex flex-1 overflow-hidden">
          {/* Chat area */}
          <div className="flex flex-1 flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto">
              <div className="mx-auto flex w-full max-w-3xl flex-col px-6 py-10 lg:px-10">
                {/* Empty state */}
                {messages.length === 1 && (
                  <div className="flex flex-col items-center pt-24 text-center">
                    <div className="mb-8 flex h-24 w-24 items-center justify-center rounded-[32px] bg-white/90 shadow-[0_10px_40px_rgba(0,0,0,0.06)] backdrop-blur-xl">
                      <Sparkles className="h-10 w-10 text-[#111827]" />
                    </div>
                    <h1 className="text-[38px] font-semibold leading-tight tracking-[-0.03em] text-[#111827]">
                      Upload PDFs and ask anything
                    </h1>
                    <p className="mt-4 max-w-md text-[16px] leading-8 text-[#6B7280]">
                      Notebook-style AI workspace for researching documents, generating summaries,
                      and chatting naturally with your files.
                    </p>
                    <div className="mt-8 flex flex-wrap justify-center gap-3">
                      {['Summarize this document', 'Explain this simply', 'Generate study notes', 'Find important insights'].map(
                        (item) => (
                          <button
                            key={item}
                            onClick={() => setInput(item)}
                            className="rounded-2xl border border-black/6 bg-white/80 px-5 py-3 text-sm font-medium text-[#374151] shadow-sm transition-all duration-200 hover:-translate-y-px hover:bg-white hover:shadow-md"
                          >
                            {item}
                          </button>
                        )
                      )}
                    </div>
                  </div>
                )}

                {/* Messages */}
                <div className="space-y-8 mt-6">
                  {messages.map((message, index) => (
                    <div
                      key={index}
                      className={`flex animate-in fade-in slide-in-from-bottom-2 duration-300 ${
                        message.role === 'user' ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div
                        className={`max-w-2xl px-6 py-5 ${
                          message.role === 'user'
                            ? 'rounded-[26px] bg-[#111827] text-white shadow-[0_8px_30px_rgba(0,0,0,0.12)]'
                            : 'rounded-[28px] border border-black/5 bg-white/90 text-[#111827] backdrop-blur-sm shadow-[0_2px_12px_rgba(0,0,0,0.04)]'
                        }`}
                      >
                        {message.role === 'user' ? (
                          <article className="prose prose-sm prose-invert max-w-none">
                            <ReactMarkdown>{message.content}</ReactMarkdown>
                          </article>
                        ) : (
                          <>
                            <AssistantMessage
                              content={message.content}
                              citations={message.citations}
                            />

                            {/* Citations footer for this message */}
                            {message.citations && Object.keys(message.citations).length > 0 && (
                              <div className="mt-4 border-t border-black/5 pt-3">
                                <div className="flex flex-wrap gap-2">
                                  {Object.entries(message.citations).map(([idx, cit]) => (
                                    <button
                                      key={idx}
                                      onClick={() => {
                                        setActiveCitations(message.citations!)
                                        openCitationPopup(idx)
                                      }}
                                      className="
                                        flex items-center gap-1.5
                                        rounded-xl border border-amber-200
                                        bg-amber-50 px-3 py-1.5
                                        text-[11px] font-medium text-amber-700
                                        transition-all duration-150
                                        hover:bg-amber-100
                                      "
                                    >
                                      <span className="flex h-4 w-4 items-center justify-center rounded-full bg-amber-200 text-[9px] font-bold">
                                        {idx}
                                      </span>
                                      <span className="max-w-[140px] truncate">{cit.document_name}</span>
                                      <span className="text-amber-500">p.{cit.page + 1}</span>
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  ))}

                  {/* Loading indicator */}
                  {loading && (
                    <div className="flex justify-start">
                      <div className="rounded-[28px] border border-black/5 bg-white/90 px-6 py-5 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 animate-bounce rounded-full bg-[#9CA3AF]" />
                          <div className="h-2 w-2 animate-bounce rounded-full bg-[#9CA3AF] [animation-delay:120ms]" />
                          <div className="h-2 w-2 animate-bounce rounded-full bg-[#9CA3AF] [animation-delay:240ms]" />
                        </div>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>
              </div>
            </div>

            {/* Input bar */}
            <div className="px-4 pb-6 pt-4 lg:px-8">
              <div className="mx-auto flex max-w-3xl items-end gap-3 rounded-[30px] border border-black/6 bg-white/80 px-5 py-4 backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,0.06)] transition-all duration-200 focus-within:shadow-[0_10px_40px_rgba(0,0,0,0.08)]">
                <textarea
                  rows={1}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleSend()
                    }
                  }}
                  placeholder="Ask questions about your PDF…"
                  className="max-h-40 min-h-6 flex-1 resize-none bg-transparent text-[15px] leading-7 text-[#111827] outline-none placeholder:text-[#9CA3AF]"
                />
                <button
                  onClick={handleSend}
                  disabled={loading}
                  className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#111827] text-white shadow-lg transition-all duration-200 hover:scale-[1.03] hover:bg-black active:scale-[0.98] disabled:opacity-50"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Citations panel (desktop right sidebar) */}
          {citationsPanelOpen && Object.keys(activeCitations).length > 0 && (
            <CitationsPanel
              citations={activeCitations}
              onSelect={openCitationPopup}
              onClose={() => setCitationsPanelOpen(false)}
            />
          )}
        </div>
      </section>

      {/* Citation detail popup (mobile + desktop) */}
      {selectedCitationIdx && activeCitations[selectedCitationIdx] && (
        <CitationPopup
          citation={activeCitations[selectedCitationIdx]}
          index={selectedCitationIdx}
          onClose={() => setSelectedCitationIdx(null)}
        />
      )}
    </main>
  )
}