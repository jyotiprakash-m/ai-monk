import React from "react";

const LoaderSkeleton = () => {
  return (
    <div>
      <div className="grid auto-rows-min gap-4 md:grid-cols-3 mb-2">
        <div className="bg-muted/50 aspect-video rounded-xl animate-fade-in" />
        <div className="bg-muted/50 aspect-video rounded-xl animate-fade-in delay-100" />
        <div className="bg-muted/50 aspect-video rounded-xl animate-fade-in delay-200" />
      </div>
      <div className="bg-muted/50 h-[70vh] flex-1 rounded-xl md:min-h-min animate-fade-in-up delay-300" />
    </div>
  );
};

export default LoaderSkeleton;
