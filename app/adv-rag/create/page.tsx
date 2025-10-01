"use client";
import React, { useState, useEffect } from "react";
import { Book, BookOpen, FileUp, PencilLine } from "lucide-react";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";
import JSZip from 'jszip';
import * as UTIF from 'utif';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import ReactMarkdown from 'react-markdown';
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github.css';
import yaml from 'js-yaml';
import format from 'xml-formatter';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const cardClass =
  "flex flex-col items-center justify-center gap-4 border-2 rounded-2xl bg-white shadow-md px-12 py-3 cursor-pointer transition hover:shadow-xl hover:border-blue-400";
const cardActive = "border-blue-400 bg-blue-50";

const CreateAdvRag = () => {
  const [showGuide, setShowGuide] = useState(false);
  // Platform to model mapping
  const platformModels: Record<string, string[]> = {
    OpenAI: [
      "text-embedding-3-small",
      "text-embedding-3-large",
      "text-embedding-ada-002"
    ],
    Ollama: ["qwen3-embedding"],
    HuggingFace: ["qwen3-embedding"],
    Antropic: ["voyage-3.5"]
  };
  const [selectedType, setSelectedType] = useState<"upload" | "text" | null>(null);
  const [chunkCards, setChunkCards] = useState<string[]>([]);
  const [textFormat, setTextFormat] = useState("text");
  const [textValue, setTextValue] = useState("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [showTable, setShowTable] = useState(false);
  const [pageCount, setPageCount] = useState<number | null>(null);
  const [pageLabel, setPageLabel] = useState<string>('Page Count');
  const [showPreview, setShowPreview] = useState(false);
  const [technique, setTechnique] = useState("structural");
  const [formData, setFormData] = useState<any>({});
  const [metadataList, setMetadataList] = useState<{ key: string; value: string }[]>([{ key: '', value: '' }]);

  useEffect(() => {
    pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.mjs';
  }, []);

  useEffect(() => {
    if (uploadedFile) {
      const type = uploadedFile.type;
      if (type === "application/pdf") {
        setPageLabel('Page Count');
        console.log('Processing PDF:', uploadedFile.name);
        const reader = new FileReader();
        reader.onload = async (e) => {
          try {
            console.log('PDF loaded, extracting page count...');
            const loadingTask = pdfjsLib.getDocument({ data: e.target!.result as ArrayBuffer });
            const pdf = await loadingTask.promise;
            console.log('PDF loaded successfully, page count:', pdf.numPages);
            setPageCount(pdf.numPages);
          } catch (err) {
            console.error('Error extracting page count:', err);
            setPageCount(null);
          }
        };
        reader.readAsArrayBuffer(uploadedFile);
      } 
      // else if (type === "application/vnd.openxmlformats-officedocument.presentationml.presentation") {
      //   setPageLabel('Slide Count');
      //   console.log('Processing PPTX:', uploadedFile.name);
      //   const reader = new FileReader();
      //   reader.onload = async (e) => {
      //     try {
      //       const zip = await JSZip.loadAsync(e.target!.result as ArrayBuffer);
      //       const slideFiles = Object.keys(zip.files).filter(name => name.startsWith('ppt/slides/') && name.endsWith('.xml'));
      //       const slideCount = slideFiles.length;
      //       console.log('PPTX loaded, slide count:', slideCount);
      //       setPageCount(slideCount);
      //     } catch (err) {
      //       console.error('Error extracting slide count:', err);
      //       setPageCount(null);
      //     }
      //   };
      //   reader.readAsArrayBuffer(uploadedFile);
      // } else if (type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
      //   setPageLabel('Paragraph Count');
      //   console.log('Processing DOCX:', uploadedFile.name);
      //   const reader = new FileReader();
      //   reader.onload = async (e) => {
      //     try {
      //       const zip = await JSZip.loadAsync(e.target!.result as ArrayBuffer);
      //       const docXml = await zip.file('word/document.xml')?.async('text');
      //       if (docXml) {
      //         const parser = new DOMParser();
      //         const xmlDoc = parser.parseFromString(docXml, 'application/xml');
      //         const paragraphs = xmlDoc.getElementsByTagName('w:p');
      //         const paraCount = paragraphs.length;
      //         console.log('DOCX loaded, paragraph count:', paraCount);
      //         setPageCount(paraCount);
      //       } else {
      //         setPageCount(null);
      //       }
      //     } catch (err) {
      //       console.error('Error extracting paragraph count:', err);
      //       setPageCount(null);
      //     }
      //   };
      //   reader.readAsArrayBuffer(uploadedFile);
      // }
       else {
        setPageCount(null);
        setPageLabel('Page Count');
      }
    } else {
      setPageCount(null);
      setPageLabel('Page Count');
    }
  }, [uploadedFile]);

  function handleMetadataChange(idx: number, field: 'key' | 'value', val: string) {
    setMetadataList(list => list.map((item, i) => i === idx ? { ...item, [field]: val } : item));
  }
  function addMetadataField() {
    setMetadataList(list => [...list, { key: '', value: '' }]);
  }
  function removeMetadataField(idx: number) {
    setMetadataList(list => list.filter((_, i) => i !== idx));
  }

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-50 px-4 pt-4">
      <div className="w-full max-w-2xl grid grid-cols-1 md:grid-cols-2 gap-10 mb-5">
        <div
          className={`flex flex-col items-center justify-center gap-4 border-2 rounded-2xl bg-white shadow-md px-16 py-6 cursor-pointer transition hover:shadow-xl hover:border-blue-400 ${selectedType === "upload" ? cardActive : ""}`}
          onClick={() => setSelectedType("upload")}
        >
          <FileUp className="w-8 h-10 text-gray-700" />
          <span className="text-lg font-semibold">Upload Document</span>
        </div>
        <div
          className={`flex flex-col items-center justify-center gap-4 border-2 rounded-2xl bg-white shadow-md px-16 py-3 cursor-pointer transition hover:shadow-xl hover:border-blue-400 ${selectedType === "text" ? cardActive : ""}`}
          onClick={() => setSelectedType("text")}
        >
          <PencilLine className="w-8 h-10 text-gray-700" />
          <span className="text-lg font-semibold">Text Input</span>
        </div>
      </div>

      {/* Text Input Section */}
      {selectedType === "upload" && (
        <div className="w-full max-w-3xl mt-2">
          <Card className="rounded-2xl shadow-lg border-2">
            <CardContent className="p-4 flex flex-col gap-6">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-lg font-semibold text-gray-700">Metadata of Uploaded File</label>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">JSON / Table</span>
                  <Switch checked={showTable} onCheckedChange={setShowTable} />
                </div>
              </div>
              <div className="flex flex-col items-start gap-2">
                <label htmlFor="file-upload" className="block text-base font-medium text-gray-700 mb-1">Upload a file</label>
                <input
                  id="file-upload"
                  type="file"
                  className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  onChange={e => setUploadedFile(e.target.files?.[0] || null)}
                />
                {uploadedFile && (
                  <span className="text-sm text-blue-700 mt-1">Selected: {uploadedFile.name}</span>
                )}
              </div>
              <div className="w-full min-h-40 flex items-center justify-center border rounded-xl bg-gray-50 p-4">
                {!uploadedFile ? (
                  <span className="text-gray-400 text-lg">No file uploaded</span>
                ) : showTable ? (
                  <table className="w-full text-left text-sm border-collapse">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="px-3 py-2 border">Field</th>
                        <th className="px-3 py-2 border">Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="px-3 py-2 border">Name</td>
                        <td className="px-3 py-2 border">{uploadedFile.name}</td>
                      </tr>
                      <tr>
                        <td className="px-3 py-2 border">Type</td>
                        <td className="px-3 py-2 border">{uploadedFile.type || "Unknown"}</td>
                      </tr>
                      <tr>
                        <td className="px-3 py-2 border">Size (bytes)</td>
                        <td className="px-3 py-2 border">{uploadedFile.size}</td>
                      </tr>
                      {pageCount !== null && (
                        <tr>
                          <td className="px-3 py-2 border">{pageLabel}</td>
                          <td className="px-3 py-2 border">{pageCount}</td>
                        </tr>
                      )}
                      <tr>
                        <td className="px-3 py-2 border">Last Modified</td>
                        <td className="px-3 py-2 border">{uploadedFile.lastModified ? new Date(uploadedFile.lastModified).toLocaleString() : "-"}</td>
                      </tr>
                    </tbody>
                  </table>
                ) : (
                  <pre className="w-full text-xs text-left bg-gray-100 p-4 rounded overflow-x-auto border">
                    {JSON.stringify({
                      name: uploadedFile.name,
                      type: uploadedFile.type,
                      size: uploadedFile.size,
                      lastModified: uploadedFile.lastModified ? new Date(uploadedFile.lastModified).toLocaleString() : "-",
                      ...(pageCount !== null ? { pageCount: pageCount } : {})
                    }, null, 2)}
                  </pre>
                )}
              </div>
              {/* Last 3 Chunks Section */}
              {chunkCards.length > 0 && (
                <div className="mt-8">
                  <label className="block text-lg font-semibold text-gray-700 mb-2">Last 3 Chunks</label>
                  <div className="flex flex-col gap-4">
                    {chunkCards.slice(-3).map((chunk: string, idx: number) => (
                      <div key={idx} className="bg-blue-200 border-2 rounded-lg p-4 text-lg text-gray-800">
                        {chunk}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {selectedType === "text" && (
        <div className="w-full max-w-3xl mt-2">
          <Card className="rounded-2xl shadow-lg border-2">
            <CardContent className="p-8 flex flex-col gap-6">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-lg font-semibold text-gray-700">Enter the text</label>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Show Preview</span>
                    <Switch checked={showPreview} onCheckedChange={setShowPreview} />
                  </div>
                  <Select value={textFormat} onValueChange={setTextFormat}>
                    <SelectTrigger className="w-56 font-semibold rounded shadow focus:ring-2 focus:ring-blue-400">
                      <SelectValue placeholder="Select text format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text">Text</SelectItem>
                      <SelectItem value="html">HTML</SelectItem>
                      <SelectItem value="markup">Markup</SelectItem>
                      <SelectItem value="yaml">YAML</SelectItem>
                      <SelectItem value="json">JSON</SelectItem>
                      <SelectItem value="xml">XML</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Textarea
                className="w-full h-56 border-2 rounded-xl text-lg p-8 text-gray-800 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none shadow"
                placeholder="Enter your text"
                value={textValue}
                onChange={(e) => setTextValue(e.target.value)}
              />
              {showPreview && (
                <div className="w-full min-h-40 border rounded-xl bg-white p-4 shadow">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Preview</label>
                  <div className="text-gray-800">
                    {textFormat === 'text' && <pre className="whitespace-pre-wrap">{textValue}</pre>}
                    {textFormat === 'html' && <div dangerouslySetInnerHTML={{__html: textValue}} style={{width: '100%', minHeight: '200px'}} />}
                    {textFormat === 'markup' && <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>{textValue}</ReactMarkdown>}
                    {textFormat === 'yaml' && (
                      <div>
                        <h4 className="text-sm font-medium mb-2">Parsed YAML:</h4>
                        <pre className="bg-gray-100 p-4 rounded text-xs overflow-x-auto">
                          {(() => {
                            try {
                              const parsed = yaml.load(textValue);
                              return JSON.stringify(parsed, null, 2);
                            } catch (err) {
                              return `YAML Parse Error: ${err instanceof Error ? err.message : 'Unknown error'}`;
                            }
                          })()}
                        </pre>
                      </div>
                    )}
                    {textFormat === 'json' && (
                      <div>
                        <h4 className="text-sm font-medium mb-2">Formatted JSON:</h4>
                        <pre className="bg-gray-100 p-4 rounded text-xs overflow-x-auto">
                          {(() => {
                            try {
                              const parsed = JSON.parse(textValue);
                              return JSON.stringify(parsed, null, 2);
                            } catch (err) {
                              return `JSON Parse Error: ${err instanceof Error ? err.message : 'Unknown error'}`;
                            }
                          })()}
                        </pre>
                      </div>
                    )}
                    {textFormat === 'xml' && (
                      <div>
                        <h4 className="text-sm font-medium mb-2">Formatted XML:</h4>
                        <pre className="bg-gray-100 p-4 rounded text-xs overflow-x-auto">
                          {(() => {
                            try {
                              return format(textValue, { indentation: '  ', lineSeparator: '\n' });
                            } catch (err) {
                              return `XML Parse Error: ${err instanceof Error ? err.message : 'Unknown error'}`;
                            }
                          })()}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
      </div>
      )}
          {/* Next Section -> technique */}
          <div className="w-full max-w-3xl mt-8">
            <Card className="rounded-2xl shadow-lg border-2">
              <CardContent className="p-8 flex flex-col gap-6">
                <div className="flex flex-col gap-4">
                  <div>
                    <div className="flex items-center justify-between gap-4 w-full">
                    <label className="block text-lg font-semibold text-gray-700">Select Chunking Technique</label>
                    <Button type="button" variant="outline" onClick={() => setShowGuide(true)}>
                      <BookOpen className="w-4 h-4" />
                    </Button>
                    </div>
                    <Select value={technique} onValueChange={setTechnique}>
                      <SelectTrigger className="w-72 font-semibold rounded shadow focus:ring-2 focus:ring-blue-400">
                        <SelectValue placeholder="Dropdown button" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="structural">Structural block chunking</SelectItem>
                        <SelectItem value="sentence">Sentence-level chunking</SelectItem>
                        <SelectItem value="sliding">Sliding window chunking</SelectItem>
                        <SelectItem value="agentic">Agentic chunking</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                    
                </div>

                {technique === "structural" && (
                  <form className="grid grid-cols-1 gap-4" onSubmit={e => e.preventDefault()}>
                    <div className="font-semibold text-base mb-2">Parameters <span className="text-xs text-gray-500">(Structural block chunking)</span></div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Chunk Size</label>
                        <Input type="number" value={formData.chunk_size || ''} onChange={e => setFormData({ ...formData, chunk_size: e.target.value })} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Chunk Overlap</label>
                        <Input type="number" value={formData.chunk_overlap || ''} onChange={e => setFormData({ ...formData, chunk_overlap: e.target.value })} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Language</label>
                        <Input type="text" value={formData.language || ''} onChange={e => setFormData({ ...formData, language: e.target.value })} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Section Headers</label>
                        <Input type="text" value={formData.section_headers || ''} onChange={e => setFormData({ ...formData, section_headers: e.target.value })} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Length Function</label>
                        <Input type="text" value={formData.length_function || ''} onChange={e => setFormData({ ...formData, length_function: e.target.value })} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Visualize Count</label>
                        <Input type="number" value={formData.visualize_count || ''} onChange={e => setFormData({ ...formData, visualize_count: e.target.value })} />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-sm font-medium mb-1">Metadata (key-value pairs)</label>
                        {metadataList.map((item, idx) => (
                          <div key={idx} className="flex gap-2 mb-2">
                            <Input type="text" placeholder="Key" value={item.key} onChange={e => handleMetadataChange(idx, 'key', e.target.value)} />
                            <Input type="text" placeholder="Value" value={item.value} onChange={e => handleMetadataChange(idx, 'value', e.target.value)} />
                            <button type="button" className="px-2 py-1 text-xs bg-red-100 text-red-600 rounded" onClick={() => removeMetadataField(idx)} disabled={metadataList.length === 1}>Remove</button>
                          </div>
                        ))}
                        <button type="button" className="mt-2 px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded" onClick={addMetadataField}>Add Metadata</button>
                      </div>
                    </div>
                  </form>
                )}
                {technique === "sentence" && (
                  <form className="mt-6 grid grid-cols-1 gap-4" onSubmit={e => e.preventDefault()}>
                    <div className="font-semibold text-base mb-2">Parameters or fields <span className="text-xs text-gray-500">(Sentence-level chunking)</span></div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Sentence Tokenizer</label>
                        <Input type="text" value={formData.sentence_tokenizer || ''} onChange={e => setFormData({ ...formData, sentence_tokenizer: e.target.value })} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Max Sentences per Chunk</label>
                        <Input type="number" value={formData.max_sentences_per_chunk || ''} onChange={e => setFormData({ ...formData, max_sentences_per_chunk: e.target.value })} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Chunk Overlap</label>
                        <Input type="number" value={formData.chunk_overlap || ''} onChange={e => setFormData({ ...formData, chunk_overlap: e.target.value })} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Language</label>
                        <Input type="text" value={formData.language || ''} onChange={e => setFormData({ ...formData, language: e.target.value })} />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-sm font-medium mb-1">Metadata (key-value pairs)</label>
                        {metadataList.map((item, idx) => (
                          <div key={idx} className="flex gap-2 mb-2">
                            <Input type="text" placeholder="Key" value={item.key} onChange={e => handleMetadataChange(idx, 'key', e.target.value)} />
                            <Input type="text" placeholder="Value" value={item.value} onChange={e => handleMetadataChange(idx, 'value', e.target.value)} />
                            <button type="button" className="px-2 py-1 text-xs bg-red-100 text-red-600 rounded" onClick={() => removeMetadataField(idx)} disabled={metadataList.length === 1}>Remove</button>
                          </div>
                        ))}
                        <button type="button" className="mt-2 px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded" onClick={addMetadataField}>Add Metadata</button>
                      </div>
                    </div>
                  </form>
                )}
                {technique === "sliding" && (
                  <form className="mt-6 grid grid-cols-1 gap-4" onSubmit={e => e.preventDefault()}>
                    <div className="font-semibold text-base mb-2">Parameters or fields <span className="text-xs text-gray-500">(Sliding window chunking)</span></div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Window Size</label>
                        <Input type="number" value={formData.window_size || ''} onChange={e => setFormData({ ...formData, window_size: e.target.value })} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Stride</label>
                        <Input type="number" value={formData.stride || ''} onChange={e => setFormData({ ...formData, stride: e.target.value })} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Tokenizer</label>
                        <Input type="text" value={formData.tokenizer || ''} onChange={e => setFormData({ ...formData, tokenizer: e.target.value })} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Length Function</label>
                        <Input type="text" value={formData.length_function || ''} onChange={e => setFormData({ ...formData, length_function: e.target.value })} />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-sm font-medium mb-1">Metadata (key-value pairs)</label>
                        {metadataList.map((item, idx) => (
                          <div key={idx} className="flex gap-2 mb-2">
                            <Input type="text" placeholder="Key" value={item.key} onChange={e => handleMetadataChange(idx, 'key', e.target.value)} />
                            <Input type="text" placeholder="Value" value={item.value} onChange={e => handleMetadataChange(idx, 'value', e.target.value)} />
                            <button type="button" className="px-2 py-1 text-xs bg-red-100 text-red-600 rounded" onClick={() => removeMetadataField(idx)} disabled={metadataList.length === 1}>Remove</button>
                          </div>
                        ))}
                        <button type="button" className="mt-2 px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded" onClick={addMetadataField}>Add Metadata</button>
                      </div>
                    </div>
                  </form>
                )}
                {technique === "agentic" && (
                  <form className="mt-6 grid grid-cols-1 gap-4" onSubmit={e => e.preventDefault()}>
                    <div className="font-semibold text-base mb-2">Parameters or fields <span className="text-xs text-gray-500">(Agentic chunking)</span></div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Action Unit Size</label>
                        <Input type="number" value={formData.action_unit_size || ''} onChange={e => setFormData({ ...formData, action_unit_size: e.target.value })} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Action Overlap</label>
                        <Input type="number" value={formData.action_overlap || ''} onChange={e => setFormData({ ...formData, action_overlap: e.target.value })} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Semantic Splitter</label>
                        <Input type="text" value={formData.semantic_splitter || ''} onChange={e => setFormData({ ...formData, semantic_splitter: e.target.value })} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Chunk Type</label>
                        <Input type="text" value={formData.chunk_type || ''} onChange={e => setFormData({ ...formData, chunk_type: e.target.value })} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Context Window</label>
                        <Input type="number" value={formData.context_window || ''} onChange={e => setFormData({ ...formData, context_window: e.target.value })} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Custom Rules</label>
                        <Input type="text" value={formData.custom_rules || ''} onChange={e => setFormData({ ...formData, custom_rules: e.target.value })} />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-sm font-medium mb-1">Metadata (key-value pairs)</label>
                        {metadataList.map((item, idx) => (
                          <div key={idx} className="flex gap-2 mb-2">
                            <Input type="text" placeholder="Key" value={item.key} onChange={e => handleMetadataChange(idx, 'key', e.target.value)} />
                            <Input type="text" placeholder="Value" value={item.value} onChange={e => handleMetadataChange(idx, 'value', e.target.value)} />
                            <button type="button" className="px-2 py-1 text-xs bg-red-100 text-red-600 rounded" onClick={() => removeMetadataField(idx)} disabled={metadataList.length === 1}>Remove</button>
                          </div>
                        ))}
                        <button type="button" className="mt-2 px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded" onClick={addMetadataField}>Add Metadata</button>
                      </div>
                    </div>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Next Section -> Chunks */}
          <div className="w-full max-w-3xl mt-8">
            <Card className="rounded-2xl border-2">
              <CardContent className="p-8 flex flex-col gap-6">
                <div className="flex flex-col gap-4">
                  <label className="block text-xl font-bold text-gray-800 mb-1">Analyse Chunks</label>
                  <div className="flex items-center gap-4 mb-4">
                    <label className="block text-base font-medium text-gray-700">Total No of Chunks</label>
                    <Input
                      type="number"
                      className="w-64 text-lg"
                      value={formData.total_chunks || ''}
                      onChange={e => setFormData({ ...formData, total_chunks: e.target.value })}
                      placeholder="10"
                    />
                    <Button
                      type="button"
                      className="px-8 py-2 text-base font-semibold bg-gray-600 text-white rounded shadow"
                      onClick={() => {
                        // Demo: generate chunk cards with dummy text
                        const count = parseInt(formData.total_chunks) || 0;
                        setChunkCards(Array.from({ length: count }, () =>
                          "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.")
                        );
                      }}
                    >
                      Apply
                    </Button>
                  </div>
                  <div className="w-full border-2 rounded-xl bg-white p-4">
                    {chunkCards.length === 0 ? (
                      <span className="text-gray-400 text-lg">No chunks to display</span>
                    ) : (
                      <div className="flex flex-col gap-4 overflow-y-auto" style={{ maxHeight: 400 }}>
                        {chunkCards.map((chunk: string, idx: number) => (
                          <div key={idx} className="bg-blue-200 border-2 rounded-lg p-4 text-lg text-gray-800">
                            {chunk}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Next Section -> Process */}
            <Card className="rounded-2xl shadow-lg border-2 mt-3">
            <CardContent className="p-8 flex flex-col gap-6">
              <div className="flex items-center gap-8">
              {/* Platform Dropdown */}
              <div className="flex flex-col gap-2">
                <label className="block mb-1 text-base font-semibold text-gray-700">Platform</label>
                <Select value={formData.platform || "OpenAI"} onValueChange={val => setFormData({ ...formData, platform: val })}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Platform" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="OpenAI">OpenAI</SelectItem>
                  <SelectItem value="Ollama">Ollama</SelectItem>
                  <SelectItem value="HuggingFace">HuggingFace</SelectItem>
                  <SelectItem value="Antropic">Antropic</SelectItem>
                </SelectContent>
                </Select>
              </div>
              {/* Model Dropdown */}
              <div className="flex flex-col gap-2">
                <label className="block mb-1 text-base font-semibold text-gray-700">Model</label>
                <Select
                value={formData.model || platformModels[formData.platform || "OpenAI"][0]}
                onValueChange={val => setFormData({ ...formData, model: val })}
                >
                <SelectTrigger className="w-56">
                  <SelectValue placeholder="Model" />
                </SelectTrigger>
                <SelectContent>
                  {(platformModels[formData.platform || "OpenAI"] || []).map(model => (
                  <SelectItem key={model} value={model}>{model}</SelectItem>
                  ))}
                </SelectContent>
                </Select>
              </div>
              {/* Storage Dropdown */}
              <div className="flex flex-col gap-2">
                <label className="block mb-1 text-base font-semibold text-gray-700">Storage</label>
                <Select value={formData.storage || "Chroma"} onValueChange={val => setFormData({ ...formData, storage: val })}>
                <SelectTrigger className="w-56">
                  <SelectValue placeholder="Storage" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Chroma">Chroma</SelectItem>
                  <SelectItem value="FAISS">FAISS</SelectItem>
                  <SelectItem value="PGVector">PGVector</SelectItem>
                  <SelectItem value="Mongodb">Mongodb</SelectItem>
                </SelectContent>
                </Select>
              </div>
              </div>
              <Button
              type="button"
              className="px-8 py-3 text-lg font-semibold bg-blue-700 text-white rounded shadow"
              onClick={() => {
                // TODO: Implement process and store logic
                alert(`Processing with:\nPlatform: ${formData.platform || "OpenAI"}\nModel: ${formData.model || "text-embedding-3-small"}\nStorage: ${formData.storage || "Chroma"}`);
              }}
              >
              Process and Store
              </Button>
            </CardContent>
            </Card>

                  
            {/* Study Guide Sheet */}
            <Sheet open={showGuide} onOpenChange={setShowGuide}>
              <SheetContent side="right" className="!max-w-md p-8">
                <SheetTitle>
                  <VisuallyHidden>Chunking Parameters Study Guide</VisuallyHidden>
                </SheetTitle>
                <div className="space-y-6 text-gray-800 text-base overflow-y-auto">
                  <div>
                    <h3 className="font-semibold text-blue-600 mb-2">Structural block chunking</h3>
                    <ul className="list-disc ml-6 mb-2">
                      <li><b>chunk_size</b>: Maximum size of each chunk (in characters, words, or tokens)</li>
                      <li><b>chunk_overlap</b>: Number of overlapping units between consecutive chunks</li>
                      <li><b>separators</b>: List of strings or regex patterns to split on (e.g., headings, double newlines)</li>
                      <li><b>length_function</b>: Custom function to measure chunk length (optional)</li>
                      <li><b>keep_separator</b>: Whether to include the separator in the chunk (optional)</li>
                      <li><b>metadata</b>: Any additional metadata to attach to each chunk (optional)</li>
                      <li><b>visualize_count</b>: Number of document is to be shown in documentation</li>
                      <li><b>language</b>: For language-specific splitters (e.g., Python, Markdown)</li>
                      <li><b>section_headers</b>: For header-based splitting (e.g., Markdown or HTML)</li>
                    </ul>
                    <div className="text-gray-700 text-sm mb-2">
                      <b>Structural block chunking</b> offers more control and customization because you can:
                      <ul className="list-disc ml-6">
                        <li>Define custom separators (e.g., headings, section breaks, code blocks)</li>
                        <li>Adjust chunk size and overlap to fit your use case</li>
                        <li>Use regex or language-specific rules to split by semantic units</li>
                        <li>Attach rich metadata to each chunk (e.g., section title, hierarchy level)</li>
                        <li>Combine with other chunking strategies (e.g., sentence-level within sections)</li>
                      </ul>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-blue-600 mb-2">Sentence-level chunking</h3>
                    <ul className="list-disc ml-6 mb-2">
                      <li><b>sentence_tokenizer</b>: The function or library used to split text into sentences (e.g., nltk.sent_tokenize, spaCy, or LangChain’s built-in splitters)</li>
                      <li><b>max_sentences_per_chunk</b>: Maximum number of sentences in each chunk (optional, for grouping sentences)</li>
                      <li><b>chunk_overlap</b>: Number of overlapping sentences between chunks (optional)</li>
                      <li><b>language</b>: Language of the text (for tokenizer accuracy, optional)</li>
                      <li><b>metadata</b>: Any additional metadata to attach to each chunk (optional)</li>
                      <li><b>visualize_count</b>: Number of document is to be shown in documentation</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold text-blue-600 mb-2">Sliding window chunking</h3>
                    <ul className="list-disc ml-6 mb-2">
                      <li><b>window_size</b>: Number of tokens (words, characters, or sentences) in each chunk</li>
                      <li><b>stride</b>: Number of tokens to move the window forward for the next chunk (controls overlap)</li>
                      <li><b>tokenizer</b>: Function or library to split text into tokens (e.g., words, sentences)</li>
                      <li><b>metadata</b>: Any additional metadata to attach to each chunk (optional)</li>
                      <li><b>length_function</b>: Custom function to measure chunk length (optional)</li>
                      <li><b>visualize_count</b>: Number of document is to be shown in documentation</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold text-blue-600 mb-2">Agentic chunking</h3>
                    <ul className="list-disc ml-6 mb-2">
                      <li><b>action_unit_size</b>: Size of each actionable chunk (e.g., number of sentences, steps, or semantic units)</li>
                      <li><b>action_overlap</b>: Number of overlapping units between consecutive agentic chunks (optional)</li>
                      <li><b>semantic_splitter</b>: Function or model to identify actionable or task-oriented units (e.g., steps, instructions, responsibilities)</li>
                      <li><b>chunk_type</b>: Type of chunk (e.g., "information", "task", "action") for metadata</li>
                      <li><b>metadata</b>: Additional metadata for each chunk (e.g., source, hierarchy, context)</li>
                      <li><b>context_window</b>: Number of surrounding units to include for agent reasoning (optional)</li>
                      <li><b>custom_rules</b>: Rules or patterns for identifying agentic boundaries (optional)</li>
                      <li><b>visualize_count</b>: Number of document is to be shown in documentation</li>
                    </ul>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
    </div>

  );
};


export default CreateAdvRag;