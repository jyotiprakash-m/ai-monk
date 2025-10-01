"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import ChatRagMessenger from "./components/ChatRagMessanger";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const collections = Array(9).fill({
  collection_name: "Collection Name",
  database: "Database Name",
  file: "File Name",
  type: "Type",
  created_at: "2025-10-01",
});

const AdvRagPage = () => {
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);

  return (
    <div className="p-10">
      <div className="flex items-center justify-between mb-6">
       <h2 className="text-2xl font-bold mb-8">Dashboard</h2>
       <Link href="/adv-rag/create">
         <Button variant="outline" className="text-blue-600 hover:underline mb-6 inline-block ">
           Create
         </Button>
       </Link>
      </div>
      <div className="grid grid-cols-3 gap-10 max-w-[900px] mx-auto">
        {collections.map((item, idx) => {
          const isSelected = selectedIdx === idx;
          return (
            <Card
              key={idx}
              onClick={() => setSelectedIdx(idx)}
              className={`border-2 rounded-2xl bg-white py-7 px-6 font-medium text-base shadow-lg transition-all duration-200 group cursor-pointer
                hover:shadow-2xl hover:-translate-y-1 hover:border-blue-400
                hover:bg-blue-50 hover:scale-[1.04]
                ${isSelected ? "border-blue-600 bg-blue-50 text-blue-700" : ""}`}
            >
              <CardContent className="flex flex-col gap-3">
                <div className={`font-bold text-xl mb-2 tracking-tight ${isSelected ? "text-blue-700" : "text-gray-800"}`}>{item.collection_name || `Index ${idx + 1}`}</div>
                <div className="flex flex-col gap-1 text-[15px]">
                  <div><span className="font-semibold text-gray-500">Database:</span> <span className="text-gray-700">{item.database}</span></div>
                  <div><span className="font-semibold text-gray-500">File:</span> <span className="text-gray-700">{item.file}</span></div>
                  <div><span className="font-semibold text-gray-500">Type:</span> <span className="text-gray-700">{item.type}</span></div>
                  <div><span className="font-semibold text-gray-500">Created:</span> <span className="text-gray-700">{item.created_at}</span></div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Slide-over ChatRagMessenger */}
      <Sheet open={selectedIdx !== null} onOpenChange={(open) => !open && setSelectedIdx(null)} >
        <SheetContent side="right" className="!max-w-3xl p-0">
          {/* Accessible title for dialog */}
          <SheetTitle>
            <VisuallyHidden>Chat Messenger Panel</VisuallyHidden>
          </SheetTitle>
          {selectedIdx !== null && (
            <ChatRagMessenger card={collections[selectedIdx]} idx={selectedIdx} />
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default AdvRagPage;