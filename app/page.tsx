'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Globe, BookOpen, Languages, Database, Check, AlertCircle, ExternalLink, Sparkles, Brain, Zap, ArrowRight, FileText, Lightbulb, Wand2, RotateCw } from 'lucide-react'

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
  const [showUrduTranslation, setShowUrduTranslation] = useState(false)
  const [showFullUrdu, setShowFullUrdu] = useState(false)

  const initializeSteps = (): ProcessingStatus[] => [
    { step: 'Scraping blog content', status: 'pending' },
    { step: 'Generating AI summary', status: 'pending' },
    { step: 'Translating to Urdu', status: 'pending' }
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
      updateStep(0, 'processing', 'Extracting content from blog...')
      
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
      updateStep(1, 'processing', 'Generating summary...')
      updateStep(2, 'processing', 'Translating to Urdu...')

      const data = await response.json()
      
      updateStep(1, 'completed', 'Summary generated')
      updateStep(2, 'completed', 'Translation completed')

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

      <main className="flex flex-col items-center justify-center w-full min-h-screen px-4 relative">
        {/* Top decorative icons */}
        <div className="absolute top-8 left-8 opacity-30">
          <Brain className="w-8 h-8 text-blue-400 animate-pulse" />
        </div>
        <div className="absolute top-8 right-8 opacity-30">
          <Zap className="w-8 h-8 text-blue-400 animate-bounce-slow" />
        </div>
        <div className="absolute top-16 left-1/4 opacity-20">
          <Lightbulb className="w-6 h-6 text-blue-300 animate-pulse" />
        </div>
        <div className="absolute top-16 right-1/4 opacity-20">
          <Wand2 className="w-6 h-6 text-blue-300 animate-bounce-slow" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="w-full max-w-6xl flex flex-col items-center gap-8 py-12"
        >
          {/* Icon above heading */}
          <div className="flex flex-col items-center mb-2">
            <div className="relative">
              <Sparkles className="w-16 h-16 text-primary mb-4 animate-bounce-slow" />
              <div className="absolute -top-2 -right-2 w-4 h-4 bg-blue-400 rounded-full animate-ping"></div>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-primary text-center mb-4">Blog Summarizer</h1>
          </div>
          
          <p className="text-xl text-secondary text-center mb-6 max-w-3xl">
            Get instant AI-powered summaries and translations from any blog URL.
          </p>



          {/* Animated divider/accent */}
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-0.5 bg-gradient-to-r from-transparent to-blue-400 animate-pulse"></div>
            <div className="w-4 h-4 bg-blue-400 rounded-full animate-ping"></div>
            <div className="w-16 h-1 rounded-full bg-gradient-to-r from-primary via-accent to-primary animate-pulse"></div>
            <div className="w-4 h-4 bg-blue-400 rounded-full animate-ping"></div>
            <div className="w-12 h-0.5 bg-gradient-to-l from-transparent to-blue-400 animate-pulse"></div>
          </div>

          {/* Main form with enhanced styling */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="w-full max-w-4xl"
          >
            <form onSubmit={handleSubmit} className="w-full flex flex-col sm:flex-row gap-4 card-professional shadow-xl transition-all duration-300 hover:shadow-2xl bg-opacity-90 p-8 relative overflow-hidden">
              {/* Form shimmer effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-400/5 to-transparent -translate-x-full animate-shimmer"></div>
              
              <div className="flex-1 relative">
                <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-400 z-10" />
                <Input
                  type="url"
                  placeholder="Enter blog URL (e.g. https://example.com/post)"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="flex-1 pl-12 pr-4 py-4 text-base bg-transparent border border-primary text-foreground placeholder:text-secondary rounded-lg shadow-sm focus:border-accent focus:ring-2 focus:ring-accent transition-all duration-300 w-full"
                  disabled={isProcessing}
                />
              </div>
              <Button
                type="submit"
                disabled={isProcessing}
                className="w-full sm:w-auto px-10 py-4 bg-primary text-primary-foreground font-bold text-base rounded-lg shadow hover:bg-accent hover:text-accent-foreground transition-all duration-300 flex-shrink-0 focus:scale-105 focus:ring-2 focus:ring-accent relative overflow-hidden group"
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

          {/* Statistics row */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.0 }}
            className="flex flex-wrap justify-center gap-8 mt-8"
          >
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">10K+</div>
              <div className="text-sm text-secondary">Blogs Analyzed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">25+</div>
              <div className="text-sm text-secondary">Languages</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">99.9%</div>
              <div className="text-sm text-secondary">Accuracy</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">15s</div>
              <div className="text-sm text-secondary">Avg. Time</div>
            </div>
          </motion.div>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="w-full text-danger bg-danger/10 p-3 rounded-lg shadow flex items-center gap-2 text-sm mt-2"
              >
                <AlertCircle className="w-5 h-5" />
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Step-by-step progress indicator */}
          <AnimatePresence>
            {isProcessing && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="w-full flex flex-col gap-2 mt-4"
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

          {/* Summary Result */}
          <AnimatePresence mode="wait">
            {result && !isProcessing && (
              <motion.div
                initial={{ opacity: 0, y: 40, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -40, scale: 0.9 }}
                transition={{ 
                  duration: 0.7, 
                  ease: 'easeOut',
                  type: "spring",
                  stiffness: 100,
                  damping: 15
                }}
                className="w-full mt-8 px-0 md:px-0"
              >
                <motion.div 
                  className="card-professional w-full p-8 flex flex-col gap-8 shadow-xl transition-all duration-300 hover:shadow-2xl relative overflow-hidden"
                  whileHover={{ y: -5 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Card shimmer effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-400/5 to-transparent -translate-x-full animate-shimmer"></div>
                  
                  {/* English Summary Section */}
                  <motion.div
                    initial={{ opacity: 0, x: -40, rotateY: -15 }}
                    animate={{ opacity: 1, x: 0, rotateY: 0 }}
                    transition={{ 
                      duration: 0.6, 
                      delay: 0.2,
                      ease: "easeOut"
                    }}
                    className="relative"
                  >
                    <motion.div 
                      className="flex items-center gap-3 mb-4"
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.3, duration: 0.3 }}
                    >
                      <FileText className="w-6 h-6 text-blue-400" />
                      <h2 className="text-2xl font-bold text-primary">Summary (English)</h2>
                      <motion.div 
                        className="w-2 h-2 bg-blue-400 rounded-full"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4, duration: 0.5 }}
                      className="bg-blue-500/5 rounded-lg p-4 border border-blue-500/10"
                    >
                      <p className="text-lg text-foreground leading-relaxed">{result.summary_english}</p>
                    </motion.div>
                  </motion.div>

                  {/* Animated Divider */}
                  <motion.div 
                    className="flex items-center gap-4 my-2"
                    initial={{ opacity: 0, scaleX: 0 }}
                    animate={{ opacity: 1, scaleX: 1 }}
                    transition={{ delay: 0.6, duration: 0.5 }}
                  >
                    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-blue-400/30 to-blue-400/30"></div>
                    <Languages className="w-5 h-5 text-blue-400 animate-pulse" />
                    <div className="flex-1 h-px bg-gradient-to-l from-transparent via-blue-400/30 to-blue-400/30"></div>
                  </motion.div>
                  
                                     {/* Urdu Translation Section */}
                   <motion.div
                     initial={{ opacity: 0, x: 40, rotateY: 15 }}
                     animate={{ opacity: 1, x: 0, rotateY: 0 }}
                     transition={{ 
                       duration: 0.6, 
                       delay: 0.7,
                       ease: "easeOut"
                     }}
                     className="relative"
                   >
                     <motion.div 
                       className="flex items-center gap-3 mb-4"
                       initial={{ scale: 0.8 }}
                       animate={{ scale: 1 }}
                       transition={{ delay: 0.8, duration: 0.3 }}
                     >
                       <Languages className="w-6 h-6 text-accent" />
                       <h2 className="text-2xl font-bold text-primary">Summary (Urdu)</h2>
                     </motion.div>
                     
                     {result.summary_urdu.includes('MYMEMORY WARNING') || result.summary_urdu.includes('USED ALL AVAILABLE FREE TRANSLATIONS') ? (
                       <motion.div
                         initial={{ opacity: 0, y: 20 }}
                         animate={{ opacity: 1, y: 0 }}
                         transition={{ delay: 0.9, duration: 0.5 }}
                         className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4"
                       >
                         <div className="flex items-center gap-2 text-orange-400 mb-2">
                           <AlertCircle className="w-5 h-5" />
                           <span className="font-semibold">Translation Service Temporarily Unavailable</span>
                         </div>
                         <p className="text-sm text-secondary">
                           The translation service has reached its daily limit. Urdu translation will be available again in a few hours.
                         </p>
                       </motion.div>
                     ) : (
                       <motion.div
                         className="relative cursor-pointer group bg-blue-500/5 rounded-lg p-4 border border-blue-500/10"
                         onClick={() => setShowFullUrdu((prev) => !prev)}
                         whileHover={{ scale: 1.01 }}
                         transition={{ duration: 0.2 }}
                         initial={{ opacity: 0, y: 20 }}
                         animate={{ opacity: 1, y: 0 }}
                         whileTap={{ scale: 0.99 }}
                       >
                         <AnimatePresence mode="wait">
                           <motion.p
                             key={showFullUrdu ? 'full' : 'truncated'}
                             initial={{ opacity: 0, y: 10, height: 'auto' }}
                             animate={{ opacity: 1, y: 0, height: 'auto' }}
                             exit={{ opacity: 0, y: -10, height: 0 }}
                             transition={{ 
                               duration: 0.5,
                               ease: "easeInOut",
                               height: { duration: 0.3 }
                             }}
                             className="text-lg text-foreground leading-relaxed"
                             dir="rtl"
                             lang="ur"
                           >
                             {showFullUrdu
                               ? result.summary_urdu
                               : result.summary_urdu.split(' ').slice(0, 20).join(' ') + (result.summary_urdu.split(' ').length > 20 ? '...' : '')}
                           </motion.p>
                         </AnimatePresence>
                         
                         {!showFullUrdu && result.summary_urdu.split(' ').length > 20 && (
                           <motion.div 
                             className="absolute bottom-2 right-2 text-xs text-blue-400 opacity-70"
                             animate={{ opacity: [0.5, 1, 0.5] }}
                             transition={{ duration: 2, repeat: Infinity }}
                           >
                             Click to expand
                           </motion.div>
                         )}
                       </motion.div>
                     )}
                   </motion.div>

                                     {/* Metadata Section */}
                   <motion.div 
                     className="flex flex-wrap gap-4 mt-4 p-4 bg-black/20 rounded-lg border border-blue-500/10"
                     initial={{ opacity: 0, y: 20 }}
                     animate={{ opacity: 1, y: 0 }}
                     transition={{ delay: 1.0, duration: 0.5 }}
                   >
                     <motion.span 
                       className="text-sm text-secondary flex items-center gap-1"
                       whileHover={{ scale: 1.05, color: '#60a5fa' }}
                     >
                       📝 Words: {result.word_count}
                     </motion.span>
                     <motion.a 
                       href={result.blog_url} 
                       target="_blank" 
                       rel="noopener noreferrer" 
                       className="text-accent underline flex items-center gap-1 text-sm"
                       whileHover={{ scale: 1.05 }}
                       whileTap={{ scale: 0.95 }}
                     >
                       <ExternalLink className="w-4 h-4" />
                       Original Blog
                     </motion.a>
                   </motion.div>
                </motion.div>
              </motion.div>
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
      `}</style>
    </div>
  )
} 