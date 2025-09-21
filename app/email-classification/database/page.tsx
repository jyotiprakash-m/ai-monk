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

// Dummy data for five tables
const tableData = {
  Users: Array.from({ length: 10 }, (_, i) => ({
    id: i + 1,
    name: `User ${i + 1}`,
    email: `user${i + 1}@example.com`,
  })),
  Orders: Array.from({ length: 10 }, (_, i) => ({
    id: i + 1,
    product: `Product ${i + 1}`,
    amount: (i + 1) * 10,
  })),
  Products: Array.from({ length: 10 }, (_, i) => ({
    id: i + 1,
    name: `Product ${i + 1}`,
    price: (i + 1) * 5,
  })),
  Categories: Array.from({ length: 10 }, (_, i) => ({
    id: i + 1,
    category: `Category ${i + 1}`,
  })),
  Reviews: Array.from({ length: 10 }, (_, i) => ({
    id: i + 1,
    review: `Review ${i + 1}`,
    rating: (i % 5) + 1,
  })),
};

const tableColumns = {
  Users: [
    { accessorKey: "id", header: "ID" },
    { accessorKey: "name", header: "Name" },
    { accessorKey: "email", header: "Email" },
  ],
  Orders: [
    { accessorKey: "id", header: "ID" },
    { accessorKey: "product", header: "Product" },
    { accessorKey: "amount", header: "Amount" },
  ],
  Products: [
    { accessorKey: "id", header: "ID" },
    { accessorKey: "name", header: "Name" },
    { accessorKey: "price", header: "Price" },
  ],
  Categories: [
    { accessorKey: "id", header: "ID" },
    { accessorKey: "category", header: "Category" },
  ],
  Reviews: [
    { accessorKey: "id", header: "ID" },
    { accessorKey: "review", header: "Review" },
    { accessorKey: "rating", header: "Rating" },
  ],
};

const tableNames = Object.keys(tableData);

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
    <div className="mt-10 p-6 bg-white rounded-xl shadow-lg border flex flex-col gap-8">
      <h2 className="text-2xl font-bold mb-2 text-gray-800">Database Tables</h2>
      <Button onClick={() => setShowErd(true)}>Show ERD</Button>
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
                className="overflow-auto max-h-[400px] relative select-none"
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
              className="border rounded-lg p-4 bg-gray-50 shadow"
            >
              <h3 className="text-lg font-semibold mb-2">{table}</h3>
              <DataTable<any, any>
                columns={tableColumns[table as keyof typeof tableColumns]}
                data={tableData[table as keyof typeof tableData]}
                totalRecords={tableData[table as keyof typeof tableData].length}
                currentPage={1}
                pageSize={tableData[table as keyof typeof tableData].length}
                onPageChange={() => {}}
                title={table}
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default DatabasePage;
