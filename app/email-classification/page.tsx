"use client";
import LoaderSkeleton from "@/components/common/LoaderSkeleton";
import { BreadcrumbNavigation } from "@/components/modern-layout/breadcrumb-navigation";
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import ReactMarkdown from "react-markdown";
import {
  apiClient,
  EmailClassificationResult,
  Email,
  ReplyResponse,
} from "@/lib/api";
import { Badge } from "@/components/ui/badge";

// ----------------- Schema -----------------
const formSchema = z.object({
  emailBody: z.string().optional(),
  tone: z.enum(["formal", "friendly", "assertive"]),
  toolInstruction: z.enum(["rag", "generic", "database"]),
  collectionName: z.string().optional(),
  customInput: z.string().optional(),
});
type FormValues = z.infer<typeof formSchema>;

// ----------------- Dummy Data -----------------
// Using real API data instead of dummy data
type User = Email;

async function fetchUsers(
  offset: number,
  limit: number
): Promise<{ items: User[]; total: number }> {
  try {
    // Using dummy user_id and org_id for now - these should come from auth context
    const userId = "1";
    const orgId = "1";

    const response = await apiClient.getEmailClassification(
      userId,
      orgId,
      offset,
      limit
    );

    return {
      items: response.emails,
      total: response.total_emails_in_inbox,
    };
  } catch (error) {
    console.error("Failed to fetch email classification data:", error);
    // Return empty data on error
    return {
      items: [],
      total: 0,
    };
  }
}

