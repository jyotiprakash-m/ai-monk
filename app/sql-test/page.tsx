"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Shield, 
  Database, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  HelpCircle,
  ChevronDown,
  Loader2,
  Send,
  Code,
  Info
} from "lucide-react";
import Image from "next/image";

export default function SQLTestPage() {
  const [question, setQuestion] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [generatedQuery, setGeneratedQuery] = useState("");
  const [message, setMessage] = useState("");
  const [result, setResult] = useState("");
  //@typescript-eslint/ban-ts-comment
  const [resultData, setResultData] = useState<any[]>([]);
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [showApproval, setShowApproval] = useState(false);
  const [showHelp, setShowHelp] = useState(false);


  const API_BASE_URL = "http://localhost:8000";

  // Function to safely parse result data for the table
  const parseResultData = (resultString: string) => {
    try {
      // If the result is already an array, return it
      if (Array.isArray(resultString)) {
        return resultString;
      }
      
      // If it's a string representation of Python tuples/list
      if (typeof resultString === 'string' && resultString.trim().startsWith('[')) {
        // Try to parse JSON first (if backend sends proper JSON)
        try {
          return JSON.parse(resultString);
        } catch {
          // If not JSON, try to evaluate Python-like syntax safely
          // This is a basic parser for the tuple format you showed
          const cleaned = resultString
            .replace(/datetime\.datetime\([^)]+\)/g, (match) => {
              // Extract datetime components and create ISO string
              const nums = match.match(/\d+/g);
              if (nums && nums.length >= 6) {
                const [year, month, day, hour, minute, second] = nums;
                const date = new Date(+year, +month - 1, +day, +hour, +minute, +second);
                return `"${date.toISOString()}"`;
              }
              return '"Invalid Date"';
            })
            .replace(/Decimal\('([^']+)'\)/g, '"$1"') // Convert Decimal('123.45') to "123.45"
            .replace(/\(/g, '[') // Convert tuples to arrays
            .replace(/\)/g, ']');
          
          return JSON.parse(cleaned);
        }
      }
      
      // If it's a simple string, wrap it in a single row
      return [[resultString]];
    } catch (error) {
      console.error('Error parsing result data:', error);
      // Return empty array if parsing fails
      return [];
    }
  };

  const submitQuestion = async () => {
    if (!question.trim()) {
      alert("Please enter a question");
      return;
    }
    setLoading(true);
    setMessage("Processing...");
    setShowApproval(false);
    setResult("");
    setResultData([]);
    setAnswer("");

    try {
      const response = await fetch(`${API_BASE_URL}/query`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setMessage(`Error: ${errorData.detail}`);
        return;
      }

      const data = await response.json();
      setSessionId(data.session_id);
      setGeneratedQuery(data.query);
      setMessage(data.message);
      if (!data.query.startsWith("--")) {
        setShowApproval(true);
      }
    } catch (error) {
      setMessage(`Error: ${(error as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  const approveQuery = async (approve: boolean) => {
    if (!sessionId) return;
    setLoading(true);
    setMessage("Processing approval...");

    try {
      const response = await fetch(`${API_BASE_URL}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId, approve }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setMessage(`Error: ${errorData.detail}`);
        return;
      }

      const data = await response.json();
      setResult(data.result);
      setAnswer(data.answer);

      
      // Prioritize structured result_data from backend
      if (data.result_data) {
        try {
          const parsedData = JSON.parse(data.result_data);
          console.log('Using structured result_data:', parsedData);
          setResultData(Array.isArray(parsedData) ? parsedData : []);
        } catch (error) {
          console.error('Error parsing result_data:', error);
          console.log('Falling back to parsing raw result');
          setResultData(parseResultData(data.result));
        }
      } else {
        console.log('No result_data available, parsing raw result');
        setResultData(parseResultData(data.result));
      }
      
      setMessage("");
    } catch (error) {
      setMessage(`Error: ${(error as Error).message}`);
    } finally {
      setLoading(false);
      setShowApproval(false);
      setSessionId(null);
    }
  };

  const safeQueries = [
    "What are the top 10 products?",
    "How many customers are from California?",
    "What is the total value of all orders?",
    "Which products are running low on stock?"
  ];

  const blockedQueries = [
    "Any request to delete, update, or modify data",
    "Attempts to access sensitive information",
    "SQL injection attempts",
    "Unauthorized table access"
  ];

  const securityFeatures = [
    "Read-only database access",
    "SQL injection prevention",
    "Sensitive data protection",
    "Query validation and approval"
  ];

  const availableTables = [
    { name: "products", desc: "Product catalog" },
    { name: "categories", desc: "Product categories" },
    { name: "customers", desc: "Customer information" },
    { name: "orders", desc: "Order records" },
    { name: "order_items", desc: "Order line items" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-4">
      <div className="container mx-auto max-w-4xl space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Shield className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold tracking-tight">Secure SQL QA System</h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Ask questions about your database using natural language with built-in security protection
          </p>
        </div>

        {/* Help Section */}
        <Card>
          <Collapsible open={showHelp} onOpenChange={setShowHelp}>
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <HelpCircle className="h-5 w-5" />
                    <CardTitle>Help & Documentation</CardTitle>
                  </div>
                  <ChevronDown className={`h-4 w-4 transition-transform ${showHelp ? 'rotate-180' : ''}`} />
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  
                  {/* Safe Queries */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <h3 className="font-semibold text-green-700">Safe Queries</h3>
                    </div>
                    <div className="space-y-2">
                      {safeQueries.map((query, idx) => (
                        <div key={idx} className="flex items-start gap-2 p-2 rounded-md bg-green-50 border border-green-200">
                          <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-green-800">{query}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Blocked Queries */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <XCircle className="h-5 w-5 text-red-600" />
                      <h3 className="font-semibold text-red-700">Blocked Queries</h3>
                    </div>
                    <div className="space-y-2">
                      {blockedQueries.map((query, idx) => (
                        <div key={idx} className="flex items-start gap-2 p-2 rounded-md bg-red-50 border border-red-200">
                          <XCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-red-800">{query}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Security Features */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-blue-600" />
                    <h3 className="font-semibold text-blue-700">Security Features</h3>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-2">
                    {securityFeatures.map((feature, idx) => (
                      <Badge key={idx} variant="secondary" className="justify-start p-2">
                        <Shield className="h-3 w-3 mr-2" />
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Available Tables */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Database className="h-5 w-5 text-purple-600" />
                    <h3 className="font-semibold text-purple-700">Available Tables</h3>
                  </div>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {availableTables.map((table, idx) => (
                      <Card key={idx} className="p-3">
                        <div className="space-y-1">
                          <Badge variant="outline" className="font-mono">{table.name}</Badge>
                          <p className="text-xs text-muted-foreground">{table.desc}</p>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Show db  */}
                <Image src="/products.png" alt="Database Schema" width={800} height={400} className="rounded-md border" />
              
              
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>

        {/* Query Input */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="h-5 w-5" />
              Ask Your Question
            </CardTitle>
            <CardDescription>
              Enter your question in natural language and we'll generate a secure SQL query
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="question">Question</Label>
              <div className="relative">
                <Input
                  id="question"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !loading && submitQuestion()}
                  placeholder="e.g., What are the top 10 products by price?"
                  disabled={loading}
                  className="pr-10"
                />
                {loading && (
                  <Loader2 className="h-4 w-4 absolute right-3 top-1/2 transform -translate-y-1/2 animate-spin" />
                )}
              </div>
            </div>
            <Button 
              onClick={submitQuestion} 
              disabled={loading || !question.trim()}
              className="w-full sm:w-auto"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Submit Question
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Status Messages */}
        {message && (
          <Alert variant={message.includes('Error') ? 'destructive' : 'default'}>
            {message.includes('Error') ? (
              <AlertTriangle className="h-4 w-4" />
            ) : message.includes('blocked') || message.includes('BLOCKED') ? (
              <XCircle className="h-4 w-4" />
            ) : (
              <Info className="h-4 w-4" />
            )}
            <AlertTitle>
              {message.includes('Error') ? 'Error' : 
               message.includes('blocked') || message.includes('BLOCKED') ? 'Query Blocked' : 
               'Information'}
            </AlertTitle>
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}

        {/* Query Approval */}
        {showApproval && (
          <Card className="border-amber-200 bg-amber-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-amber-800">
                <Code className="h-5 w-5" />
                Query Review Required
              </CardTitle>
              <CardDescription className="text-amber-700">
                Please review the generated SQL query before execution
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Generated SQL Query:</Label>
                <ScrollArea className="h-32 w-full rounded-md border bg-background p-3">
                  <code className="font-mono text-sm">{generatedQuery}</code>
                </ScrollArea>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={() => approveQuery(true)}
                  disabled={loading}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Approve & Execute
                </Button>
                <Button
                  onClick={() => approveQuery(false)}
                  disabled={loading}
                  variant="destructive"
                  className="flex-1"
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Reject Query
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Results */}
        {(result || answer) && (
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-800">
                <Database className="h-5 w-5" />
                Query Results
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {result && (
                <div className="space-y-2">
                  <Label>Raw Result:</Label>
                  <ScrollArea className="h-40 w-full rounded-md border bg-background p-3">
                    <pre className="text-sm font-mono whitespace-pre-wrap">{result}</pre>
                  </ScrollArea>
                </div>
              )}
        

              {answer && (
                <div className="space-y-2">
                  <Label>AI Analysis:</Label>
                  <Card className="p-4 bg-background">
                    <div className="prose prose-sm max-w-none">
                      <div 
                        className="text-sm leading-relaxed"
                        dangerouslySetInnerHTML={{
                          __html: answer
                            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                            .replace(/- \*\*(.*?)\*\*/g, '• <strong>$1</strong>')
                            .replace(/(\d+\. \*\*Order ID:\*\* \d+)/g, '<div class="mt-4 p-3 bg-muted rounded-lg"><strong>$1</strong>')
                            .replace(/(\*\*Products? Purchased:\*\*)/g, '</div><div class="mt-2"><strong>$1</strong>')
                            .replace(/(\*\*Date:\*\*)/g, '<br/><strong>Date:</strong>')
                            .replace(/(\*\*Total Amount:\*\*)/g, '<br/><strong>Total Amount:</strong>')
                            .replace(/(\*\*Status:\*\*)/g, '<br/><strong>Status:</strong>')
                            .replace(/(\*\*Shipping Address:\*\*)/g, '<br/><strong>Shipping Address:</strong>')
                            .replace(/(\*\*Customer Name:\*\*)/g, '<br/><strong>Customer Name:</strong>')
                            .replace(/(\*\*Email:\*\*)/g, '<br/><strong>Email:</strong>')
                            .replace(/(\*\*Phone:\*\*)/g, '<br/><strong>Phone:</strong>')
                            .replace(/- (\*\*.*?\*\*)/g, '<br/>• <strong>$1</strong>')
                            .replace(/\n/g, '<br/>')
                        }}
                      />
                    </div>
                  </Card>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground">
          <div className="flex items-center justify-center gap-2">
            <Shield className="h-4 w-4" />
            <span>Secure SQL QA System - All queries are validated for security before execution</span>
          </div>
        </div>
      </div>
    </div>
  );
}
