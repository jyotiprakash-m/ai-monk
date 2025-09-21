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
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerClose,
} from "@/components/ui/drawer";

// ----------------- Schema -----------------
const formSchema = z.object({
  emailBody: z.string().min(1, "Email body is required"),
  tone: z.enum(["formal", "friendly", "assertive"]),
  toolInstruction: z.enum(["rag", "generic", "database"]),
  collectionName: z.string().optional(),
  customInput: z.string().optional(),
});
type FormValues = z.infer<typeof formSchema>;

// ----------------- Dummy Data -----------------
type User = { id: number; from: string; subject: string };

const allUsers: User[] = Array.from({ length: 100 }, (_, i) => ({
  id: i + 1,
  from: `user${i + 1}@example.com`,
  subject: `User ${i + 1} subject`,
}));

function fetchUsers(
  offset: number,
  limit: number
): Promise<{ items: User[]; total: number }> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        items: allUsers.slice(offset, offset + limit),
        total: allUsers.length,
      });
    }, 2000);
  });
}

// ----------------- Component -----------------
const EmailClassification = () => {
  const [lastTranscript, setLastTranscript] = useState<string>("");
  const [data, setData] = useState<User[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [selectedRow, setSelectedRow] = useState<User | null>(null);

  const pageSize = 10;

  // Load data
  const loadData = async (page: number) => {
    setLoading(true);
    const offset = (page - 1) * pageSize;
    const result = await fetchUsers(offset, pageSize);
    setData(result.items);
    setTotalRecords(result.total);
    setCurrentPage(page);
    setLoading(false);
  };

  useEffect(() => {
    loadData(1);
  }, []);

  // Columns
  const columns: ColumnDef<User>[] = [
    { accessorKey: "id", header: "ID" },
    { accessorKey: "from", header: "From" },
    { accessorKey: "subject", header: "Subject" },
    {
      id: "action",
      header: "Action",
      cell: ({ row }) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSelectedRow(row.original)}
        >
          View
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
        data={data}
        totalRecords={totalRecords}
        currentPage={currentPage}
        pageSize={pageSize}
        onPageChange={loadData}
        title="User Data"
        loading={loading}
      />

      {/* Drawer */}
      <Drawer open={!!selectedRow} onOpenChange={() => setSelectedRow(null)}>
        <DrawerContent className=" w-full ml-auto">
          <DrawerHeader className="flex-shrink-0 border-b">
            <DrawerTitle>Selected User</DrawerTitle>
            <DrawerDescription>
              Details of the selected user row
            </DrawerDescription>
          </DrawerHeader>

          {selectedRow && (
            <>
              <div className="p-6 mb-4 rounded-lg bg-white shadow-md border border-gray-200 flex flex-col gap-2">
                <div className="text-sm text-gray-500 font-semibold">
                  ID:{" "}
                  <span className="text-gray-900 font-normal">
                    {selectedRow.id}
                  </span>
                </div>
                <div className="text-sm text-gray-500 font-semibold">
                  From:{" "}
                  <span className="text-gray-900 font-normal">
                    {selectedRow.from}
                  </span>
                </div>
                <div className="text-sm text-gray-500 font-semibold">
                  Subject:{" "}
                  <span className="text-gray-900 font-normal">
                    {selectedRow.subject}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 border-t bg-gray-50 shadow-inner rounded-lg">
                <div className="col-span-1 md:col-span-2 flex flex-col">
                  <label
                    htmlFor="email-body"
                    className="font-medium text-base mb-2"
                  >
                    Email Reply
                  </label>
                  <div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mr-2"
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
                      Record
                    </Button>
                    {lastTranscript && (
                      <Button
                        variant="ghost"
                        size="sm"
                        type="button"
                        className="mt-2"
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
                        Play
                      </Button>
                    )}
                    {/*  Show the canvas only if there's a lastTranscript */}
                  </div>

                  <Textarea
                    id="email-body"
                    {...register("emailBody")}
                    placeholder="Type or paste the email body here..."
                    className="min-h-[120px]"
                  />
                </div>
                <form
                  onSubmit={handleSubmit((data) =>
                    console.log("Form submitted:", data)
                  )}
                  className="flex flex-col gap-4"
                >
                  {/* Tone */}
                  <label className="font-medium text-base">Tone</label>
                  <RadioGroup
                    value={watch("tone")}
                    onValueChange={(val) =>
                      setValue(
                        "tone",
                        val as "formal" | "friendly" | "assertive"
                      )
                    }
                    className="flex flex-row gap-4"
                  >
                    {["formal", "friendly", "assertive"].map((tone) => (
                      <label key={tone} className="flex items-center gap-2">
                        <RadioGroupItem value={tone} id={`tone-${tone}`} />
                        <span className="capitalize">{tone}</span>
                      </label>
                    ))}
                  </RadioGroup>
                  {errors.tone && (
                    <span className="text-red-500 text-sm">
                      {errors.tone.message}
                    </span>
                  )}

                  {/* Tool Instruction */}
                  <label className="font-medium text-base">
                    Tool Instruction
                  </label>
                  <RadioGroup
                    value={toolInstruction}
                    onValueChange={(val) =>
                      setValue(
                        "toolInstruction",
                        val as "rag" | "generic" | "database"
                      )
                    }
                    className="flex flex-row gap-4"
                  >
                    {["rag", "generic", "database"].map((tool) => (
                      <label key={tool} className="flex items-center gap-2">
                        <RadioGroupItem value={tool} id={`tool-${tool}`} />
                        <span className="capitalize">{tool}</span>
                      </label>
                    ))}
                  </RadioGroup>
                  {errors.toolInstruction && (
                    <span className="text-red-500 text-sm">
                      {errors.toolInstruction.message}
                    </span>
                  )}

                  {/* Conditional input for RAG */}
                  {toolInstruction === "rag" && (
                    <div>
                      <label
                        htmlFor="collection-name-select"
                        className="font-medium text-base"
                      >
                        Collection Name
                      </label>
                      <Select
                        onValueChange={(val) => setValue("collectionName", val)}
                        value={watch("collectionName") || "collectionA"}
                      >
                        <SelectTrigger
                          id="collection-name-select"
                          className="mt-2 w-full min-w-[220px]"
                        >
                          <span className="flex-1 text-left">
                            <SelectValue placeholder="Select a collection" />
                          </span>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="collectionA">
                            Collection A
                          </SelectItem>
                          <SelectItem value="collectionB">
                            Collection B
                          </SelectItem>
                          <SelectItem value="collectionC">
                            Collection C
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.collectionName && (
                        <span className="text-red-500 text-sm">
                          {errors.collectionName.message}
                        </span>
                      )}
                    </div>
                  )}
                  {/* Conditional input for Database */}
                  {toolInstruction === "database" && (
                    <div>
                      <label
                        htmlFor="custom-input"
                        className="font-medium text-base"
                      >
                        Custom Input
                      </label>
                      <Input
                        id="custom-input"
                        type="text"
                        placeholder="Enter custom value..."
                        {...register("customInput")}
                        className="text-base mt-2"
                      />
                      {errors.customInput && (
                        <span className="text-red-500 text-sm">
                          {errors.customInput.message}
                        </span>
                      )}
                    </div>
                  )}

                  <Button type="submit" className="self-end">
                    Generate
                  </Button>
                </form>
              </div>
            </>
          )}
        </DrawerContent>
      </Drawer>
    </div>
  );
};

export default EmailClassification;