// ----------------- Component -----------------
const EmailClassification = () => {
  const [lastTranscript, setLastTranscript] = useState<string>("");
  const [data, setData] = useState<User[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [selectedRow, setSelectedRow] = useState<User | null>(null);
  const [sentimentFilter, setSentimentFilter] = useState<string>("all");
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");
  const [generatingReply, setGeneratingReply] = useState(false);
  const [collections, setCollections] = useState<
    Array<{ uuid: string; name: string; cmetadata: any }>
  >([]);

  const pageSize = 10;

  // Get unique values for filters
  const uniqueSentiments = Array.from(
    new Set(data.map((item) => item.sentiment_analysis).filter(Boolean))
  );
  const uniqueDepartments = Array.from(
    new Set(
      data
        .map((item) => item.classification_report?.predicted_department)
        .filter(Boolean)
    )
  );

  // Filter data based on selected filters
  const filteredData = data.filter((item) => {
    const matchesSentiment =
      !sentimentFilter ||
      sentimentFilter === "all" ||
      item.sentiment_analysis === sentimentFilter;
    const matchesDepartment =
      !departmentFilter ||
      departmentFilter === "all" ||
      item.classification_report?.predicted_department === departmentFilter;
    return matchesSentiment && matchesDepartment;
  });

  // Custom filters for DataTable
  const customFilters = (
    <div className="flex items-center gap-2 flex-wrap">
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium text-gray-700">Sentiment:</label>
        <Select value={sentimentFilter} onValueChange={setSentimentFilter}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="All" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            {uniqueSentiments.map((sentiment) => (
              <SelectItem key={sentiment} value={sentiment}>
                {sentiment.charAt(0).toUpperCase() + sentiment.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2">
        <label className="text-sm font-medium text-gray-700">Department:</label>
        <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="All" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            {uniqueDepartments.map((department) => (
              <SelectItem key={department} value={department}>
                {department.charAt(0).toUpperCase() + department.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {(sentimentFilter && sentimentFilter !== "all") ||
      (departmentFilter && departmentFilter !== "all") ? (
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setSentimentFilter("all");
            setDepartmentFilter("all");
          }}
        >
          Clear
        </Button>
      ) : null}
    </div>
  );
  const loadData = async (page: number) => {
    setLoading(true);
    const offset = (page - 1) * pageSize;
    const result = await fetchUsers(offset, pageSize);

    console.log("Fetched data:", result);
    setData(result.items);
    setTotalRecords(result.total);
    setCurrentPage(page);
    setLoading(false);
  };

  // Load all data when filters are applied
  const loadAllData = async () => {
    setLoading(true);
    // Fetch all emails by setting a large limit
    const result = await fetchUsers(0, 1000); // Assuming max 1000 emails for now
    setData(result.items);
    setTotalRecords(result.total);
    setCurrentPage(1);
    setLoading(false);
  };

  // Check if filters are active
  const hasActiveFilters =
    sentimentFilter !== "all" || departmentFilter !== "all";

  // Use filtered data for display when filters are active
  const displayData = hasActiveFilters
    ? filteredData.slice((currentPage - 1) * pageSize, currentPage * pageSize)
    : data;

  // Calculate total pages based on filtered data when filters are active
  const totalPages = hasActiveFilters
    ? Math.ceil(filteredData.length / pageSize)
    : Math.ceil(totalRecords / pageSize);

  // Handle page changes differently based on filter state
  const handlePageChange = async (page: number) => {
    if (hasActiveFilters) {
      // Client-side pagination when filters are active
      setCurrentPage(page);
    } else {
      // Server-side pagination when no filters
      await loadData(page);
    }
  };

  useEffect(() => {
    if (hasActiveFilters) {
      // Load all data when filters become active
      loadAllData();
    } else {
      // Load paginated data when no filters
      loadData(1);
    }
  }, [hasActiveFilters]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [sentimentFilter, departmentFilter]);

  // Fetch collections on component mount
  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const response = await apiClient.getCollections();
        setCollections(response.data);
      } catch (error) {
        console.error("Failed to fetch collections:", error);
        // Keep empty array on error
      }
    };

    fetchCollections();
  }, []);

  // Handle reply generation
  const handleGenerateReply = async (formData: any) => {
    if (!selectedRow) return;

    setGeneratingReply(true);
    try {
      const replyData = {
        email_subject: selectedRow.subject,
        email_body: selectedRow.body,
        tone: formData.tone,
        tool_instructions: formData.toolInstruction,
        collection_name: formData.collectionName || "",
        custom_query_input: formData.customInput || "",
      };

      const response: ReplyResponse = await apiClient.generateEmailReply(
        replyData
      );

      // Update the textarea with the generated response
      setValue("emailBody", response.final_response);
    } catch (error) {
      console.error("Error generating reply:", error);
      alert("Failed to generate reply. Please try again.");
    } finally {
      setGeneratingReply(false);
    }
  };

  // Columns
  const columns: ColumnDef<User>[] = [
    { accessorKey: "email_id", header: "Email ID" },
    { accessorKey: "from", header: "From" },
    {
      accessorKey: "subject",
      header: "Subject",
      cell: ({ row }) => (
        <span className="break-words max-h-12 overflow-hidden">
          {row.original.subject}
        </span>
      ),
    },
    {
      accessorKey: "classification_report.predicted_department",
      header: "Predicted Department",
      cell: ({ row }) => (
        <span className="capitalize">
          {row.original.classification_report?.predicted_department || "N/A"}
        </span>
      ),
    },
    {
      accessorKey: "classification_report.confidence",
      header: "Confidence",
      cell: ({ row }) => (
        <span>
          {row.original.classification_report?.confidence
            ? `${(row.original.classification_report.confidence * 100).toFixed(
                1
              )}%`
            : "N/A"}
        </span>
      ),
    },
    {
      accessorKey: "sentiment_analysis",
      header: "Sentiment",
      cell: ({ row }) => (
        <span className="capitalize">
          {row.original.sentiment_analysis || "N/A"}
        </span>
      ),
    },
    {
      id: "action",
      header: "Action",
      cell: ({ row }) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSelectedRow(row.original)}
        >
          View Details
        </Button>
      ),
    },
  ];

  // Form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { tone: "formal", toolInstruction: "rag" },
  });
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = form;
  const toolInstruction = watch("toolInstruction");

  return (
    <div className="p-4">
      <BreadcrumbNavigation
        items={[
          {
            label: "Dashboard",
            href: "/email-classification",
            isCurrent: true,
          },
        ]}
      />

      <DataTable
        columns={columns}
        data={displayData}
        totalRecords={hasActiveFilters ? filteredData.length : totalRecords}
        currentPage={currentPage}
        pageSize={pageSize}
        onPageChange={handlePageChange}
        title="Email Classification Results"
        loading={loading}
        customFilters={customFilters}
      />

      {/* Dialog */}
      <Dialog open={!!selectedRow} onOpenChange={() => setSelectedRow(null)}>
        <DialogContent className="max-w-4xl w-[95vw] max-h-[90vh] overflow-y-auto overflow-x-hidden">
          <DialogHeader className="flex-shrink-0 border-b border-gray-200 pb-4">
            <DialogTitle className="text-lg font-semibold text-gray-800">
              Email Classification Details
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              Review classification results and compose a reply for the selected
              email.
            </DialogDescription>
          </DialogHeader>

          {selectedRow && (
            <div className="space-y-4 w-[460px]">
              {/* Email Details Card */}
              <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-lg font-medium text-gray-800 mb-4">
                  Email Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div className="min-w-0">
                    <span className="font-medium text-gray-600">Email ID:</span>
                    <span className="ml-2 text-gray-900 break-words">
                      {selectedRow.email_id}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <span className="font-medium text-gray-600">From:</span>
                    <span className="ml-2 text-gray-900 break-words">
                      {selectedRow.from}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <span className="font-medium text-gray-600">Subject:</span>
                    <span className="ml-2 text-gray-900 break-words">
                      {selectedRow.subject}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <span className="font-medium text-gray-600">Date:</span>
                    <span className="ml-2 text-gray-900 break-words">
                      {new Date(selectedRow.date).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <span className="font-medium text-gray-600">
                      Department:
                    </span>
                    <Badge variant="secondary" className="ml-2 capitalize">
                      {selectedRow.classification_report
                        ?.predicted_department || "N/A"}
                    </Badge>
                  </div>
                  <div className="min-w-0">
                    <span className="font-medium text-gray-600">
                      Confidence:
                    </span>
                    <Badge variant="secondary" className="ml-2">
                      {selectedRow.classification_report?.confidence
                        ? `${(
                            selectedRow.classification_report.confidence * 100
                          ).toFixed(1)}%`
                        : "N/A"}
                    </Badge>
                  </div>
                  <div className="min-w-0">
                    <span className="font-medium text-gray-600">
                      Sentiment Analysis:
                    </span>
                    <Badge variant="secondary" className="ml-2 capitalize">
                      {selectedRow.sentiment_analysis || "N/A"}
                    </Badge>
                  </div>
                </div>
                <div className="mt-4">
                  <span className="font-medium text-gray-600">Email Body:</span>
                  <div className="mt-2 bg-gray-50 p-3 rounded-md border text-sm text-gray-900 whitespace-pre-wrap break-words max-h-32 overflow-y-auto">
                    {selectedRow.body}
                  </div>
                </div>
                {selectedRow.classification_report?.all_probabilities && (
                  <div className="mt-4">
                    <span className="font-medium text-gray-600">
                      All Probabilities:
                    </span>
                    <div className="mt-2 space-y-1 text-xs">
                      {Object.entries(
                        selectedRow.classification_report.all_probabilities
                      ).map(([dept, prob]) => (
                        <div
                          key={dept}
                          className="flex justify-between items-center bg-gray-100 p-2 rounded"
                        >
                          <span className="capitalize break-words flex-1 mr-2">
                            {dept}:
                          </span>
                          <span className="font-medium flex-shrink-0">
                            {((prob as number) * 100).toFixed(1)}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              {/* Reply Form */}
              <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-base font-medium text-gray-800 mb-3">
                  Compose Reply
                </h3>
                <div className="space-y-3">
                  <div>
                    <label
                      htmlFor="email-body"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Email Reply
                    </label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      <Button
                        variant="outline"
                        size="sm"
                        type="button"
                        onClick={() => {
                          const SpeechRecognitionClass =
                            (window as any).SpeechRecognition ||
                            (window as any).webkitSpeechRecognition;
                          if (!SpeechRecognitionClass) {
                            alert(
                              "Speech recognition is not supported in this browser."
                            );
                            return;
                          }
                          const recognition = new SpeechRecognitionClass();
                          recognition.lang = "en-US";
                          recognition.interimResults = false;
                          recognition.maxAlternatives = 1;
                          recognition.onresult = (event: any) => {
                            const transcript = event.results[0][0].transcript;
                            setValue(
                              "emailBody",
                              (watch("emailBody")
                                ? watch("emailBody") + " "
                                : "") + transcript
                            );
                            setLastTranscript(transcript);
                          };
                          recognition.onerror = (event: any) => {
                            alert("Speech recognition error: " + event.error);
                          };
                          recognition.start();
                        }}
                      >
                        🎤 Record
                      </Button>
                      {lastTranscript && (
                        <Button
                          variant="outline"
                          size="sm"
                          type="button"
                          onClick={() => {
                            if ("speechSynthesis" in window) {
                              const utter = new window.SpeechSynthesisUtterance(
                                lastTranscript
                              );
                              window.speechSynthesis.speak(utter);
                            } else {
                              alert(
                                "Speech synthesis is not supported in this browser."
                              );
                            }
                          }}
                        >
                          🔊 Play Last
                        </Button>
                      )}
                    </div>
                    <div className="space-y-2">
                      <label
                        htmlFor="email-body"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Email Reply
                      </label>
                      <Textarea
                        id="email-body"
                        {...register("emailBody")}
                        placeholder="Type or paste your reply here... (Markdown supported)"
                        className="min-h-[100px] max-h-[200px] resize-y focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      {watch("emailBody") && (
                        <div className="mt-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Preview:
                          </label>
                          <div className="bg-gray-50 p-3 rounded-md border text-sm text-gray-900 prose prose-sm max-w-none">
                            <ReactMarkdown>{watch("emailBody")}</ReactMarkdown>
                          </div>
                        </div>
                      )}
                    </div>
                    {errors.emailBody && (
                      <span className="text-red-500 text-sm mt-1 block">
                        {errors.emailBody.message}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Tone
                      </label>
                      <RadioGroup
                        value={watch("tone")}
                        onValueChange={(val) =>
                          setValue(
                            "tone",
                            val as "formal" | "friendly" | "assertive"
                          )
                        }
                        className="flex flex-row gap-3"
                      >
                        {["formal", "friendly", "assertive"].map((tone) => (
                          <label
                            key={tone}
                            className="flex items-center gap-1 cursor-pointer text-xs"
                          >
                            <RadioGroupItem
                              value={tone}
                              id={`tone-${tone}`}
                              className="w-3 h-3"
                            />
                            <span className="capitalize">{tone}</span>
                          </label>
                        ))}
                      </RadioGroup>
                      {errors.tone && (
                        <span className="text-red-500 text-xs">
                          {errors.tone.message}
                        </span>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Tool
                      </label>
                      <RadioGroup
                        value={toolInstruction}
                        onValueChange={(val) =>
                          setValue(
                            "toolInstruction",
                            val as "rag" | "generic" | "database"
                          )
                        }
                        className="flex flex-row gap-2"
                      >
                        {["rag", "generic", "database"].map((tool) => (
                          <label
                            key={tool}
                            className="flex items-center gap-1 cursor-pointer text-xs"
                          >
                            <RadioGroupItem
                              value={tool}
                              id={`tool-${tool}`}
                              className="w-3 h-3"
                            />
                            <span className="capitalize">{tool}</span>
                          </label>
                        ))}
                      </RadioGroup>
                      {errors.toolInstruction && (
                        <span className="text-red-500 text-xs">
                          {errors.toolInstruction.message}
                        </span>
                      )}
                    </div>

                    <div className="space-y-2">
                      {toolInstruction === "rag" && (
                        <>
                          <label
                            htmlFor="collection-name-select"
                            className="block text-sm font-medium text-gray-700"
                          >
                            Collection
                          </label>
                          <Select
                            onValueChange={(val) =>
                              setValue("collectionName", val)
                            }
                            value={
                              watch("collectionName") ||
                              (collections.length > 0
                                ? collections[0].name
                                : "")
                            }
                          >
                            <SelectTrigger
                              id="collection-name-select"
                              className="h-8 text-xs"
                            >
                              <SelectValue placeholder="Select" />
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
                          {errors.collectionName && (
                            <span className="text-red-500 text-xs">
                              {errors.collectionName.message}
                            </span>
                          )}
                        </>
                      )}

                      {toolInstruction === "database" && (
                        <>
                          <label
                            htmlFor="custom-input"
                            className="block text-sm font-medium text-gray-700"
                          >
                            Custom Input
                          </label>
                          <Input
                            id="custom-input"
                            type="text"
                            placeholder="Enter value..."
                            {...register("customInput")}
                            className="h-8 text-xs"
                          />
                          {errors.customInput && (
                            <span className="text-red-500 text-xs">
                              {errors.customInput.message}
                            </span>
                          )}
                        </>
                      )}

                      {toolInstruction === "generic" && (
                        <div className="flex items-end h-full">
                          <Button
                            type="submit"
                            className="w-full h-8 bg-blue-600 hover:bg-blue-700 text-sm"
                            disabled={generatingReply}
                            onClick={handleSubmit(handleGenerateReply)}
                          >
                            {generatingReply
                              ? "Generating..."
                              : "Generate Reply"}
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>

                  {(toolInstruction === "rag" ||
                    toolInstruction === "database") && (
                    <div className="flex justify-end pt-2">
                      <Button
                        type="submit"
                        className="h-8 bg-blue-600 hover:bg-blue-700 text-sm px-4"
                        disabled={generatingReply}
                        onClick={handleSubmit(handleGenerateReply)}
                      >
                        {generatingReply ? "Generating..." : "Generate Reply"}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EmailClassification;
