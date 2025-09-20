"use client";
import React, { useEffect, useState } from 'react'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  FileText, 
  Globe, 
  Text, 
  File, 
  ChevronDown, 
  ChevronUp, 
  Clock, 
  Eye,
  MoreVertical,
  Download,
  Share,
  History
} from "lucide-react"
import { useUser } from '@clerk/nextjs';


const documents = [
  
    {
      "id": 7,
      "userId": "u3",
      "type": "url",
      "length": 220,
      "final_summary": "The Example Domain is intended for use in illustrative examples within documents and can be used freely in literature without needing prior coordination or permission.",
      "created_at": "2025-09-05T10:35:46.018643",
      "file_name": "https://example.com",
      "file_size": null,
      "file_type": "text/html"
    }
  ]

const typeConfig = {
  file: { icon: FileText, color: 'text-blue-600', bgColor: 'bg-blue-50', borderColor: 'border-blue-200' },
  url: { icon: Globe, color: 'text-emerald-600', bgColor: 'bg-emerald-50', borderColor: 'border-emerald-200' },
  text: { icon: Text, color: 'text-violet-600', bgColor: 'bg-violet-50', borderColor: 'border-violet-200' },
  default: { icon: File, color: 'text-gray-400', bgColor: 'bg-gray-50', borderColor: 'border-gray-200' }
} as const

type DocumentTypeKey = keyof typeof typeConfig

const getTypeConfig = (type: DocumentTypeKey | string) => {
  if (type in typeConfig) {
    return typeConfig[type as DocumentTypeKey]
  }
  return typeConfig.default
}

const formatDate = (dateString: any) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
  })
}

const formatFileSize = (bytes: number | null) => {
  if (!bytes) return null
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`
}

const DocumentCard = ({ doc }:{doc: Document}) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const config = getTypeConfig(doc.type)
  const IconComponent = config.icon

  return (
    <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-white/95 backdrop-blur-sm overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            {/* Type Icon */}
            <div className={`flex-shrink-0 p-2 rounded-lg ${config.bgColor} ${config.borderColor} border`}>
              <IconComponent className={`w-4 h-4 ${config.color}`} />
            </div>
            
            {/* document Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-gray-900 truncate">
                  {doc.file_name || `${doc.type.charAt(0).toUpperCase() + doc.type.slice(1)} document`}
                </h3>
                <Badge 
                  variant="secondary" 
                  className={`${config.bgColor} ${config.color} border-0 text-xs font-medium px-2 py-1`}
                >
                  {doc.type.toUpperCase()}
                </Badge>
              </div>
              
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatDate(doc.created_at)}
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  {doc.length} chars
                </span>
                {doc.file_size && (
                  <span>{formatFileSize(doc.file_size)}</span>
                )}
              </div>
            </div>
          </div>
          
          {/* Action Menu */}
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
              <Download className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
              <Share className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <CollapsibleTrigger asChild>
            <Button 
              variant="ghost" 
              className="w-full justify-between p-3 h-auto bg-gray-50/50 hover:bg-gray-100/70 rounded-lg transition-colors"
            >
              <span className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Eye className="w-4 h-4" />
                {isExpanded ? 'Hide Summary' : 'View Summary'}
              </span>
              {isExpanded ? 
                <ChevronUp className="w-4 h-4 text-gray-500" /> : 
                <ChevronDown className="w-4 h-4 text-gray-500" />
              }
            </Button>
          </CollapsibleTrigger>
          
          <CollapsibleContent className="mt-3">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Text className="w-3 h-3 text-blue-600" />
                </div>
                <div>
                  <p className="text-gray-800 leading-relaxed text-sm">
                    {doc.final_summary}
                  </p>
                </div>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Metadata Footer */}
        {(doc.file_type || doc.file_size) && (
          <div className="flex items-center gap-4 mt-4 pt-3 border-t border-gray-100">
            {doc.file_type && (
              <span className="text-xs text-gray-500">
                Format: <span className="font-medium text-gray-700">{doc.file_type}</span>
              </span>
            )}
            {doc.file_size && (
              <span className="text-xs text-gray-500">
                Size: <span className="font-medium text-gray-700">{formatFileSize(doc.file_size)}</span>
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

type Document = {
    id: number
    userId: string
    type: 'file' | 'url' | 'text'
    file_name?: string
    file_size?: number
    url?: string
    text?: string
    final_summary?: string
    length: number
    created_at: string
    file_type?: string | null
}

const UserSummaryHistory = () => {
  const { isSignedIn, user, isLoaded } = useUser()
  const userId = isLoaded && isSignedIn && user ? user.id : 'anonymous'

  const [documents, setDocuments] = useState<Document[]>([])

  useEffect(() => {
    if (!isLoaded) return

    const fetchDocuments = async () => {
      try {
        const response = await fetch(`http://localhost:8000/documents/${userId}`, {
          method: 'GET',
          headers: {
            'accept': 'application/json'
          }
        })
        if (response.ok) {
          const data = await response.json()
          // Extract documents array from the response
          setDocuments(data.documents || [])
        } else {
          console.error('Failed to fetch documents')
        }
      } catch (error) {
        console.error('Error fetching documents:', error)
      }
    }

    if (isSignedIn) {
      fetchDocuments()
    } else {
      setDocuments([])
    }
  }, [userId, isLoaded, isSignedIn])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="max-w-6xl mx-auto px-4 py-2">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl mb-4 shadow-lg">
            <History className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">
            Summary History
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Review and manage all your document summaries in one place
          </p>
        </div>

      

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 mb-8">
          <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <div className="text-2xl font-bold text-gray-900">{documents.length}</div>
            <div className="text-sm text-gray-600">Total Summaries</div>
          </div>
          <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <div className="text-2xl font-bold text-gray-900">
              {documents.filter(d => d.type === 'url').length}
            </div>
            <div className="text-sm text-gray-600">Web Articles</div>
          </div>
          <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <div className="text-2xl font-bold text-gray-900">
              {documents.filter(d => d.type === 'text').length}
            </div>
            <div className="text-sm text-gray-600">Text Documents</div>
          </div>
          <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <div className="text-2xl font-bold text-gray-900">
              {documents.filter(d => d.type === 'file').length}
            </div>
            <div className="text-sm text-gray-600">File Uploads</div>
          </div>
          <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <div className="text-2xl font-bold text-gray-900">
              {documents.reduce((sum, d) => sum + d.length, 0).toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Total Characters</div>
          </div>
        </div>

        {/* document List */}
        <div className="space-y-4">
          {documents.length > 0 ? (
            documents.map((doc) => (
              <DocumentCard key={doc.id} doc={doc} />
            ))
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No summaries yet</h3>
              <p className="text-gray-600 max-w-md mx-auto">
                Start by uploading documents or URLs to create your first summary
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default UserSummaryHistory