"use client";
import React, { useState, useCallback, useRef, useEffect } from "react";
import { DataTable } from "@/components/ui/data-table";
import { TableMultiSelect } from "@/components/common/TableMultiSelect";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { apiClient } from "@/lib/api";

const tableColumns = {
  Users: [
    { accessorKey: "user_id", header: "User ID" },
    { accessorKey: "username", header: "Username" },
    { accessorKey: "email", header: "Email" },
    { accessorKey: "password_hash", header: "Password Hash" },
    { accessorKey: "first_name", header: "First Name" },
    { accessorKey: "last_name", header: "Last Name" },
    { accessorKey: "phone", header: "Phone" },
    { accessorKey: "employee_id", header: "Employee ID" },
    { accessorKey: "designation", header: "Designation" },
    { accessorKey: "department", header: "Department" },
    { accessorKey: "office_address", header: "Office Address" },
    { accessorKey: "user_role", header: "User Role" },
    { accessorKey: "approval_level", header: "Approval Level" },
    { accessorKey: "is_active", header: "Is Active" },
    { accessorKey: "last_login", header: "Last Login" },
    { accessorKey: "created_at", header: "Created At" },
    { accessorKey: "updated_at", header: "Updated At" },
  ],
  Orders: [
    { accessorKey: "order_id", header: "Order ID" },
    { accessorKey: "application_id", header: "Application ID" },
    { accessorKey: "order_number", header: "Order Number" },
    { accessorKey: "order_type", header: "Order Type" },
    { accessorKey: "vendor_name", header: "Vendor Name" },
    { accessorKey: "vendor_contact", header: "Vendor Contact" },
    { accessorKey: "vendor_address", header: "Vendor Address" },
    { accessorKey: "order_amount", header: "Order Amount" },
    { accessorKey: "order_date", header: "Order Date" },
    { accessorKey: "status", header: "Status" },
    { accessorKey: "created_at", header: "Created At" },
    { accessorKey: "updated_at", header: "Updated At" },
  ],

  Applications: [
    { accessorKey: "status", header: "Status" },
    { accessorKey: "description", header: "Description" },
    { accessorKey: "estimated_cost", header: "Estimated Cost" },
    { accessorKey: "priority_level", header: "Priority Level" },
    { accessorKey: "application_type", header: "Application Type" },
    { accessorKey: "applicant_user_id", header: "Applicant User ID" },
    { accessorKey: "application_number", header: "Application Number" },
  ],
  Approvals: [
    { accessorKey: "approval_id", header: "Approval ID" },
    { accessorKey: "application_id", header: "Application ID" },
    { accessorKey: "approver_user_id", header: "Approver User ID" },
    { accessorKey: "approval_level", header: "Approval Level" },
    { accessorKey: "approval_status", header: "Approval Status" },
    { accessorKey: "approval_date", header: "Approval Date" },
    { accessorKey: "comments", header: "Comments" },
    { accessorKey: "created_at", header: "Created At" },
  ],
  OrderItems: [
    { accessorKey: "item_id", header: "Item ID" },
    { accessorKey: "order_id", header: "Order ID" },
    { accessorKey: "item_name", header: "Item Name" },
    { accessorKey: "item_description", header: "Item Description" },
    { accessorKey: "quantity", header: "Quantity" },
    { accessorKey: "unit_price", header: "Unit Price" },
    { accessorKey: "total_price", header: "Total Price" },
    { accessorKey: "specifications", header: "Specifications" },
  ],
  Deliveries: [
    { accessorKey: "delivery_id", header: "Delivery ID" },
    { accessorKey: "order_id", header: "Order ID" },
    { accessorKey: "delivery_number", header: "Delivery Number" },
    { accessorKey: "delivery_agent_user_id", header: "Delivery Agent User ID" },
    { accessorKey: "delivery_date", header: "Delivery Date" },
    { accessorKey: "delivery_address", header: "Delivery Address" },
    { accessorKey: "delivery_contact", header: "Delivery Contact" },
    { accessorKey: "tracking_number", header: "Tracking Number" },
    { accessorKey: "delivery_status", header: "Delivery Status" },
    { accessorKey: "delivery_notes", header: "Delivery Notes" },
    { accessorKey: "received_by_user_id", header: "Received By User ID" },
    { accessorKey: "received_date", header: "Received Date" },
    { accessorKey: "created_at", header: "Created At" },
    { accessorKey: "updated_at", header: "Updated At" },
  ],
  AuditLogs: [
    { accessorKey: "log_id", header: "Log ID" },
    { accessorKey: "table_name", header: "Table Name" },
    { accessorKey: "record_id", header: "Record ID" },
    { accessorKey: "action", header: "Action" },
    { accessorKey: "old_values", header: "Old Values" },
    { accessorKey: "new_values", header: "New Values" },
    { accessorKey: "changed_by_user_id", header: "Changed By User ID" },
    { accessorKey: "changed_at", header: "Changed At" },
  ],
  Documents: [
    { accessorKey: "document_id", header: "Document ID" },
    { accessorKey: "document_name", header: "Document Name" },
    { accessorKey: "document_type", header: "Document Type" },
    { accessorKey: "file_path", header: "File Path" },
    { accessorKey: "uploaded_by_user_id", header: "Uploaded By User ID" },
    { accessorKey: "upload_date", header: "Upload Date" },
    { accessorKey: "file_size", header: "File Size" },
    { accessorKey: "mime_type", header: "MIME Type" },
    { accessorKey: "status", header: "Status" },
    { accessorKey: "created_at", header: "Created At" },
    { accessorKey: "updated_at", header: "Updated At" },
  ],
};

