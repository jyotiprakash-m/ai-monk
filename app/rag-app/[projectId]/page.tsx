"use client";
import React, { useState, useEffect, useRef } from 'react';
import { Send, File, Link, Type, Calendar, Database, User } from 'lucide-react';
import { useParams, useSearchParams } from 'next/navigation';
import { useUser } from '@clerk/nextjs';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: string;
}

interface RAGResponse {
  result: {
    query: string;
    database_type: string;
    user_id: string;
    project_id: string;
    final_answer: string;
  };
}

interface Resource {
  _id?: string;  // MongoDB format
  id?: string;   // PostgreSQL format
  project_id: string;
  type: 'file' | 'url' | 'text';
  reference: string;
  file_type: string | null;
  file_size: number | null;
  created: string;
}

interface ProjectInfo {
  _id?: string;        // MongoDB format
  id?: string;         // PostgreSQL format
  user_id: string;
  database_type: string;
  created: string;
}

// MongoDB response format
interface MongoProjectData {
  _id: string;
  user_id: string;
  database_type: string;
  created: string;
  resources: Resource[];
}

// PostgreSQL response format
interface PostgresProjectData {
  project: {
    id: string;
    user_id: string;
    database_type: string;
    created: string;
  };
  resources: Resource[];
}

type ProjectData = MongoProjectData | PostgresProjectData;

