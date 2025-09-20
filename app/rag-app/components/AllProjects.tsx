"use client"
import React, { useState, useEffect } from 'react'
import { ChevronDown, ChevronRight, Database, File, Link, Type, Calendar, HardDrive } from 'lucide-react'
import { useUser } from '@clerk/nextjs'

interface Resource {
  id: string;
  type: 'file' | 'url' | 'text';
  reference: string;
  file_type: string | null;
  file_size: number | null;
  created: string;
}

interface Project {
  id: string;
  user_id: string;
  database_type: string;
  created: string;
  resources: Resource[];
}


const AllProjects = () => {
  const [expandedProjects, setExpandedProjects] = useState<Record<string, boolean>>({})
  const [projectsData, setProjectsData] = useState<Project[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  
  const { isSignedIn, user, isLoaded } = useUser()
  const userId = isLoaded && isSignedIn && user ? user.id : 'anonymous'

  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(`http://localhost:8000/v1/projects/all?user_id=${userId}`)
        if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`)
        const data = await res.json()
        setProjectsData(data)
      } catch (err: any) {
        setError(err.message || 'Unknown error')
      } finally {
        setLoading(false)
      }
    }
    
    if (userId && userId !== 'anonymous') {
      fetchProjects()
    } else {
      setLoading(false)
    }
  }, [userId])

  const toggleProject = (projectId: string) => {
    setExpandedProjects(prev => ({
      ...prev,
      [projectId]: !prev[projectId]
    }))
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return 'N/A'
    const kb = bytes / 1024
    const mb = kb / 1024
    if (mb >= 1) return `${mb.toFixed(2)} MB`
    return `${kb.toFixed(2)} KB`
  }

  const getResourceIcon = (type: Resource['type']) => {
    switch (type) {
      case 'file': return <File className="w-4 h-4" />
      case 'url': return <Link className="w-4 h-4" />
      case 'text': return <Type className="w-4 h-4" />
      default: return <File className="w-4 h-4" />
    }
  }

  const getResourceTypeColor = (type: Resource['type']) => {
    switch (type) {
      case 'file': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'url': return 'bg-green-100 text-green-800 border-green-200'
      case 'text': return 'bg-purple-100 text-purple-800 border-purple-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getDatabaseIcon = (dbType: string) => {
    return <Database className="w-5 h-5" />
  }

  const getDatabaseColor = (dbType: string) => {
    switch (dbType.toLowerCase()) {
      case 'mongodb': return 'bg-green-600'
      case 'postgres': return 'bg-blue-600'
      case 'mysql': return 'bg-orange-600'
      default: return 'bg-gray-600'
    }
  }



  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto">
        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading projects...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <div className="text-red-400 mr-3">⚠️</div>
              <div>
                <h3 className="text-red-800 font-medium">Error loading projects</h3>
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Content - only show when not loading */}
        {!loading && (
          <>
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-4">
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100">
                <Database className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Total Projects</p>
                <p className="text-2xl font-semibold text-gray-900">{projectsData.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100">
                <File className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Total Resources</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {projectsData.reduce((acc, project) => acc + project.resources.length, 0)}
                </p>
              </div>
            </div>
          </div>
        </div>

        <hr className='mb-4' />

        {/* Projects List */}
        <div className="space-y-4">
          {projectsData.map((project) => (
            <div key={project.id} className="bg-white rounded-xl shadow-sm border hover:shadow-md transition-shadow">
              {/* Project Header */}
              <div 
                className="p-6 cursor-pointer"
                onClick={() => toggleProject(project.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      {expandedProjects[project.id] ? 
                        <ChevronDown className="w-5 h-5 text-gray-500" /> : 
                        <ChevronRight className="w-5 h-5 text-gray-500" />
                      }
                      <div className={`p-2 rounded-lg ${getDatabaseColor(project.database_type)}`}>
                        {getDatabaseIcon(project.database_type)}
                        <span className="text-white text-xs font-medium ml-1">
                          {project.database_type.toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Project {project.id.slice(0, 8)}...
                      </h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                        <span className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {formatDate(project.created)}
                        </span>
                        <span>User ID: {project.user_id}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="px-3 py-1 bg-gray-100 text-gray-600 text-sm font-medium rounded-full">
                      {project.resources.length} resources
                    </span>

                    {/* Navigate Button */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation()
                            const url = `/rag-app/${encodeURIComponent(project.id)}?mode=${encodeURIComponent(project.database_type)}`
                            window.location.href = url
                        }}
                        className="ml-2 inline-flex items-center px-3 py-1 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 focus:outline-none"
                        aria-label={`Open project ${project.id}`}
                    >
                        <Link className="w-4 h-4 mr-2" />
                        Open
                    </button>
                  </div>
                </div>
              </div>

              {/* Project Resources (Expandable) */}
              {expandedProjects[project.id] && (
                <div className="px-6 pb-6">
                  <div className="border-t pt-6">
                    <h4 className="text-md font-semibold text-gray-900 mb-4">Resources</h4>
                    <div className="grid gap-3">
                      {project.resources.map((resource) => (
                        <div key={resource.id} className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="flex items-center space-x-2">
                                {getResourceIcon(resource.type)}
                                <span className={`px-2 py-1 text-xs font-medium rounded border ${getResourceTypeColor(resource.type)}`}>
                                  {resource.type}
                                </span>
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">{resource.reference}</p>
                                <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                                  <span>{formatDate(resource.created)}</span>
                                  {resource.file_type && (
                                    <span className="uppercase">{resource.file_type}</span>
                                  )}
                                  {resource.file_size && (
                                    <span>{formatFileSize(resource.file_size)}</span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="text-xs text-gray-400 font-mono">
                              ID: {resource.id.slice(0, 8)}...
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Empty State */}
        {projectsData.length === 0 && !loading && !error && (
          <div className="text-center py-12">
            <Database className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {userId === 'anonymous' ? 'Please sign in to view your projects' : 'No projects found'}
            </h3>
            <p className="text-gray-500">
              {userId === 'anonymous' 
                ? 'Sign in to access your RAG projects and data sources.' 
                : 'Get started by creating your first project.'
              }
            </p>
          </div>
        )}
          </>
        )}
      </div>
    </div>
  )
}

export default AllProjects