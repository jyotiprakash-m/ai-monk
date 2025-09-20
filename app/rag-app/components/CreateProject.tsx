"use client"

import * as React from "react"
import { useUser } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Database, FileText, Globe, Type } from "lucide-react"

// Define proper types for form data
type DatabaseType = "mongodb" | "postgres" | ""
type ProcessingMode = "single" | "multiple" | ""
type DataSourceTab = "files" | "urls" | "text"

interface FormData {
  database_type: DatabaseType
  mode: ProcessingMode
  user_id: string
  files: FileList | null
  urls: string
  texts: string
}

interface SubmissionData extends FormData {
  textEntries: string[]
  urlList: string[]
}

export function CreateProject() {
  // Clerk authentication
  const { isSignedIn, user, isLoaded } = useUser()
  const userId = isLoaded && isSignedIn && user ? user.id : 'anonymous'

  const [formData, setFormData] = React.useState<FormData>({
    database_type: "",
    mode: "",
    user_id: userId,
    files: null,
    urls: "",
    texts: "",
  })

  // Update user_id when authentication state changes
  React.useEffect(() => {
    setFormData(prev => ({ ...prev, user_id: userId }))
  }, [userId])

  const [activeTab, setActiveTab] = React.useState<DataSourceTab>("files")
  
  // For multiple mode - track multiple text entries
  const [textEntries, setTextEntries] = React.useState<string[]>([])
  const [currentText, setCurrentText] = React.useState<string>("")
  
  // For multiple mode - track URLs separately
  const [urlEntries, setUrlEntries] = React.useState<string[]>([])
  const [currentUrl, setCurrentUrl] = React.useState<string>("")
  
  // Loading and submission state
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false)
  const [submitStatus, setSubmitStatus] = React.useState<{
    type: 'success' | 'error' | null
    message: string
  }>({ type: null, message: '' })

  const handleDatabaseSelect = (database: DatabaseType) => {
    setFormData(prev => ({ ...prev, database_type: database }))
  }

  const handleModeSelect = (mode: ProcessingMode) => {
    setFormData(prev => ({ ...prev, mode: mode }))
    // Clear multiple entries when switching modes
    setTextEntries([])
    setCurrentText("")
    setUrlEntries([])
    setCurrentUrl("")
  }

  // Helper functions for multiple mode
  const addTextEntry = () => {
    if (currentText.trim()) {
      setTextEntries(prev => [...prev, currentText.trim()])
      setCurrentText("")
    }
  }

  const removeTextEntry = (index: number) => {
    setTextEntries(prev => prev.filter((_, i) => i !== index))
  }

  const addUrlEntry = () => {
    if (currentUrl.trim()) {
      setUrlEntries(prev => [...prev, currentUrl.trim()])
      setCurrentUrl("")
    }
  }

  const removeUrlEntry = (index: number) => {
    setUrlEntries(prev => prev.filter((_, i) => i !== index))
  }

  const removeFileEntry = (index: number) => {
    if (formData.files) {
      const dt = new DataTransfer()
      const fileArray = Array.from(formData.files)
      
      fileArray.forEach((file, i) => {
        if (i !== index) {
          dt.items.add(file)
        }
      })
      
      setFormData(prev => ({ ...prev, files: dt.files.length > 0 ? dt.files : null }))
    }
  }

  const getUrlList = () => {
    return formData.mode === "multiple" ? urlEntries.length : 
           formData.urls.split('\n').filter(url => url.trim()).length
  }

  const getFileCount = () => {
    return formData.files ? formData.files.length : 0
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (formData.mode === "single") {
      // Clear other data sources for single mode
      setFormData(prev => ({ 
        ...prev, 
        files: e.target.files,
        urls: "",
        texts: ""
      }))
    } else {
      setFormData(prev => ({ ...prev, files: e.target.files }))
    }
  }

  const handleUrlsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (formData.mode === "single") {
      // Clear other data sources for single mode
      setFormData(prev => ({ 
        ...prev, 
        urls: e.target.value,
        files: null,
        texts: ""
      }))
    } else {
      setFormData(prev => ({ ...prev, urls: e.target.value }))
    }
  }

  const handleTextsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (formData.mode === "single") {
      // Clear other data sources for single mode
      setFormData(prev => ({ 
        ...prev, 
        texts: e.target.value,
        files: null,
        urls: ""
      }))
    } else {
      setFormData(prev => ({ ...prev, texts: e.target.value }))
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    setSubmitStatus({ type: null, message: '' })
    
    try {
      // Create FormData for multipart/form-data submission
      const formDataToSubmit = new FormData()
      
      // Add required fields
      formDataToSubmit.append('user_id', formData.user_id)
      formDataToSubmit.append('database_type', formData.database_type)
      
      // Add files if present
      if (formData.files && formData.files.length > 0) {
        Array.from(formData.files).forEach(file => {
          formDataToSubmit.append('files', file)
        })
      }
      
      // Add URLs if present
      if (formData.mode === "single" && formData.urls.trim()) {
        formDataToSubmit.append('urls', formData.urls.trim())
      } else if (formData.mode === "multiple" && urlEntries.length > 0) {
        urlEntries.forEach(url => {
          formDataToSubmit.append('urls', url)
        })
      }
      
      // Add texts if present
      if (formData.mode === "single" && formData.texts.trim()) {
        formDataToSubmit.append('texts', formData.texts.trim())
      } else if (formData.mode === "multiple" && textEntries.length > 0) {
        textEntries.forEach(text => {
          formDataToSubmit.append('texts', text)
        })
      }
      
      console.log("🚀 Submitting to FastAPI /v1/rag-graph/run endpoint...")
      
      // Make API call to FastAPI endpoint
      const response = await fetch('http://localhost:8000/v1/rag-graph/run', {
        method: 'POST',
        body: formDataToSubmit,
        // Don't set Content-Type header - let browser set it with boundary for multipart
      })
      
      if (response.ok) {
        const result = await response.json()
        console.log("✅ Project created successfully:", result)
        setSubmitStatus({ 
          type: 'success', 
          message: `Project created successfully! Project ID: ${result.result.project_id || 'N/A'}` 
        })
        // Optional: Reset form or close drawer after success
        // setFormData({ database_type: "", mode: "", files: null, urls: "", texts: "" })
        // setTextEntries([])
      } else {
        const error = await response.text()
        console.error("❌ Failed to create project:", error)
        setSubmitStatus({ 
          type: 'error', 
          message: `Failed to create project: ${error}` 
        })
      }
      
    } catch (error) {
      console.error("❌ Error submitting form:", error)
      setSubmitStatus({ 
        type: 'error', 
        message: `Network error: ${error instanceof Error ? error.message : 'Unknown error'}` 
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const isFormValid = () => {
    // User ID is always available from Clerk, so we don't need to check it
    if (!formData.database_type || !formData.mode) {
      return false
    }

    if (formData.mode === "single") {
      // For single mode, only one data source should be provided
      const hasFile = formData.files && formData.files.length > 0
      const hasUrl = formData.urls.trim().length > 0
      const hasText = formData.texts.trim().length > 0
      
      const dataSources = [hasFile, hasUrl, hasText].filter(Boolean)
      return dataSources.length === 1
    } else {
      // For multiple mode, at least one data source should be provided
      const hasFiles = formData.files && formData.files.length > 0
      const hasUrls = urlEntries.length > 0
      const hasTexts = textEntries.length > 0
      
      return hasFiles || hasUrls || hasTexts
    }
  }

  return (
    <Drawer direction="right" >
      <DrawerTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <Database className="h-4 w-4" />
          Create Project
        </Button>
      </DrawerTrigger>
      <DrawerContent className="h-full w-[400px] ml-auto">
        <div className="mx-auto w-full max-w-sm h-full flex flex-col">
          <DrawerHeader>
            <DrawerTitle>Create New Project</DrawerTitle>
            <DrawerDescription>Configure your database and data sources.</DrawerDescription>
          </DrawerHeader>
          
          <div className="flex-1 p-4 pb-0 overflow-y-auto">
            {/* User ID Input */}
            <div className="mb-6">
              <Label htmlFor="user-id" className="text-sm font-medium mb-2 block">User ID</Label>
              <Input
                id="user-id"
                type="text"
                placeholder={isLoaded ? (isSignedIn ? "Authenticated user ID" : "Anonymous user") : "Loading..."}
                value={formData.user_id}
                disabled={true}
                className="w-full bg-gray-50 text-gray-600"
              />
              {isLoaded && (
                <p className="text-xs text-gray-500 mt-1">
                  {isSignedIn && user ? 
                    `Signed in as: ${user.emailAddresses?.[0]?.emailAddress || user.username || 'User'}` : 
                    'Not signed in - using anonymous ID'
                  }
                </p>
              )}
            </div>

            {/* Database Selection */}
            <div className="mb-6">
              <Label className="text-sm font-medium mb-3 block">Select Database Type</Label>
              <div className="grid grid-cols-2  gap-2">
                <div 
                  onClick={() => handleDatabaseSelect("mongodb")}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    formData.database_type === "mongodb" 
                      ? "border-blue-500 bg-blue-50 text-blue-700" 
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Database className="h-4 w-4" />
                    MongoDB
                  </div>
                </div>
                <div 
                  onClick={() => handleDatabaseSelect("postgres")}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    formData.database_type === "postgres" 
                      ? "border-blue-500 bg-blue-50 text-blue-700" 
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Database className="h-4 w-4" />
                    PostgreSQL
                  </div>
                </div>
              </div>
            </div>

            {/* Processing Mode - Show only after database is selected */}
            {formData.database_type && (
              <div className="mb-6 animate-in slide-in-from-top-2 duration-300">
                <Label className="text-sm font-medium mb-3 block">Processing Mode</Label>
                <RadioGroup value={formData.mode} onValueChange={(value) => handleModeSelect(value as ProcessingMode)}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="single" id="single" />
                    <Label htmlFor="single">Single Document</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="multiple" id="multiple" />
                    <Label htmlFor="multiple">Multiple Documents</Label>
                  </div>
                </RadioGroup>
              </div>
            )}

            {/* Data Sources - Show only after mode is selected */}
            {formData.database_type && formData.mode && (
              <div className="mb-6 animate-in slide-in-from-top-2 duration-500">
                <Label className="text-sm font-medium mb-3 block">Data Sources</Label>
                {formData.mode === "single" && (
                  <p className="text-xs text-amber-600 mb-3 p-2 bg-amber-50 rounded border border-amber-200">
                    📝 Single mode: Choose only one data source method
                  </p>
                )}
                {formData.mode === "multiple" && (
                  <p className="text-xs text-blue-600 mb-3 p-2 bg-blue-50 rounded border border-blue-200">
                    🔄 Multiple mode: Add multiple items in any combination
                  </p>
                )}
                <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as DataSourceTab)}>
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="files" className="flex items-center gap-1">
                      <FileText className="h-3 w-3" />
                      Files
                      {formData.mode === "single" && formData.files && (
                        <span className="ml-1 h-2 w-2 bg-green-500 rounded-full"></span>
                      )}
                      {formData.mode === "multiple" && getFileCount() > 0 && (
                        <span className="ml-1 px-1.5 py-0.5 text-xs bg-blue-500 text-white rounded-full">
                          {getFileCount()}
                        </span>
                      )}
                    </TabsTrigger>
                    <TabsTrigger value="urls" className="flex items-center gap-1">
                      <Globe className="h-3 w-3" />
                      URLs
                      {formData.mode === "single" && formData.urls && (
                        <span className="ml-1 h-2 w-2 bg-green-500 rounded-full"></span>
                      )}
                      {formData.mode === "multiple" && getUrlList() > 0 && (
                        <span className="ml-1 px-1.5 py-0.5 text-xs bg-blue-500 text-white rounded-full">
                          {getUrlList()}
                        </span>
                      )}
                    </TabsTrigger>
                    <TabsTrigger value="text" className="flex items-center gap-1">
                      <Type className="h-3 w-3" />
                      Text
                      {formData.mode === "single" && formData.texts && (
                        <span className="ml-1 h-2 w-2 bg-green-500 rounded-full"></span>
                      )}
                      {formData.mode === "multiple" && textEntries.length > 0 && (
                        <span className="ml-1 px-1.5 py-0.5 text-xs bg-blue-500 text-white rounded-full">
                          {textEntries.length}
                        </span>
                      )}
                    </TabsTrigger>
                  </TabsList>
                
                <TabsContent value="files" className="mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="file-upload" className="text-sm">Upload Files</Label>
                    <Input
                      id="file-upload"
                      type="file"
                      multiple={formData.mode === "multiple"}
                      accept=".pdf,.csv,.txt"
                      onChange={handleFileChange}
                      className="cursor-pointer"
                    />
                    <p className="text-xs text-gray-500">
                      Supported formats: PDF, CSV, TXT
                      {formData.mode === "multiple" && " (Multiple files allowed)"}
                    </p>
                    
                    {/* Show selected files for multiple mode */}
                    {formData.mode === "multiple" && formData.files && formData.files.length > 0 && (
                      <div className="mt-3 space-y-1">
                        <Label className="text-xs text-gray-600">Selected Files:</Label>
                        <div className="max-h-24 overflow-y-auto space-y-1">
                          {Array.from(formData.files).map((file, index) => (
                            <div key={index} className="flex items-center gap-2 p-1.5 bg-gray-50 rounded text-xs">
                              <FileText className="h-3 w-3 text-gray-500" />
                              <span className="flex-1 truncate">{file.name}</span>
                              <span className="text-gray-400">({(file.size / 1024).toFixed(1)}KB)</span>
                              <Button
                                type="button"
                                onClick={() => removeFileEntry(index)}
                                variant="ghost"
                                size="sm"
                                className="h-5 w-5 p-0 text-red-500 hover:text-red-700"
                              >
                                ×
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </TabsContent>
                
                <TabsContent value="urls" className="mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="urls" className="text-sm">Website URLs</Label>
                    
                    {formData.mode === "single" ? (
                      <Textarea
                        id="urls"
                        placeholder="Enter a single URL:\nhttps://example.com"
                        value={formData.urls}
                        onChange={handleUrlsChange}
                        rows={4}
                      />
                    ) : (
                      <div className="space-y-3">
                        {/* Add new URL entry */}
                        <div className="space-y-2">
                          <Input
                            id="url-input"
                            type="url"
                            placeholder="Enter URL (e.g., https://example.com)"
                            value={currentUrl}
                            onChange={(e) => setCurrentUrl(e.target.value)}
                          />
                          <Button 
                            type="button"
                            onClick={addUrlEntry}
                            disabled={!currentUrl.trim()}
                            variant="outline"
                            size="sm"
                            className="w-full"
                          >
                            Add URL ({urlEntries.length + 1})
                          </Button>
                        </div>
                        
                        {/* Display added URL entries */}
                        {urlEntries.length > 0 && (
                          <div className="space-y-2">
                            <Label className="text-xs text-gray-600">Added URLs:</Label>
                            <div className="max-h-32 overflow-y-auto space-y-2">
                              {urlEntries.map((url, index) => (
                                <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded border">
                                  <Globe className="h-3 w-3 text-gray-500 flex-shrink-0" />
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs text-gray-700 truncate">
                                      {url}
                                    </p>
                                  </div>
                                  <Button
                                    type="button"
                                    onClick={() => removeUrlEntry(index)}
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0 text-red-500 hover:text-red-700 flex-shrink-0"
                                  >
                                    ×
                                  </Button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </TabsContent>
                
                <TabsContent value="text" className="mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="text-input" className="text-sm">Direct Text Input</Label>
                    
                    {formData.mode === "single" ? (
                      <Textarea
                        id="text-input"
                        placeholder="Enter your text content here..."
                        value={formData.texts}
                        onChange={handleTextsChange}
                        rows={6}
                      />
                    ) : (
                      <div className="space-y-3">
                        {/* Add new text entry */}
                        <div className="space-y-2">
                          <Textarea
                            id="text-input"
                            placeholder="Enter text content and click 'Add Text' to add multiple entries..."
                            value={currentText}
                            onChange={(e) => setCurrentText(e.target.value)}
                            rows={4}
                          />
                          <Button 
                            type="button"
                            onClick={addTextEntry}
                            disabled={!currentText.trim()}
                            variant="outline"
                            size="sm"
                            className="w-full"
                          >
                            Add Text Entry ({textEntries.length + 1})
                          </Button>
                        </div>
                        
                        {/* Display added text entries */}
                        {textEntries.length > 0 && (
                          <div className="space-y-2">
                            <Label className="text-xs text-gray-600">Added Text Entries:</Label>
                            <div className="max-h-32 overflow-y-auto space-y-2">
                              {textEntries.map((text, index) => (
                                <div key={index} className="flex items-start gap-2 p-2 bg-gray-50 rounded border">
                                  <div className="flex-1">
                                    <p className="text-xs text-gray-700 truncate">
                                      {text.length > 50 ? `${text.substring(0, 50)}...` : text}
                                    </p>
                                  </div>
                                  <Button
                                    type="button"
                                    onClick={() => removeTextEntry(index)}
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                                  >
                                    ×
                                  </Button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
              </div>
            )}
          </div>

          <DrawerFooter>
            {/* Status Messages */}
            {submitStatus.type && (
              <div className={`p-3 rounded-lg text-sm ${
                submitStatus.type === 'success' 
                  ? 'bg-green-50 text-green-700 border border-green-200' 
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
                {submitStatus.message}
              </div>
            )}
            
            <Button 
              onClick={handleSubmit}
              disabled={!isFormValid() || isSubmitting}
              className="w-full"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Processing...
                </div>
              ) : !isFormValid() ? 
                (formData.mode === "single" ? 
                  "Select database, mode & one data source" : 
                  "Select database, mode & data sources"
                ) : 
                "Create Project"
              }
            </Button>
            <DrawerClose asChild>
              <Button variant="outline" className="w-full" disabled={isSubmitting}>
                Cancel
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  )
}