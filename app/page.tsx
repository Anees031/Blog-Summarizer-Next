'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Globe, BookOpen, Languages, Database, Check, AlertCircle, ExternalLink, Sparkles, Brain, Zap, ArrowRight, FileText, Lightbulb, Wand2, RotateCw, X, List } from 'lucide-react'
import { useRef } from 'react'
import { jsPDF } from 'jspdf'
import html2canvas from 'html2canvas'

interface SummaryResult {
  id: number
  blog_url: string
  title: string
  summary_english: string
  summary_urdu: string
  created_at: string
  word_count: number
  author?: string
}

interface ProcessingStatus {
  step: string
  status: 'pending' | 'processing' | 'completed' | 'error'
  message?: string
}

export default function HomePage() {
  const [url, setUrl] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [result, setResult] = useState<SummaryResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [processingSteps, setProcessingSteps] = useState<ProcessingStatus[]>([])
  // Remove mode, fileInputRef, textInput state

  // Analysis state (separate for English and Urdu)
  const [analysisEn, setAnalysisEn] = useState({ wordCount: 0, charCount: 0, vowelCount: 0 })
  const [analysisUr, setAnalysisUr] = useState({ wordCount: 0, charCount: 0, vowelCount: 0 })

  // Button state
  const hasEnglish = !!(result && result.summary_english)
  const hasUrdu = !!(result && result.summary_urdu)

  // Dashboard modal state
  const [dashboardOpen, setDashboardOpen] = useState(false)
  // Dashboard summaries state
  const [summaries, setSummaries] = useState<SummaryResult[]>([])
  const [dashboardLoading, setDashboardLoading] = useState(false)
  const [dashboardError, setDashboardError] = useState<string | null>(null)

  // Fetch summaries from Supabase when dashboard opens
  useEffect(() => {
    if (!dashboardOpen) return
    setDashboardLoading(true)
    setDashboardError(null)
    fetch('/api/summarize?list=1')
      .then(async (res) => {
        if (!res.ok) throw new Error('Failed to fetch summaries')
        return res.json()
      })
      .then((data) => {
        setSummaries(Array.isArray(data.summaries) ? data.summaries : [])
        setDashboardLoading(false)
      })
      .catch((err) => {
        setDashboardError(err.message || 'Error loading summaries')
        setDashboardLoading(false)
      })
  }, [dashboardOpen])

  const initializeSteps = (): ProcessingStatus[] => [
    { step: '🔎 Scraping blog content', status: 'pending' },
    { step: '🤖 Generating AI summary', status: 'pending' },
    { step: '🌐 Translating to Urdu', status: 'pending' }
  ]

  const updateStep = (stepIndex: number, status: ProcessingStatus['status'], message?: string) => {
    setProcessingSteps(prev => prev.map((step, index) => 
      index === stepIndex ? { ...step, status, message } : step
    ))
  }

  const validateUrl = (url: string): boolean => {
    try {
      const urlObj = new URL(url)
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:'
    } catch {
      return false
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!url.trim()) {
      setError('Please enter a blog URL')
      return
    }

    if (!validateUrl(url)) {
      setError('Please enter a valid URL (must start with http:// or https://)')
      return
    }

    setError(null)
    setResult(null)
    setIsProcessing(true)
    setProcessingSteps(initializeSteps())

    // Auto-scroll down to show progress
    setTimeout(() => {
      window.scrollTo({
        top: window.scrollY + 400,
        behavior: 'smooth'
      })
    }, 300)

    try {
      // Step 1: Scraping
      updateStep(0, 'processing', '🔎 Scanning blog for awesome content...')
      
      const response = await fetch('/api/summarize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: url.trim() }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }

      updateStep(0, 'completed', 'Content extracted successfully')
      updateStep(1, 'processing', '🤖 Summarizing with AI magic...')
      updateStep(2, 'processing', '🌐 Translating into beautiful Urdu...')

      const data = await response.json()
      
      updateStep(1, 'completed', '✅ AI summary ready!')
      updateStep(2, 'completed', '✅ Urdu translation done!')

      setResult(data)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred'
      setError(errorMessage)
      
      // Mark current processing step as error
      const currentStepIndex = processingSteps.findIndex(step => step.status === 'processing')
      if (currentStepIndex !== -1) {
        updateStep(currentStepIndex, 'error', errorMessage)
      }
    } finally {
      setIsProcessing(false)
    }
  }

  // Analyze handlers
  const handleAnalyzeEnglish = () => {
    if (!result) return
    const text = result.summary_english
    setAnalysisEn({
      wordCount: text.trim().split(/\s+/).length,
      charCount: text.length,
      vowelCount: (text.match(/[aeiouAEIOU]/g) || []).length
    })
  }
  const handleAnalyzeUrdu = () => {
    if (!result) return
    const text = result.summary_urdu
    setAnalysisUr({
      wordCount: text.trim().split(/\s+/).length,
      charCount: text.length,
      vowelCount: (text.match(/[اآءییےےوواے]/g) || []).length
    })
  }

  // Reset handler
  const handleReset = () => {
    setResult(null)
    setAnalysisEn({ wordCount: 0, charCount: 0, vowelCount: 0 })
    setAnalysisUr({ wordCount: 0, charCount: 0, vowelCount: 0 })
    setUrl('')
    setError(null)
    setProcessingSteps(initializeSteps())
  }

  // Download PDF handlers
  const handleDownloadEnglish = () => {
    if (!result) return
    const doc = new jsPDF()
    doc.setFontSize(14)
    doc.text('Blog Summary (English):', 10, 20)
    doc.setFontSize(12)
    doc.text(doc.splitTextToSize(result.summary_english, 180), 10, 30)
    doc.save('blog-summary-english.pdf')
  }

  const handleDownloadUrdu = async () => {
    if (!result) return
    const urduDiv = document.getElementById('urdu-summary-pdf')
    if (!urduDiv) return
    const canvas = await html2canvas(urduDiv, { backgroundColor: '#fff', scale: 2 })
    const imgData = canvas.toDataURL('image/png')
    const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' })
    const pageWidth = doc.internal.pageSize.getWidth()
    const imgProps = doc.getImageProperties(imgData)
    const imgWidth = pageWidth - 20
    const imgHeight = (imgProps.height * imgWidth) / imgProps.width
    // Get PDF page height
    const pageHeight = doc.internal.pageSize.getHeight()
    // Ensure image height fits within page
    const maxImgHeight = pageHeight - 40 // 20 top + 20 bottom margin
    const finalImgHeight = Math.min(imgHeight, maxImgHeight)
    doc.text('Blog Summary (Urdu):', 10, 20)
    doc.addImage(imgData, 'PNG', 10, 30, imgWidth, finalImgHeight)
    doc.save('blog-summary-urdu.pdf')
  }

  const getStepIcon = (status: ProcessingStatus['status']) => {
    switch (status) {
      case 'completed':
        return <Check className="w-4 h-4 text-green-500" />
      case 'processing':
        return <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />
      default:
        return <div className="w-4 h-4 rounded-full border-2 border-gray-300" />
    }
  }

  // Animation variants for summary generation
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center w-full relative overflow-hidden">
      {/* Dashboard Button */}
      <button
        className="fixed top-6 right-6 z-40 flex items-center gap-2 px-6 py-3 rounded-lg font-bold text-lg bg-blue-700 text-white shadow-lg hover:bg-blue-800 focus:ring-2 focus:ring-accent focus:outline-accent transition-all duration-200"
        aria-label="Open dashboard"
        onClick={() => setDashboardOpen(true)}
      >
        <List className="w-5 h-5" aria-hidden="true" />
        Dashboard
      </button>
      {/* Dashboard Modal */}
      {dashboardOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label="Dashboard"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full p-8 relative flex flex-col gap-4"
          >
            <button
              className="absolute top-4 right-4 p-2 rounded-full bg-gray-100 hover:bg-gray-200 focus:ring-2 focus:ring-accent focus:outline-accent"
              aria-label="Close dashboard"
              onClick={() => setDashboardOpen(false)}
            >
              <X className="w-6 h-6" aria-hidden="true" />
            </button>
            <h2 className="text-2xl font-bold mb-4 text-blue-700">Dashboard</h2>
            {/* Dashboard content: summaries list */}
            {dashboardLoading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-2" aria-hidden="true" />
                <span className="text-gray-500">Loading summaries...</span>
              </div>
            ) : dashboardError ? (
              <div className="text-red-600 text-center py-8">{dashboardError}</div>
            ) : summaries.length === 0 ? (
              <div className="text-gray-500 text-center py-8">No summaries found.</div>
            ) : (
              <ul className="divide-y divide-gray-200 max-h-[60vh] overflow-y-auto">
                {summaries.map((summary) => (
                  <li key={summary.id} className="py-4 px-2 flex flex-col gap-1">
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <div className="font-semibold text-lg text-blue-800">{summary.title}</div>
                        <a href={summary.blog_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline text-sm break-all">{summary.blog_url}</a>
                      </div>
                      <span className="text-xs text-gray-400">{new Date(summary.created_at).toLocaleString()}</span>
                    </div>
                    {/* Expand/view more button placeholder */}
                  </li>
                ))}
              </ul>
            )}
          </motion.div>
        </div>
      )}
      {/* Animated background gradient */}
      <div className="absolute inset-0 -z-10 animate-gradient-move bg-gradient-to-br from-[#1a237e] via-[#232b3a] to-[#0d47a1] opacity-80" />
      
      {/* Floating decorative elements */}
      <div className="absolute inset-0 -z-5 pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-blue-500/5 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-blue-400/8 rounded-full blur-lg animate-bounce-slow"></div>
        <div className="absolute bottom-32 left-20 w-40 h-40 bg-blue-300/4 rounded-full blur-2xl animate-pulse"></div>
        <div className="absolute bottom-20 right-32 w-28 h-28 bg-blue-500/6 rounded-full blur-xl animate-bounce-slow"></div>
        <div className="absolute top-1/2 left-8 w-20 h-20 bg-blue-400/7 rounded-full blur-lg animate-pulse"></div>
        <div className="absolute top-1/3 right-8 w-36 h-36 bg-blue-300/5 rounded-full blur-2xl animate-bounce-slow"></div>
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 -z-5 pointer-events-none">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className={`absolute w-2 h-2 bg-blue-400/20 rounded-full animate-bounce-slow`}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      {/* Add skip link at the top for accessibility */}
      <a href="#main-content" className="sr-only focus:not-sr-only absolute top-2 left-2 z-50 bg-white text-blue-700 font-bold px-4 py-2 rounded shadow focus:outline-accent">Skip to main content</a>
      <main id="main-content" role="main" aria-label="Main content" className="flex flex-col items-center justify-center w-full min-h-screen px-4 relative">
        {/* Top decorative icons */}
        <div className="absolute top-8 left-8 opacity-30">
          <Brain className="w-8 h-8 text-blue-400 animate-pulse" aria-hidden="true" />
        </div>
        <div className="absolute top-8 right-8 opacity-30">
          <Zap className="w-8 h-8 text-blue-400 animate-bounce-slow" aria-hidden="true" />
        </div>
        <div className="absolute top-16 left-1/4 opacity-20">
          <Lightbulb className="w-6 h-6 text-blue-300 animate-pulse" aria-hidden="true" />
        </div>
        <div className="absolute top-16 right-1/4 opacity-20">
          <Wand2 className="w-6 h-6 text-blue-300 animate-bounce-slow" aria-hidden="true" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="w-full max-w-6xl flex flex-col items-center gap-8 py-12"
          role="region"
          aria-label="Blog summarizer main section"
        >
          {/* Icon above heading */}
          <div className="flex flex-col items-center mb-2">
            <div className="relative">
              <Sparkles className="w-16 h-16 text-primary mb-4 animate-bounce-slow" aria-hidden="true" />
              <div className="absolute -top-2 -right-2 w-4 h-4 bg-blue-400 rounded-full animate-ping"></div>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-primary text-center mb-4">Blog Genius Summarizer</h1>
          </div>
          
          <p className="text-xl text-secondary text-center mb-6 max-w-3xl">
            Supercharge your reading! Instantly get smart, AI-powered blog summaries and Urdu translations. Paste a link and let the magic happen!
          </p>



          {/* Animated divider/accent */}
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-0.5 bg-gradient-to-r from-transparent to-blue-400 animate-pulse"></div>
            <div className="w-4 h-4 bg-blue-400 rounded-full animate-ping"></div>
            <div className="w-16 h-1 rounded-full bg-gradient-to-r from-primary via-accent to-primary animate-pulse"></div>
            <div className="w-4 h-4 bg-blue-400 rounded-full animate-ping"></div>
            <div className="w-12 h-0.5 bg-gradient-to-l from-transparent to-blue-400 animate-pulse"></div>
          </div>

          {/* Remove Mode Switch Tabs */}
          {/* Main form with enhanced styling */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="w-full max-w-4xl"
          >
            <form onSubmit={handleSubmit} aria-label="Blog URL submission form" className="w-full flex flex-col sm:flex-row gap-4 card-professional shadow-xl transition-all duration-300 hover:shadow-2xl bg-opacity-90 p-8 relative overflow-hidden">
              {/* Form shimmer effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-400/5 to-transparent -translate-x-full animate-shimmer"></div>
              <div className="flex-1 relative">
                <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-400 z-10" aria-hidden="true" />
                <Input
                  type="url"
                  aria-label="Blog URL input"
                  placeholder="Paste the blog URL (e.g. https://example.com/blog/post)"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="flex-1 pl-12 pr-4 py-4 text-base bg-transparent border border-primary text-foreground placeholder:text-secondary rounded-lg shadow-sm focus:border-accent focus:ring-2 focus:ring-accent focus:outline-accent transition-all duration-300 w-full"
                  disabled={isProcessing}
                  required
                />
              </div>
              <Button
                type="submit"
                aria-label="Analyze Blog"
                disabled={isProcessing}
                className="w-full sm:w-auto px-10 py-4 bg-primary text-primary-foreground font-bold text-base rounded-lg shadow hover:bg-accent hover:text-accent-foreground transition-all duration-300 flex-shrink-0 focus:scale-105 focus:ring-2 focus:ring-accent focus:outline-accent relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <span className="relative z-10 flex items-center gap-2">
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Analyzing...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 animate-pulse" />
                      <span>Analyze Blog</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </span>
              </Button>
            </form>
          </motion.div>

          {/* Interactive Emoji Stats Row */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.0 }}
            className="flex flex-wrap justify-center gap-8 mt-8"
          >
            <div className="text-center group cursor-pointer transition-transform hover:scale-105">
              <div className="text-3xl mb-1 animate-bounce">📝</div>
              <div className="text-2xl font-bold text-primary">10K+</div>
              <div className="text-sm text-accent">Blogs Summarized</div>
            </div>
            <div className="text-center group cursor-pointer transition-transform hover:scale-105">
              <div className="text-3xl mb-1 animate-bounce">🌐</div>
              <div className="text-2xl font-bold text-primary">25+</div>
              <div className="text-sm text-accent">Languages Supported</div>
            </div>
            <div className="text-center group cursor-pointer transition-transform hover:scale-105">
              <div className="text-3xl mb-1 animate-bounce">😊</div>
              <div className="text-2xl font-bold text-primary">5K+</div>
              <div className="text-sm text-accent">Happy Users</div>
            </div>
            <div className="text-center group cursor-pointer transition-transform hover:scale-105">
              <div className="text-3xl mb-1 animate-bounce">⚡</div>
              <div className="text-2xl font-bold text-primary">12s</div>
              <div className="text-sm text-accent">Fastest Summary</div>
            </div>
          </motion.div>

          {/* Error and status live region for screen readers */}
          <div aria-live="polite" aria-atomic="true" className="sr-only" id="status-live-region">
            {error && `Error: ${error}`}
            {isProcessing && processingSteps.map((step) => `${step.step}: ${step.status} ${step.message || ''}`).join(' ')}
          </div>

          {/* Step-by-step progress indicator with animation and accessibility */}
          <AnimatePresence>
            {isProcessing && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="w-full flex flex-col gap-2 mt-4"
                aria-busy="true"
                aria-live="polite"
                role="status"
              >
                {processingSteps.map((step, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 16 }}
                    transition={{ delay: idx * 0.1 }}
                    className="flex items-center gap-2 text-sm p-2 rounded bg-background/80 border border-secondary/30 transition-all duration-300"
                  >
                    {getStepIcon(step.status)}
                    <span className={
                      step.status === 'completed' ? 'text-primary' :
                      step.status === 'processing' ? 'text-accent' :
                      step.status === 'error' ? 'text-danger' : 'text-secondary'
                    }>
                      {step.step}
                    </span>
                    {step.message && <span className="ml-2 text-secondary italic">{step.message}</span>}
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Summary Result with animation and accessibility */}
          <AnimatePresence mode="wait">
            {result && !isProcessing && (
              <motion.section
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.5 }}
                className="flex flex-col items-center w-full"
                role="region"
                aria-label="Summary results"
                tabIndex={-1}
              >
                <div className="w-full max-w-4xl bg-white bg-opacity-90 rounded-2xl border-2 border-purple-300 shadow-lg p-6 md:p-10 flex flex-col gap-8">
                  {/* English Summary Section */}
                  <section aria-labelledby="summary-english-heading">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="w-6 h-6 text-purple-500" aria-hidden="true" />
                      <h2 id="summary-english-heading" className="text-xl md:text-2xl font-bold text-purple-700">Summary <span className="text-gray-500">(English)</span></h2>
                      <span className="w-2 h-2 bg-purple-400 rounded-full ml-1" aria-hidden="true" />
                    </div>
                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-100 text-gray-900 mb-4 w-full">
                      <p className="text-base md:text-lg leading-relaxed">{result.summary_english}</p>
                    </div>
                    {/* BUTTONS & ANALYSIS SECTION for English */}
                    <div className="flex flex-col items-center w-full">
                      <div className="flex flex-row justify-center gap-4 mb-2 w-full max-w-md">
                        <button
                          className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold text-lg transition-all duration-200 shadow-md
                            ${hasEnglish
                              ? 'bg-purple-600 text-white hover:bg-purple-700 focus:ring-2 focus:ring-purple-400 focus:outline-accent'
                              : 'bg-gray-200 text-gray-400 opacity-60 cursor-not-allowed'}`}
                          onClick={handleAnalyzeEnglish}
                          disabled={!hasEnglish}
                          aria-label="Analyze English summary"
                        >
                          <span role="img" aria-label="analyze">🔍</span>
                          <span className="ml-1">Analyze English</span>
                        </button>
                        <button
                          className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold text-lg transition-all duration-200 shadow-md
                            ${hasEnglish
                              ? 'bg-green-600 text-white hover:bg-green-700 focus:ring-2 focus:ring-green-400 focus:outline-accent'
                              : 'bg-gray-200 text-gray-400 opacity-60 cursor-not-allowed'}`}
                          onClick={handleDownloadEnglish}
                          disabled={!hasEnglish}
                          aria-label="Download English summary as PDF"
                        >
                          <span role="img" aria-label="download">⬇️</span>
                          <span className="ml-1">Download English PDF</span>
                        </button>
                      </div>
                      <div className="flex flex-row gap-8 text-xl font-bold justify-center w-full text-purple-700 mt-2">
                        <span>Words: {analysisEn.wordCount}</span>
                        <span>Chars: {analysisEn.charCount}</span>
                        <span>Vowels: {analysisEn.vowelCount}</span>
                      </div>
                    </div>
                  </section>
                  {/* Urdu Summary Section */}
                  <section aria-labelledby="summary-urdu-heading">
                    <div className="flex items-center gap-2 mb-2">
                      <Languages className="w-6 h-6 text-blue-500" aria-hidden="true" />
                      <h2 id="summary-urdu-heading" className="text-xl md:text-2xl font-bold text-blue-700">Summary <span className="text-gray-500">(Urdu)</span></h2>
                      <span className="w-2 h-2 bg-blue-400 rounded-full ml-1" aria-hidden="true" />
                    </div>
                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-100 text-gray-900 mb-4 w-full">
                      <p id="urdu-summary-pdf" className="text-base md:text-lg leading-relaxed" dir="rtl" lang="ur">{result.summary_urdu}</p>
                    </div>
                    {/* BUTTONS & ANALYSIS SECTION for Urdu */}
                    <div className="flex flex-col items-center w-full">
                      <div className="flex flex-row justify-center gap-4 mb-2 w-full max-w-md">
                        <button
                          className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold text-lg transition-all duration-200 shadow-md
                            ${hasUrdu
                              ? 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-400 focus:outline-accent'
                              : 'bg-gray-200 text-gray-400 opacity-60 cursor-not-allowed'}`}
                          onClick={handleAnalyzeUrdu}
                          disabled={!hasUrdu}
                          aria-label="Analyze Urdu summary"
                        >
                          <span role="img" aria-label="analyze">🔍</span>
                          <span className="ml-1">Analyze Urdu</span>
                        </button>
                        <button
                          className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold text-lg transition-all duration-200 shadow-md
                            ${hasUrdu
                              ? 'bg-green-600 text-white hover:bg-green-700 focus:ring-2 focus:ring-green-400 focus:outline-accent'
                              : 'bg-gray-200 text-gray-400 opacity-60 cursor-not-allowed'}`}
                          onClick={handleDownloadUrdu}
                          disabled={!hasUrdu}
                          aria-label="Download Urdu summary as PDF"
                        >
                          <span role="img" aria-label="download">⬇️</span>
                          <span className="ml-1">Download Urdu PDF</span>
                        </button>
                      </div>
                      <div className="flex flex-row gap-8 text-xl font-bold justify-center w-full text-blue-700 mt-2">
                        <span>Words: {analysisUr.wordCount}</span>
                        <span>Chars: {analysisUr.charCount}</span>
                        <span>Vowels: {analysisUr.vowelCount}</span>
                      </div>
                    </div>
                  </section>
                </div>
                {/* Reset Button (global) */}
                <div className="flex flex-row justify-center mt-8">
                  <button
                    className={`flex items-center justify-center gap-2 px-10 py-4 rounded-lg font-bold text-xl shadow-md transition-all duration-200
                      bg-purple-500 text-white hover:bg-purple-700 focus:ring-2 focus:ring-purple-400 focus:outline-accent`}
                    onClick={handleReset}
                    disabled={!hasEnglish && !hasUrdu}
                    aria-label="Reset summaries and form"
                  >
                    <span role="img" aria-label="reset">❌</span>
                    <span className="ml-1">Reset</span>
                  </button>
                </div>
              </motion.section>
            )}
          </AnimatePresence>


        </motion.div>
      </main>
      {/* Keyframes for animated gradient and icon */}
      <style jsx global>{`
        @keyframes gradient-move {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient-move {
          background-size: 200% 200%;
          animation: gradient-move 12s ease-in-out infinite;
        }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-bounce-slow {
          animation: bounce-slow 2.5s infinite;
        }
        :focus {
          outline: 2px solid #7c3aed !important;
          outline-offset: 2px !important;
        }
      `}</style>
    </div>
  )
} 