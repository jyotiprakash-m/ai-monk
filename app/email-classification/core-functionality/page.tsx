"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiClient } from "@/lib/api";
import ReactMarkdown from "react-markdown";

const DBQuery = () => {
  // Email Reply State
  const [emailText, setEmailText] = useState("");
  const [generatedReply, setGeneratedReply] = useState("");
  const [emailLoading, setEmailLoading] = useState(false);

  // Database Query State
  const [queryText, setQueryText] = useState("");
  const [queryResult, setQueryResult] = useState<any>(null);
  const [queryLoading, setQueryLoading] = useState(false);

  // RAG Email Generation State
  const [ragEmailText, setRagEmailText] = useState("");
  const [ragCollectionName, setRagCollectionName] = useState("");
  const [ragK, setRagK] = useState(3);
  const [ragReply, setRagReply] = useState("");
  const [ragLoading, setRagLoading] = useState(false);

  // Collections State
  const [collections, setCollections] = useState<
    Array<{ uuid: string; name: string; cmetadata: any }>
  >([]);
  const [collectionsLoading, setCollectionsLoading] = useState(false);

  // Fetch collections on component mount
  useEffect(() => {
    const fetchCollections = async () => {
      setCollectionsLoading(true);
      try {
        const response = await apiClient.getCollections();
        setCollections(response.data);
      } catch (error) {
        console.error("Error fetching collections:", error);
      } finally {
        setCollectionsLoading(false);
      }
    };

    fetchCollections();
  }, []);

  const handleGenerateReply = async () => {
    if (!emailText.trim()) {
      alert("Please enter some email text first.");
      return;
    }

    setEmailLoading(true);
    try {
      const response = await apiClient.generateSimpleEmailReply(emailText);
      setGeneratedReply(response.reply);
    } catch (error) {
      console.error("Error generating reply:", error);
      alert("Failed to generate reply. Please try again.");
    } finally {
      setEmailLoading(false);
    }
  };

  const handleRunQuery = async () => {
    if (!queryText.trim()) {
      alert("Please enter a query request first.");
      return;
    }

    setQueryLoading(true);
    try {
      const response = await apiClient.runDatabaseQuery(queryText);
      setQueryResult(response.result);
    } catch (error) {
      console.error("Error running query:", error);
      alert("Failed to run query. Please try again.");
    } finally {
      setQueryLoading(false);
    }
  };

  const handleGenerateRAGReply = async () => {
    if (!ragEmailText.trim()) {
      alert("Please enter some email text first.");
      return;
    }
    if (!ragCollectionName.trim()) {
      alert("Please select a collection first.");
      return;
    }

    setRagLoading(true);
    try {
      const response = await apiClient.generateEmailReplyWithRAG(
        ragEmailText,
        ragCollectionName,
        ragK
      );
      setRagReply(response.reply);
    } catch (error) {
      console.error("Error generating RAG reply:", error);
      alert("Failed to generate RAG reply. Please try again.");
    } finally {
      setRagLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">AI Assistant Hub</h1>

      <Tabs defaultValue="email-reply" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="email-reply">Email Reply Generator</TabsTrigger>
          <TabsTrigger value="db-query">Database Query</TabsTrigger>
          <TabsTrigger value="rag-email">RAG Email Generator</TabsTrigger>
        </TabsList>

        {/* Email Reply Tab */}
        <TabsContent value="email-reply" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Input Section */}
            <Card>
              <CardHeader>
                <CardTitle>Email Text Input</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label
                    htmlFor="email-text"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Enter Email Text
                  </label>
                  <Textarea
                    id="email-text"
                    value={emailText}
                    onChange={(e) => setEmailText(e.target.value)}
                    placeholder="Type or paste the email text here..."
                    className="min-h-[200px] resize-y"
                  />
                </div>
                <Button
                  onClick={handleGenerateReply}
                  disabled={emailLoading || !emailText.trim()}
                  className="w-full"
                >
                  {emailLoading ? "Generating..." : "Generate Reply"}
                </Button>
              </CardContent>
            </Card>

            {/* Output Section */}
            <Card>
              <CardHeader>
                <CardTitle>Generated Reply</CardTitle>
              </CardHeader>
              <CardContent>
                {generatedReply ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Markdown Preview
                      </label>
                      <div className="bg-gray-50 p-4 rounded-md border text-sm prose prose-sm max-w-none">
                        <ReactMarkdown>{generatedReply}</ReactMarkdown>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Raw Markdown
                      </label>
                      <Textarea
                        value={generatedReply}
                        readOnly
                        className="min-h-[200px] font-mono text-xs"
                        placeholder="Generated reply will appear here..."
                      />
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    <p>Generated reply will appear here</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Database Query Tab */}
        <TabsContent value="db-query" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Query Input Section */}
            <Card>
              <CardHeader>
                <CardTitle>Database Query</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label
                    htmlFor="query-text"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Enter Query Request
                  </label>
                  <Textarea
                    id="query-text"
                    value={queryText}
                    onChange={(e) => setQueryText(e.target.value)}
                    placeholder="e.g., Provide all users info, Show orders from last month, etc."
                    className="min-h-[150px] resize-y"
                  />
                </div>
                <Button
                  onClick={handleRunQuery}
                  disabled={queryLoading || !queryText.trim()}
                  className="w-full"
                >
                  {queryLoading ? "Running Query..." : "Run Query"}
                </Button>
              </CardContent>
            </Card>

            {/* Query Results Section */}
            <Card>
              <CardHeader>
                <CardTitle>Query Results</CardTitle>
              </CardHeader>
              <CardContent>
                {queryResult ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        JSON Result
                      </label>
                      <div className="bg-gray-900 text-green-400 p-4 rounded-md border font-mono text-xs overflow-x-auto max-h-[400px] overflow-y-auto">
                        <pre>{JSON.stringify(queryResult, null, 2)}</pre>
                      </div>
                    </div>
                    {queryResult.data &&
                      Array.isArray(queryResult.data) &&
                      queryResult.data.length > 0 && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Data Table Preview ({queryResult.data.length}{" "}
                            records)
                          </label>
                          <div className="bg-white border rounded-md overflow-x-auto max-h-[300px] overflow-y-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                              <thead className="bg-gray-50 sticky top-0">
                                <tr>
                                  {Object.keys(queryResult.data[0]).map(
                                    (key) => (
                                      <th
                                        key={key}
                                        className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                      >
                                        {key}
                                      </th>
                                    )
                                  )}
                                </tr>
                              </thead>
                              <tbody className="bg-white divide-y divide-gray-200">
                                {queryResult.data
                                  .slice(0, 10)
                                  .map((row: any, index: number) => (
                                    <tr
                                      key={index}
                                      className="hover:bg-gray-50"
                                    >
                                      {Object.values(row).map(
                                        (value: any, cellIndex: number) => (
                                          <td
                                            key={cellIndex}
                                            className="px-3 py-2 text-xs text-gray-900 max-w-[200px] truncate"
                                            title={String(value)}
                                          >
                                            {String(value)}
                                          </td>
                                        )
                                      )}
                                    </tr>
                                  ))}
                              </tbody>
                            </table>
                            {queryResult.data.length > 10 && (
                              <div className="px-3 py-2 text-xs text-gray-500 bg-gray-50 border-t">
                                Showing first 10 records of{" "}
                                {queryResult.data.length} total
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    <p>Query results will appear here</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* RAG Email Generator Tab */}
        <TabsContent value="rag-email" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* RAG Input Section */}
            <Card>
              <CardHeader>
                <CardTitle>RAG Email Generation</CardTitle>
                <p className="text-sm text-gray-600">
                  Generate emails using Retrieval-Augmented Generation with
                  document context
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label
                    htmlFor="rag-email-text"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Email Text
                  </label>
                  <Textarea
                    id="rag-email-text"
                    value={ragEmailText}
                    onChange={(e) => setRagEmailText(e.target.value)}
                    placeholder="Enter the email content that needs a reply..."
                    className="min-h-[120px] resize-y"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="rag-collection"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Collection Name
                    </label>
                    <Select
                      value={ragCollectionName}
                      onValueChange={setRagCollectionName}
                      disabled={collectionsLoading}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue
                          placeholder={
                            collectionsLoading
                              ? "Loading collections..."
                              : "Select a collection"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {collections.map((collection) => (
                          <SelectItem
                            key={collection.uuid}
                            value={collection.name}
                          >
                            {collection.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label
                      htmlFor="rag-k"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Documents to Retrieve (k)
                    </label>
                    <Input
                      id="rag-k"
                      type="number"
                      min="1"
                      max="10"
                      value={ragK}
                      onChange={(e) => setRagK(parseInt(e.target.value) || 3)}
                      placeholder="3"
                    />
                  </div>
                </div>

                <Button
                  onClick={handleGenerateRAGReply}
                  disabled={
                    ragLoading ||
                    !ragEmailText.trim() ||
                    !ragCollectionName.trim()
                  }
                  className="w-full"
                >
                  {ragLoading ? "Generating with RAG..." : "Generate RAG Reply"}
                </Button>
              </CardContent>
            </Card>

            {/* RAG Output Section */}
            <Card>
              <CardHeader>
                <CardTitle>RAG Generated Reply</CardTitle>
              </CardHeader>
              <CardContent>
                {ragReply ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Markdown Preview
                      </label>
                      <div className="bg-gray-50 p-4 rounded-md border text-sm prose prose-sm max-w-none">
                        <ReactMarkdown>{ragReply}</ReactMarkdown>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Raw Markdown
                      </label>
                      <Textarea
                        value={ragReply}
                        readOnly
                        className="min-h-[200px] font-mono text-xs"
                        placeholder="RAG generated reply will appear here..."
                      />
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    <p>RAG generated reply will appear here</p>
                    <p className="text-xs mt-2">
                      Uses document retrieval to provide contextually relevant
                      responses
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DBQuery;
