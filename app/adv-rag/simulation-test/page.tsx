"use client";
import { useState, useEffect } from "react";

interface ProgressData {
  current: number;
  total: number;
  message: string;
  result?: any;
}

interface ChunkingResult {
  status: string;
  message: string;
  total_chunks: number;
  chunks: any[];
  processing_time: number;
  metadata: any;
}

export default function ChunkingForm() {
  const [formData, setFormData] = useState({
    file: null as File | null,
    text: "",
    chunk_size: 1000,
    chunk_overlap: 200,
    separators: "",
    length_function: "characters",
    keep_separator: false,
    visualize_count: "",
    section_headers: "",
    language: "",
    return_chunk_limit: "",
  });

  const [taskId, setTaskId] = useState<string | null>(null);
  const [progress, setProgress] = useState<ProgressData | null>(null);
  const [result, setResult] = useState<ChunkingResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData((prev) => ({ ...prev, file }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setProgress(null);
    setResult(null);
    setTaskId(null);

    try {
      let response: Response;
      let requestBody: any;

      if (formData.file) {
        // File upload: POST to /v1/operations/structural-block/file with FormData
        const submitData = new FormData();
        submitData.append("file", formData.file);
        submitData.append("chunk_size", formData.chunk_size.toString());
        submitData.append("chunk_overlap", formData.chunk_overlap.toString());
        if (formData.separators) submitData.append("separators", formData.separators);
        if (formData.length_function) submitData.append("length_function", formData.length_function);
        submitData.append("keep_separator", formData.keep_separator.toString());
        if (formData.visualize_count) submitData.append("visualize_count", formData.visualize_count);
        if (formData.section_headers) submitData.append("section_headers", formData.section_headers);
        if (formData.language) submitData.append("language", formData.language);
        if (formData.return_chunk_limit) submitData.append("return_chunk_limit", formData.return_chunk_limit);

        response = await fetch('http://localhost:8000/v1/operations/structural-block/file', {
          method: 'POST',
          body: submitData,
        });
      } else {
        // Text input: POST to /v1/operations/structural-block with JSON
        if (!formData.text) {
          throw new Error("Please provide text input");
        }
        requestBody = {
          text: formData.text,
          chunk_size: formData.chunk_size,
          chunk_overlap: formData.chunk_overlap,
          separators: formData.separators || undefined,
          length_function: formData.length_function || undefined,
          keep_separator: formData.keep_separator,
          visualize_count: formData.visualize_count || undefined,
          section_headers: formData.section_headers || undefined,
          language: formData.language || undefined,
          return_chunk_limit: formData.return_chunk_limit || undefined,
        };

        response = await fetch('http://localhost:8000/v1/operations/structural-block', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        });
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const { task_id } = await response.json();
      setTaskId(task_id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setIsSubmitting(false);
    }
  };

  console.log(taskId);

  useEffect(() => {
    if (!taskId) return;

    const ws = new WebSocket(
      `ws://localhost:8000/v1/operations/progress/${taskId}`
    );

    ws.onmessage = (event) => {
      try {
        const data: ProgressData = JSON.parse(event.data);
        setProgress(data);
        console.log("data: ",data)

        if (data.current >= 100 && data.result) {
          setResult(data.result);
          setIsSubmitting(false);
          ws.close();
        }
      } catch (err) {
        console.error("Error parsing WebSocket message:", err);
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
      setError("Connection error occurred");
      setIsSubmitting(false);
    };

    ws.onclose = () => {
      setIsSubmitting(false);
    };

    return () => ws.close();
  }, [taskId]);

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Structural Block Chunking</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* File Upload */}
        <div>
          <label className="block text-sm font-medium mb-2">Upload File</label>
          <input
            type="file"
            accept=".pdf,.txt,.pptx,.ppt,.docx,.doc,.html,.htm,.xml"
            onChange={handleFileChange}
            className="w-full p-2 border rounded-md"
          />
        </div>

        {/* Text Input */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Or Enter Text
          </label>
          <textarea
            name="text"
            value={formData.text}
            onChange={handleInputChange}
            placeholder="Enter text to chunk..."
            rows={4}
            className="w-full p-2 border rounded-md"
          />
        </div>

        {/* Chunk Size */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Chunk Size</label>
            <input
              type="number"
              name="chunk_size"
              value={formData.chunk_size}
              onChange={handleInputChange}
              min="1"
              className="w-full p-2 border rounded-md"
            />
          </div>

          {/* Chunk Overlap */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Chunk Overlap
            </label>
            <input
              type="number"
              name="chunk_overlap"
              value={formData.chunk_overlap}
              onChange={handleInputChange}
              min="0"
              className="w-full p-2 border rounded-md"
            />
          </div>
        </div>

        {/* Separators */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Separators (comma-separated)
          </label>
          <input
            type="text"
            name="separators"
            value={formData.separators}
            onChange={handleInputChange}
            placeholder="e.g., \n\n, \n,  "
            className="w-full p-2 border rounded-md"
          />
        </div>

        {/* Length Function */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Length Function
          </label>
          <select
            name="length_function"
            value={formData.length_function}
            onChange={handleInputChange}
            className="w-full p-2 border rounded-md"
          >
            <option value="characters">Characters</option>
            <option value="words">Words</option>
            <option value="tokens">Tokens</option>
          </select>
        </div>

        {/* Keep Separator */}
        <div className="flex items-center">
          <input
            type="checkbox"
            name="keep_separator"
            checked={formData.keep_separator}
            onChange={handleInputChange}
            className="mr-2"
          />
          <label className="text-sm font-medium">Keep Separator</label>
        </div>

        {/* Section Headers */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Section Headers (comma-separated)
          </label>
          <input
            type="text"
            name="section_headers"
            value={formData.section_headers}
            onChange={handleInputChange}
            placeholder="e.g., #, ##, ###"
            className="w-full p-2 border rounded-md"
          />
        </div>

        {/* Language */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Programming Language
          </label>
          <select
            name="language"
            value={formData.language}
            onChange={handleInputChange}
            className="w-full p-2 border rounded-md"
          >
            <option value="">None</option>
            <option value="python">Python</option>
            <option value="javascript">JavaScript</option>
            <option value="typescript">TypeScript</option>
            <option value="java">Java</option>
            <option value="cpp">C++</option>
            <option value="c">C</option>
            <option value="csharp">C#</option>
            <option value="go">Go</option>
            <option value="rust">Rust</option>
            <option value="ruby">Ruby</option>
            <option value="php">PHP</option>
            <option value="scala">Scala</option>
            <option value="kotlin">Kotlin</option>
            <option value="swift">Swift</option>
            <option value="r">R</option>
            <option value="matlab">MATLAB</option>
            <option value="shell">Shell</option>
            <option value="sql">SQL</option>
            <option value="html">HTML</option>
            <option value="css">CSS</option>
            <option value="xml">XML</option>
            <option value="json">JSON</option>
            <option value="yaml">YAML</option>
          </select>
        </div>

        {/* Return Chunk Limit */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Return Chunk Limit
          </label>
          <input
            type="number"
            name="return_chunk_limit"
            value={formData.return_chunk_limit}
            onChange={handleInputChange}
            min="1"
            placeholder="Leave empty for all chunks"
            className="w-full p-2 border rounded-md"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 disabled:bg-gray-400"
        >
          {isSubmitting ? "Processing..." : "Process Document"}
        </button>
      </form>

      {/* Error Display */}
      {error && (
        <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Progress Display */}
      {progress && (
        <div className="mt-4">
          <div className="mb-2">
            <div className="flex justify-between text-sm">
              <span>{progress.message}</span>
              <span>{progress.current}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress.current}%` }}
              ></div>
            </div>
          </div>
        </div>
      )}

      {/* Results Display */}
      {result && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-4">Results</h3>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p>
              <strong>Status:</strong> {result.status}
            </p>
            <p>
              <strong>Message:</strong> {result.message}
            </p>
            <p>
              <strong>Total Chunks:</strong> {result.total_chunks}
            </p>
            <p>
              <strong>Processing Time:</strong> {result.processing_time}s
            </p>

            <details className="mt-4">
              <summary className="cursor-pointer font-medium">
                View Chunks
              </summary>
              <div className="mt-2 max-h-60 overflow-y-auto">
                <pre className="text-xs bg-white p-2 rounded border">
                  {JSON.stringify(result.chunks.slice(0, 5), null, 2)}
                  {result.chunks.length > 5 &&
                    `\n... and ${result.chunks.length - 5} more chunks`}
                </pre>
              </div>
            </details>
          </div>
        </div>
      )}
    </div>
  );
}
