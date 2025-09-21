"use client";
import LoaderSkeleton from "@/components/common/LoaderSkeleton";
import { BreadcrumbNavigation } from "@/components/modern-layout/breadcrumb-navigation";
import React, { useState } from "react";
const breadcrumbItems = [
  {
    label: "Building Your Application",
    href: "#",
    className: "hidden md:block",
  },
  { label: "Data Fetching", isCurrent: true },
];

const EmailClassification = () => {
  const [loading, setLoading] = useState(false);
  return (
    <div className="p-4">
      <BreadcrumbNavigation items={breadcrumbItems} />
      {loading ? (
        <LoaderSkeleton />
      ) : (
        <div>{/* Add actual content here once loading is false */}</div>
      )}
    </div>
  );
};

export default EmailClassification;
