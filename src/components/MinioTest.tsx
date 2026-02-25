"use client";

import { useState } from "react";
import Button from "@/components/Button";
import { BsCloudArrowUp, BsCloudCheck, BsCloudSlash, BsHourglass, BsBroadcast, BsBucket, BsFileEarmark } from "react-icons/bs";

interface MinioStatus {
  status: "idle" | "testing" | "success" | "error";
  message?: string;
  timestamp?: string;
  details?: {
    bucketExists?: boolean;
    testFileUploaded?: boolean;
    endpoint?: string;
  };
}

export default function MinioTest() {
  const [minioStatus, setMinioStatus] = useState<MinioStatus>({ status: "idle" });

  const testMinio = async () => {
    setMinioStatus({ status: "testing" });
    
    try {
      const response = await fetch("/api/minio-test", {
        method: "POST",
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        setMinioStatus({
          status: "success",
          message: "MinIO connection and bucket test successful!",
          timestamp: new Date().toLocaleString(),
          details: data.data,
        });
      } else {
        setMinioStatus({
          status: "error",
          message: data.error || "MinIO connection failed",
          timestamp: new Date().toLocaleString(),
        });
      }
    } catch (error) {
      setMinioStatus({
        status: "error",
        message: "Failed to reach MinIO test endpoint",
        timestamp: new Date().toLocaleString(),
      });
    }
  };

  const getStatusColor = () => {
    switch (minioStatus.status) {
      case "success":
        return "text-green-600";
      case "error":
        return "text-red-500";
      case "testing":
        return "text-cyan-600";
      default:
        return "text-slate-400";
    }
  };

  const getStatusIcon = () => {
    const baseClass = "h-10 w-10";
    switch (minioStatus.status) {
      case "success":
        return <BsCloudCheck className={`${baseClass} text-green-500`} />;
      case "error":
        return <BsCloudSlash className={`${baseClass} text-red-500`} />;
      case "testing":
        return <BsHourglass className={`${baseClass} text-cyan-500 animate-pulse`} />;
      default:
        return <BsCloudArrowUp className={`${baseClass} text-cyan-600`} />;
    }
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 sm:p-8 max-w-md w-full shadow-sm">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-cyan-50">
          {getStatusIcon()}
        </div>
        
        <h3 className="text-lg font-semibold text-slate-900 mb-1">
          Object Storage
        </h3>
        <p className="text-sm text-slate-500 mb-6">
          MinIO bucket connection and file operations test
        </p>
        
        <Button 
          onClick={testMinio} 
          variant={minioStatus.status === "success" ? "secondary" : "primary"}
          className="w-full mb-4"
        >
          {minioStatus.status === "testing" ? "Testing..." : "Test Connection"}
        </Button>
        
        {minioStatus.message && (
          <div className={`text-sm ${getStatusColor()}`}>
            <p className="font-medium">{minioStatus.message}</p>
            {minioStatus.details && (
              <div className="text-xs mt-3 space-y-1.5 text-slate-500">
                {minioStatus.details.endpoint && (
                  <p className="flex items-center justify-center gap-1.5">
                    <BsBroadcast className="h-3.5 w-3.5" />
                    Endpoint: {minioStatus.details.endpoint}
                  </p>
                )}
                {typeof minioStatus.details.bucketExists === 'boolean' && (
                  <p className="flex items-center justify-center gap-1.5">
                    <BsBucket className="h-3.5 w-3.5" />
                    Bucket: {minioStatus.details.bucketExists ? 'Exists' : 'Created'}
                  </p>
                )}
                {typeof minioStatus.details.testFileUploaded === 'boolean' && (
                  <p className="flex items-center justify-center gap-1.5">
                    <BsFileEarmark className="h-3.5 w-3.5" />
                    Test File: {minioStatus.details.testFileUploaded ? 'Uploaded & Deleted' : 'Failed'}
                  </p>
                )}
              </div>
            )}
            {minioStatus.timestamp && (
              <p className="text-xs mt-1 text-slate-400">
                {minioStatus.timestamp}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}