'use client'

import { useRef, useState } from 'react'
import { Send, Upload, FileText, Divide } from 'lucide-react'
import { Loader } from '../ui/loader'
import ReactMarkdown from 'react-markdown'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export default function Chat() {

const [messages, setMessages] = useState<Message[]>([ 
  {
     role: 'assistant',
    content: 'Upload a PDF and start asking questions about it.',
  },
])

  const [input, setInput] = useState('')
  const [fileName, setFileName] = useState('')
  const [loading , setLoading] = useState<Boolean>(false);
  const [error , setError] = useState<Boolean>(false);
  const [uploading , setUploading] = useState<Boolean>(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const handleSend = async () => {
    try {
        if (!input.trim()) return

        const userMessage: Message = {
        role: 'user',
        content: input,
        }
        
        setMessages((prev) => [
        ...prev,
        userMessage,
        ])
        setLoading(true)

        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/query?q=${encodeURIComponent(input)}`)

        const result = await response.json()

        const answer = result.answer;
        

      
        const aiMessage : Message = {
            role : 'assistant',
            content : answer
        }

        setMessages( (prev) => [
            ...prev,
            aiMessage
        ])

    } catch(e) {
        console.log("error : " ,e );
        
        setError(true)
    } finally {
        setLoading(false)
        setError(false)
    }
    setInput('')
  }

   const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setUploading(true)
    try {
        const file = event.target.files?.[0]


        if (file) {
        setFileName(file.name)

        
        const formData = new FormData()
        formData.append('file', file)
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/upload`, {
            method: 'POST',
            body: formData,
        })

        }
    } catch(e) {
        console.log("error : " ,e );

        setError(true);
    } finally {
        setError(false);
        setUploading(false);
    }
}

  return (
    <main className="flex h-screen flex-col bg-[#f5f5f5]">
      
      <header className="flex items-center justify-between border-b border-black/10 bg-white px-6 py-4">
        <div>
          <h1 className="text-2xl font-semibold">BookLLM</h1>
          <p className="text-sm text-black/60">
            Chat with your uploaded documents
          </p>
        </div>

        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-2 rounded-2xl bg-black px-5 py-3 text-white transition hover:opacity-90"
        >
          <Upload className="h-5 w-5" />
          Upload PDF
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={handleFileUpload}
        />
      </header>

      {fileName && (
        <div className="border-b border-black/10 bg-white px-6 py-3">
          <div className="flex w-fit items-center gap-3 rounded-2xl border border-black/10 bg-black/5 px-4 py-3">
            <FileText className="h-5 w-5" />
            <span className="font-medium">{fileName}</span>
          </div>
        </div>
      )}

      {
        error && (
            <div className='text-2xl text-red-500'>
                Unable to upload the file.
            </div>
        )
      }

     
      <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
        <div className="mx-auto flex max-w-4xl flex-col gap-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${
                message.role === 'user'
                  ? 'justify-end'
                  : 'justify-start'
              }`}
            >
              <div
                className={`max-w-[85%] rounded-3xl px-5 py-4 sm:max-w-[70%] ${
                  message.role === 'user'
                    ? 'bg-black text-white'
                    : 'bg-white border border-black/10 shadow-sm text-black'
                }`}
              >
                {error ? (
                  <div className="text-red-500 font-semibold">
                    Unable to find response.
                  </div>
                ) : (
                  <article
                    className={`prose prose-sm max-w-none ${
                      message.role === 'user' ? 'prose-invert' : ''
                    }`}
                  >
                    <ReactMarkdown>
                      {message.content}
                    </ReactMarkdown>
                  </article>
                )}
              </div>
            </div>
          ))}
        </div>
        {loading &&
            <div className='mt-2 flex mx-auto max-w-4xl justify-end bg-transparent'>
                Generating answer...
            </div>
        }
      </div>

      <div className='flex justify-center'>
        {uploading && <Loader />}
      </div>

      
      <div className="border-t border-black/10 bg-white px-4 py-4 sm:px-6">
        <div className="mx-auto flex max-w-4xl items-center gap-3 rounded-3xl border border-black/10 bg-white p-3 shadow-sm">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSend()
              }
            }}
            placeholder="Ask questions about your PDF..."
            className="flex-1 bg-transparent px-2 py-2 outline-none"
          />

          <button
            onClick={handleSend}
            className="flex h-12 w-12 items-center justify-center rounded-2xl bg-black text-white transition hover:scale-[1.02]"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </div>
    </main>
  )
}

