import { type Metadata } from 'next'
import {
  ClerkProvider,
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from '@clerk/nextjs'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { Zap } from 'lucide-react'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
  display: 'swap',
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'AI-Powered Solutions',
  keywords: 'nextjs, clerk, authentication, modern design',
  viewport: 'width=device-width, initial-scale=1',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider>
      <html lang="en" className="scroll-smooth">
        <body 
          className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gradient-to-br from-slate-50 via-white to-slate-100 min-h-screen`}
        >
          {/* Navigation Header */}
          <nav className="sticky top-0 z-50 backdrop-blur-md bg-white/80 border-b border-slate-200/60 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16 sm:h-18">
                {/* Logo/Brand */}
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                    <div className="w-4 h-4 bg-white rounded-sm"></div>
                  </div>
                  <span className="text-xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                    AI-monk
                  </span>
                </div>

                {/* Navigation Links (for larger screens) */}
                <div className="hidden md:flex items-center space-x-8">
                  <a 
                    href="/" 
                    className="text-slate-600 hover:text-slate-900 font-medium transition-colors duration-200"
                  >
                    Al Agent
                  </a>
                  <a 
                    href="/sql-test" 
                    className="text-slate-600 hover:text-slate-900 font-medium transition-colors duration-200"
                  >
                    AI DB Dashboard
                  </a>
                  <a 
                    href="/summarize" 
                    className="text-slate-600 hover:text-slate-900 font-medium transition-colors duration-200"
                  >
                    Document Summarizer
                  </a>
                  <a 
                    href="/rag-app" 
                    className="text-slate-600 hover:text-slate-900 font-medium transition-colors duration-200"
                  >
                    RAG App
                  </a>
                  <a 
                    href="/email-classification" 
                    className="text-slate-600 hover:text-slate-900 font-medium transition-colors duration-200"
                  >
                    Email Classification
                  </a>
                </div>

                {/* Authentication Buttons */}
                <div className="flex items-center space-x-3">
                  <SignedOut>
                    <div className="flex items-center space-x-2">
                      <SignInButton>
                        <button className="px-3 py-1.5 rounded-md text-sm font-medium bg-white border border-slate-200 hover:bg-slate-50">
                          Login
                        </button>
                      </SignInButton>
                      <SignUpButton>
                        <button className="px-3 py-1.5 rounded-md text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700">
                          Sign Up
                        </button>
                      </SignUpButton>
                    </div>
                  </SignedOut>

                  <SignedIn>
                    <div className="flex items-center space-x-3">
                     
                      <UserButton 
                        appearance={{
                          elements: {
                            avatarBox: "w-9 h-9 rounded-full ring-2 ring-indigo-100 hover:ring-indigo-200 transition-all"
                          }
                        }}
                      />
                    </div>
                  </SignedIn>
                </div>
              </div>
            </div>
          </nav>

          {/* Main Content */}
          <main className="relative">
            {/* Background Decoration */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute -top-40 -right-32 w-96 h-96 bg-gradient-to-br from-indigo-100/50 to-purple-100/50 rounded-full blur-3xl"></div>
              <div className="absolute -bottom-40 -left-32 w-96 h-96 bg-gradient-to-br from-blue-100/50 to-cyan-100/50 rounded-full blur-3xl"></div>
            </div>
            
            {/* Content Wrapper */}
            <div className="relative z-10">
              {children}
            </div>
          </main>

          {/* Footer (optional) */}
          <footer className="mt-auto border-t border-slate-200/60 bg-white/50 backdrop-blur-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                <div className="flex items-center space-x-3">
                  <div className="w-7 h-7 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-md flex items-center justify-center shadow-md">
                    <Zap className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-slate-600 font-medium">AI-monk</span>
                </div>
                
                <div className="flex items-center space-x-6 text-sm text-slate-600">
                  <a href="#privacy" className="hover:text-slate-900 transition-colors">Privacy</a>
                  <a href="#terms" className="hover:text-slate-900 transition-colors">Terms</a>
                  <a href="#support" className="hover:text-slate-900 transition-colors">Support</a>
                </div>
                
                <p className="text-sm text-slate-500">
                  © 2025 AI-monk. All rights reserved.
                </p>
              </div>
            </div>
          </footer>
        </body>
      </html>
    </ClerkProvider>
  )
}