const tableNames = Object.keys(tableColumns);

interface TableData {
  [key: string]: any[];
}

interface TableLoadingState {
  [key: string]: boolean;
}

interface TableErrorState {
  [key: string]: string | null;
}

const DatabasePage = () => {
  const [selectedTables, setSelectedTables] = useState<string[]>([
    tableNames[0],
  ]);
  const [showErd, setShowErd] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [startDrag, setStartDrag] = useState<{ x: number; y: number } | null>(
    null
  );
  const containerRef = useRef<HTMLDivElement>(null);

  // API state management
  const [tableData, setTableData] = useState<TableData>({});
  const [tableLoading, setTableLoading] = useState<TableLoadingState>({});
  const [tableErrors, setTableErrors] = useState<TableErrorState>({});
  const [tableTotalRecords, setTableTotalRecords] = useState<{
    [key: string]: number;
  }>({});

  // Load data for selected tables
  const loadTableData = useCallback(
    async (tableName: string, page: number = 1) => {
      setTableLoading((prev) => ({ ...prev, [tableName]: true }));
      setTableErrors((prev) => ({ ...prev, [tableName]: null }));

      try {
        const [dataResponse, countResponse] = await Promise.all([
          apiClient.getTableData(tableName, page),
          apiClient.getTableCount(tableName),
        ]);

        setTableData((prev) => ({ ...prev, [tableName]: dataResponse.data }));
        setTableTotalRecords((prev) => ({
          ...prev,
          [tableName]: countResponse.count,
        }));
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to load data";
        setTableErrors((prev) => ({ ...prev, [tableName]: errorMessage }));
        // Fallback to empty array
        setTableData((prev) => ({ ...prev, [tableName]: [] }));
        setTableTotalRecords((prev) => ({ ...prev, [tableName]: 0 }));
      } finally {
        setTableLoading((prev) => ({ ...prev, [tableName]: false }));
      }
    },
    []
  );

  // Load data when tables are selected
  useEffect(() => {
    selectedTables.forEach((tableName) => {
      if (!tableData[tableName] && !tableLoading[tableName]) {
        loadTableData(tableName);
      }
    });
  }, [selectedTables, tableData, tableLoading, loadTableData]);

  // Mouse drag handlers for image pan
  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLImageElement>) => {
      e.preventDefault();
      setDragging(true);
      setStartDrag({ x: e.clientX - offsetX, y: e.clientY - offsetY });
    },
    [offsetX, offsetY]
  );

  // Global mouse event handlers for smoother dragging
  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (dragging && startDrag) {
        e.preventDefault();
        const newOffsetX = e.clientX - startDrag.x;
        const newOffsetY = e.clientY - startDrag.y;

        // Add boundaries to prevent dragging outside container
        const container = containerRef.current;
        if (container) {
          const containerRect = container.getBoundingClientRect();
          const maxOffsetX = containerRect.width / 2;
          const maxOffsetY = containerRect.height / 2;

          setOffsetX(Math.max(-maxOffsetX, Math.min(maxOffsetX, newOffsetX)));
          setOffsetY(Math.max(-maxOffsetY, Math.min(maxOffsetY, newOffsetY)));
        } else {
          setOffsetX(newOffsetX);
          setOffsetY(newOffsetY);
        }
      }
    };

    const handleGlobalMouseUp = () => {
      setDragging(false);
      setStartDrag(null);
    };

    if (dragging) {
      document.addEventListener("mousemove", handleGlobalMouseMove);
      document.addEventListener("mouseup", handleGlobalMouseUp);
      document.body.style.userSelect = "none";
    }

    return () => {
      document.removeEventListener("mousemove", handleGlobalMouseMove);
      document.removeEventListener("mouseup", handleGlobalMouseUp);
      document.body.style.userSelect = "";
    };
  }, [dragging, startDrag]);

  return (
    <div className="mt-10 p-6 bg-white rounded-xl shadow-lg border flex flex-col gap-8 max-w-full overflow-hidden">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Database Tables</h2>
        <div className="flex gap-2">
          <Button
            onClick={() => {
              selectedTables.forEach((table) => loadTableData(table));
            }}
            variant="outline"
          >
            Refresh All
          </Button>
          <Button onClick={() => setShowErd(true)}>Show ERD</Button>
        </div>
      </div>
      <Dialog open={showErd} onOpenChange={setShowErd}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Entity Relationship Diagram</DialogTitle>
            <DialogDescription>
              This is a sample ERD for the database tables.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center items-center py-4">
            <div className="flex flex-col items-center gap-4">
              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    setZoom(Math.max(0.5, zoom - 0.1));
                    setOffsetX(0);
                    setOffsetY(0);
                  }}
                  variant="outline"
                >
                  Zoom Out
                </Button>
                <Button
                  onClick={() => {
                    setZoom(Math.min(2, zoom + 0.1));
                    setOffsetX(0);
                    setOffsetY(0);
                  }}
                  variant="outline"
                >
                  Zoom In
                </Button>
              </div>
              <div
                ref={containerRef}
                className="overflow-auto max-h-[400px] relative select-none max-w-full"
                style={{ userSelect: "none" }}
              >
                <img
                  src="/erd_email_classification.png"
                  alt="ERD Diagram"
                  className={`rounded shadow border transition-none ${
                    dragging ? "cursor-grabbing" : "cursor-grab"
                  }`}
                  style={{
                    transform: `scale(${zoom}) translate(${offsetX}px, ${offsetY}px)`,
                    transformOrigin: "top left",
                  }}
                  onMouseDown={handleMouseDown}
                  draggable={false}
                />
              </div>
            </div>
          </div>
          <DialogClose asChild>
            <Button variant="outline">Close</Button>
          </DialogClose>
        </DialogContent>
      </Dialog>
      <div>
        <label className="block text-base font-medium mb-2 text-gray-700">
          Select Tables to Show
        </label>
        <TableMultiSelect
          options={tableNames}
          selected={selectedTables}
          onChange={setSelectedTables}
        />
      </div>
      <div className="flex flex-col gap-8">
        {selectedTables.length === 0 ? (
          <div className="text-center text-gray-500">No tables selected.</div>
        ) : (
          selectedTables.map((table) => (
            <div
              key={table}
              className="border rounded-lg p-4 bg-gray-50 shadow overflow-x-auto"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold">{table}</h3>
                <Button
                  onClick={() => loadTableData(table)}
                  variant="ghost"
                  size="sm"
                  disabled={tableLoading[table]}
                >
                  {tableLoading[table] ? "Loading..." : "Refresh"}
                </Button>
              </div>

              {tableErrors[table] && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                  <div className="flex items-center justify-between">
                    <p className="text-red-600 text-sm">
                      Error: {tableErrors[table]}
                    </p>
                    <Button
                      onClick={() => loadTableData(table)}
                      variant="outline"
                      size="sm"
                    >
                      Retry
                    </Button>
                  </div>
                </div>
              )}

              {tableLoading[table] ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-2 text-gray-600">Loading {table}...</span>
                </div>
              ) : (
                <div className="min-w-max">
                  <DataTable<any, any>
                    columns={tableColumns[table as keyof typeof tableColumns]}
                    data={tableData[table] || []}
                    totalRecords={tableTotalRecords[table] || 0}
                    currentPage={1}
                    pageSize={(tableData[table] || []).length}
                    onPageChange={(page) => loadTableData(table, page)}
                    title={table}
                    loading={tableLoading[table]}
                  />
                  {tableTotalRecords[table] >
                    (tableData[table] || []).length && (
                    <div className="mt-2 text-sm text-gray-500">
                      Showing {(tableData[table] || []).length} of{" "}
                      {tableTotalRecords[table]} records
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default DatabasePage;
