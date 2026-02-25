"use client";

import { useState } from "react";
import Button from "@/components/Button";
import { BsDatabase, BsDatabaseCheck, BsDatabaseX, BsHourglass } from "react-icons/bs";

interface DatabaseStatus {
  status: "idle" | "testing" | "success" | "error";
  message?: string;
  timestamp?: string;
}

export default function DatabaseTest() {
  const [dbStatus, setDbStatus] = useState<DatabaseStatus>({ status: "idle" });

  const testDatabase = async () => {
    setDbStatus({ status: "testing" });
    
    try {
      const response = await fetch("/api/database-test", {
        method: "POST",
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        setDbStatus({
          status: "success",
          message: "Database connection successful!",
          timestamp: new Date().toLocaleString(),
        });
      } else {
        setDbStatus({
          status: "error",
          message: data.error || "Database connection failed",
          timestamp: new Date().toLocaleString(),
        });
      }
    } catch (error) {
      setDbStatus({
        status: "error",
        message: "Failed to reach database test endpoint",
        timestamp: new Date().toLocaleString(),
      });
    }
  };

  const getStatusColor = () => {
    switch (dbStatus.status) {
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
    switch (dbStatus.status) {
      case "success":
        return <BsDatabaseCheck className={`${baseClass} text-green-500`} />;
      case "error":
        return <BsDatabaseX className={`${baseClass} text-red-500`} />;
      case "testing":
        return <BsHourglass className={`${baseClass} text-cyan-500 animate-pulse`} />;
      default:
        return <BsDatabase className={`${baseClass} text-cyan-600`} />;
    }
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 sm:p-8 max-w-md w-full shadow-sm">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-cyan-50">
          {getStatusIcon()}
        </div>
        
        <h3 className="text-lg font-semibold text-slate-900 mb-1">
          Database
        </h3>
        <p className="text-sm text-slate-500 mb-6">
          Coolify PostgreSQL connection test
        </p>
        
        <Button 
          onClick={testDatabase} 
          variant={dbStatus.status === "success" ? "secondary" : "primary"}
          className="w-full mb-4"
        >
          {dbStatus.status === "testing" ? "Testing..." : "Test Connection"}
        </Button>
        
        {dbStatus.message && (
          <div className={`text-sm ${getStatusColor()}`}>
            <p className="font-medium">{dbStatus.message}</p>
            {dbStatus.timestamp && (
              <p className="text-xs mt-1 text-slate-400">
                {dbStatus.timestamp}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}