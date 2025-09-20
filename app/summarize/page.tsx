"use client"
import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { File, Globe, Text, Upload, Sparkles, ArrowRight, History } from "lucide-react"
import { useUser } from '@clerk/nextjs'

const inputTypes = [
  { key: 'file', label: 'File Upload', icon: <File className="w-4 h-4" />, desc: 'PDF, DOCX, TXT files' },
  { key: 'url', label: 'Web URL', icon: <Globe className="w-4 h-4" />, desc: 'Articles, blogs, pages' },
  { key: 'text', label: 'Raw Text', icon: <Text className="w-4 h-4" />, desc: 'Direct text input' },
]

const SummarizePage = () => {
  const [type, setType] = useState('file')
  const [isDragOver, setIsDragOver] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [url, setUrl] = useState<string>('')
  const [text, setText] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string>('')

  const { isSignedIn, user, isLoaded } = useUser()
  const userId = isLoaded && isSignedIn && user ? user.id : 'anonymous'


  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragOver(false)
    
    const files = e.dataTransfer.files
    if (files && files.length > 0) {
      const droppedFile = files[0]
      // Check file type
      const allowedTypes = ['.pdf', '.docx', '.txt']
      const fileExtension = '.' + droppedFile.name.split('.').pop()?.toLowerCase()
      
      if (allowedTypes.includes(fileExtension)) {
        setFile(droppedFile)
      } else {
        alert('Please select a PDF, DOCX, or TXT file.')
      }
    }
  }

  const onSubmit = async () => {
    setIsLoading(true)
    setError('')
    setResult(null)

    try {
      // Validate input based on type
      if (type === 'file' && !file) {
        throw new Error('Please select a file to upload')
      }
      if (type === 'url' && !url.trim()) {
        throw new Error('Please enter a valid URL')
      }
      if (type === 'text' && !text.trim()) {
        throw new Error('Please enter some text to summarize')
      }

      const apiUrl = 'http://localhost:8000/summarize'
      let response: Response

      if (type === 'file' && file) {
        // Handle file upload with FormData
        const formData = new FormData()
        formData.append('userId', userId) // You can make this dynamic
        formData.append('file', file)

        response = await fetch(apiUrl, {
          method: 'POST',
          body: formData,
        })
      } else {
        // Handle text and URL with JSON
        const requestBody: any = {
          userId: userId, // You can make this dynamic
        }

        if (type === 'url') {
          requestBody.url = url.trim()
        } else if (type === 'text') {
          requestBody.text = text.trim()
        }

        response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        })
      }

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      setResult(result)
      
      // Clear form after successful submission
      if (type === 'file') setFile(null)
      if (type === 'url') setUrl('')
      if (type === 'text') setText('')

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while processing your request')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl mb-4 shadow-lg">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">
            AI Document Summarizer
          </h1>
          
        </div>

        {/* History page navigation */}
        <div className="flex justify-end mb-3">
          <Button 
            variant="outline" 
            size="sm" 
            className="bg-white/50 backdrop-blur-sm hover:bg-white/70"
            onClick={() => window.location.href = `summarize/${userId}`}
          >
           <History className='mr-2 h-4 w-4'/> View History
          </Button>
        </div>
        {/* Main Card */}
        <Card className="backdrop-blur-sm bg-white/80 border-0 shadow-2xl shadow-blue-500/10">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-semibold text-gray-800 text-center">
              Choose Your Input Method
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            
            {/* Input Type Selector */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {inputTypes.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setType(t.key)}
                  className={`group relative p-4 rounded-xl border-2 transition-all duration-200 hover:scale-[1.02] ${
                    type === t.key
                      ? 'border-blue-500 bg-blue-50 shadow-lg shadow-blue-500/20'
                      : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
                  }`}
                >
                  <div className="flex flex-col items-center text-center space-y-2">
                    <div className={`p-2 rounded-lg transition-colors ${
                      type === t.key ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500 group-hover:bg-gray-200'
                    }`}>
                      {t.icon}
                    </div>
                    <div>
                      <div className={`font-medium ${type === t.key ? 'text-blue-700' : 'text-gray-700'}`}>
                        {t.label}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {t.desc}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Input Area */}
            <div className="space-y-4">
              {type === 'file' && (
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Upload Document
                  </label>
                  <div
                    className={`relative border-2 border-dashed rounded-xl p-8 transition-all duration-200 text-center ${
                      isDragOver
                        ? 'border-blue-400 bg-blue-50'
                        : 'border-gray-300 hover:border-gray-400 bg-gray-50/50'
                    }`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600 mb-2">
                      Drag and drop your file here, or{' '}
                      <button className="text-blue-600 hover:text-blue-700 font-medium">
                        browse
                      </button>
                    </p>
                    <p className="text-xs text-gray-500">
                      Supports PDF, DOCX, TXT files up to 10MB
                    </p>
                    <Input 
                      onChange={(e) => setFile(e.target.files?.[0] || null)}
                      type="file" 
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      accept=".pdf,.docx,.txt"
                    />
                    {file && (
                      <p className="text-gray-600 mt-2">
                        Selected: {file.name}
                      </p>
                    )}
                  </div>
                </div>
              )}
              
              {type === 'url' && (
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Website URL
                  </label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input 
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                      type="url" 
                      placeholder="https://example.com/article"
                      className="pl-10 h-12 border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <p className="text-xs text-gray-500">
                    Enter the URL of any web article or blog post
                  </p>
                </div>
              )}
              
              {type === 'text' && (
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Text Content
                  </label>
                  <Textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    rows={6}
                    placeholder="Paste or type your text content here..."
                    className="resize-none border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500">
                    Paste any text you'd like to summarize
                  </p>
                </div>
              )}
            </div>

            {/* Action Button */}
            <Button 
              onClick={onSubmit}
              disabled={isLoading}
              className="w-full h-14 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 group disabled:opacity-50 disabled:cursor-not-allowed"
              size="lg"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Processing...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform" />
                  Generate Summary
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </Button>

            {/* Error Display */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            {/* Result Display */}
            {result && (
              <div className="p-6 bg-green-50 border border-green-200 rounded-xl space-y-3">
                <h3 className="font-semibold text-green-800">Summary Generated Successfully!</h3>
                <div className="bg-white p-4 rounded-lg border border-green-100">
                  <p className="text-gray-700 leading-relaxed">{result.final_summary}</p>
                </div>
                <div className="flex flex-wrap gap-2 text-xs text-green-600">
                  <span>Document ID: {result.doc_id}</span>
                  {result.file_name && <span>File: {result.file_name}</span>}
                  {result.file_type && <span>Type: {result.file_type}</span>}
                </div>
              </div>
            )}

            {/* Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t border-gray-200">
              <div className="text-center">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
                <p className="text-xs text-gray-600">AI-Powered</p>
              </div>
              <div className="text-center">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                </div>
                <p className="text-xs text-gray-600">Lightning Fast</p>
              </div>
              <div className="text-center">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                </div>
                <p className="text-xs text-gray-600">Secure & Private</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default SummarizePage