const RagChatProject = () => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [projectData, setProjectData] = useState<ProjectData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  
  // Ref for auto-scrolling to latest message
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Get user and URL parameters
  const { isSignedIn, user, isLoaded } = useUser();
  const params = useParams();
  const searchParams = useSearchParams();
  
  const projectId = params?.projectId ?? null;
  const mode = searchParams?.get('mode') ?? null;
  const userId = isLoaded && isSignedIn && user ? user.id : null;

  // Auto-scroll to bottom when messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch project data
  useEffect(() => {
    const fetchProjectData = async () => {
      if (!projectId || !mode) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `http://localhost:8000/v1/projects/${mode}/${projectId}`
        );
        
        if (!response.ok) {
          throw new Error(`Failed to fetch project data: ${response.status}`);
        }

        const data: ProjectData = await response.json();
        setProjectData(data);
      } catch (err: any) {
        setError(err.message || 'Unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (isLoaded) {
      fetchProjectData();
    }
  }, [projectId, mode, isLoaded]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return 'N/A';
    const kb = bytes / 1024;
    const mb = kb / 1024;
    return mb > 1 ? `${mb.toFixed(2)} MB` : `${kb.toFixed(2)} KB`;
  };

  const getResourceIcon = (type: Resource['type']) => {
    switch (type) {
      case 'file':
        return <File className="w-5 h-5 text-blue-500" />;
      case 'url':
        return <Link className="w-5 h-5 text-green-500" />;
      case 'text':
        return <Type className="w-5 h-5 text-purple-500" />;
      default:
        return <File className="w-5 h-5 text-muted-foreground" />;
    }
  };

  // Helper functions to handle different response formats
  const getProjectInfo = (data: ProjectData): ProjectInfo => {
    if ('project' in data) {
      // PostgreSQL format
      return data.project;
    } else {
      // MongoDB format
      return data as MongoProjectData;
    }
  };

  const getProjectId = (data: ProjectData): string => {
    const info = getProjectInfo(data);
    return info._id || info.id || '';
  };

  const getResources = (data: ProjectData): Resource[] => {
    return data.resources;
  };

  const getResourceId = (resource: Resource): string => {
    return resource._id || resource.id || '';
  };




  const handleSendMessage = async () => {
    if (message.trim() && userId && projectData && !isProcessing) {
      const newMessage: Message = {
        id: Date.now().toString(),
        text: message,
        isUser: true,
        timestamp: new Date().toLocaleTimeString()
      };
      setMessages([...messages, newMessage]);
      
      const currentMessage = message;
      setMessage('');
      setIsProcessing(true);
      
      try {
        // Prepare the form data for the RAG API
        const formData = new URLSearchParams();
        formData.append('query', currentMessage);
        formData.append('user_id', userId);
        formData.append('database_type', getProjectInfo(projectData).database_type);
        formData.append('project_id', getProjectId(projectData));

        const response = await fetch('http://localhost:8000/v1/retrieval-graph/run', {
          method: 'POST',
          headers: {
            'accept': 'application/json',
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: RAGResponse = await response.json();
        
        // Add bot response with the final answer
        const botResponse: Message = {
          id: (Date.now() + 1).toString(),
          text: data.result.final_answer,
          isUser: false,
          timestamp: new Date().toLocaleTimeString()
        };
        setMessages(prev => [...prev, botResponse]);
        
      } catch (error) {
        console.error('Error calling RAG API:', error);
        
        // Add error message
        const errorResponse: Message = {
          id: (Date.now() + 1).toString(),
          text: 'Sorry, I encountered an error while processing your question. Please try again.',
          isUser: false,
          timestamp: new Date().toLocaleTimeString()
        };
        setMessages(prev => [...prev, errorResponse]);
      } finally {
        setIsProcessing(false);
      }
    }
  };
    const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  console.log("Project data:", projectData);

  return (
    <div className="flex h-[90vh] bg-gray-100">
      {/* Loading State */}
      {loading && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading project data...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="text-red-400 mb-4">⚠️</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error loading project</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* No Data State */}
      {!loading && !error && !projectData && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Database className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No project found</h3>
            <p className="text-gray-600 mb-4">
              {!userId ? 'Please sign in to view project details.' : 'No project data available for this ID.'}
            </p>
            <button 
              onClick={() => window.history.back()} 
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Go Back
            </button>
          </div>
        </div>
      )}

      {/* Main Content - only show when data is loaded */}
      {!loading && !error && projectData && (
        <>
          {/* Left Sidebar - Project Metadata */}
          <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800 mb-2">RAG Project</h2>
              <div className="text-sm text-gray-600">
                <div className="flex items-center gap-2 mb-1">
                  <User className="w-4 h-4" />
                  <span>User ID: {getProjectInfo(projectData).user_id}</span>
                </div>
                <div className="flex items-center gap-2 mb-1">
                  <Database className="w-4 h-4" />
                  <span>DB: {getProjectInfo(projectData).database_type}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>Created: {formatDate(getProjectInfo(projectData).created)}</span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    {getResources(projectData).length} resource{getResources(projectData).length !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              <div className="p-4">
                <h3 className="font-medium text-gray-800 mb-3">Data Sources</h3>
                <div className="space-y-3">
                  {getResources(projectData).map((resource: Resource) => (
                <div key={getResourceId(resource)} className="bg-gray-50 rounded-lg p-3 border">
                  <div className="flex items-start gap-2 mb-2">
                    {getResourceIcon(resource.type)}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm text-gray-800 truncate">
                        {resource.reference}
                      </div>
                      <div className="text-xs text-gray-500 capitalize">
                        {resource.type} {resource.file_type && `(${resource.file_type})`}
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-gray-400 space-y-1">
                    <div>Size: {formatFileSize(resource.file_size)}</div>
                    <div>Added: {formatDate(resource.created)}</div>
                    <div className="truncate">ID: {resource._id}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="text-xs text-gray-500">
            Project ID: {getProjectId(projectData)}
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-4">
          <h1 className="text-xl font-semibold text-gray-800">RAG Assistant</h1>
          <p className="text-sm text-gray-600">Ask questions about your data sources</p>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
                <div className="text-center">
                    <div className="text-gray-400 mb-2">
                        <File className="w-12 h-12 mx-auto mb-4" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-600 mb-2">
                        Start a conversation
                    </h3>
                    <p className="text-gray-500">
                        Ask questions about your uploaded documents, URLs, and text data.
                    </p>
                </div>
            </div>
        ) : (
            messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}>
                    <div className={`flex items-end gap-3 ${msg.isUser ? 'flex-row-reverse' : 'flex-row'} w-full max-w-3xl ${msg.isUser ? 'ml-auto' : 'mr-auto'}`}>
                        {/* Icon */}
                        <div className={`flex-shrink-0 p-2 rounded-full ${msg.isUser ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-600'}`}>
                            {msg.isUser ? (
                                <User className="w-4 h-4" />
                            ) : (
                                <File className="w-4 h-4" />
                            )}
                        </div>

                        {/* Message bubble */}
                        <div className={`rounded-lg px-4 py-2 ${msg.isUser ? 'bg-blue-500 text-white' : 'bg-white border border-gray-200 text-gray-800'} max-w-full`}>
                            <div className="whitespace-pre-wrap">{msg.text}</div>
                            <div className={`text-xs mt-1 ${msg.isUser ? 'text-blue-100' : 'text-gray-400'}`}>
                                {msg.timestamp}
                            </div>
                        </div>
                    </div>
                </div>
            ))
        )}
        
        {/* Processing indicator */}
        {isProcessing && (
          <div className="flex justify-start mb-4">
            <div className="flex items-center gap-3 w-full max-w-3xl mr-auto">
              <div className="flex-shrink-0 p-2 rounded-full bg-gray-300 text-gray-600">
                <File className="w-4 h-4" />
              </div>
              <div className="bg-white border border-gray-200 text-gray-800 rounded-lg px-4 py-2">
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  <span>Processing your question...</span>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Invisible element for auto-scroll */}
        <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="bg-white border-t border-gray-200 p-4">
          <div className="flex justify-between  items-center gap-2">
            <div className="flex-1 relative">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask a question about your data..."
                className="w-full resize-none border border-gray-300 rounded-lg px-2 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={1}
                style={{ minHeight: '44px', maxHeight: '120px' }}
              />
            </div>
            <button
              onClick={handleSendMessage}
              disabled={!message.trim() || isProcessing}
              className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white rounded-lg p-3 transition-colors duration-200"
            >
              {isProcessing ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>
          
        </div>
      </div>
        </>
      )}
    </div>
  );
};

export default RagChatProject;