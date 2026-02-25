import { NextRequest, NextResponse } from "next/server";
import { features } from "@/lib/features";

export async function POST(req: NextRequest) {
  try {
    console.log("Database test API called");
    
    // Check if database feature is enabled
    if (!features.database) {
      console.log("Database feature disabled");
      return NextResponse.json(
        { 
          success: false, 
          error: "Database feature is disabled. Set ENABLE_DATABASE=true in .env.local" 
        },
        { status: 400 }
      );
    }

    console.log("Database feature enabled, importing db utilities");

    // Import database utilities (only if database is enabled)
    const { testConnection, query } = await import("@/lib/db");

    console.log("Testing database connection");

    // Test the connection
    const isConnected = await testConnection();

    console.log("Connection test result:", isConnected);

    if (!isConnected) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Database connection failed. Check your DATABASE_URL and database server status." 
        },
        { status: 500 }
      );
    }

    console.log("Connection successful, running query");

    // Run a simple query to ensure database is working
    const result = await query<{current_time: Date, db_version: string}>("SELECT NOW() as current_time, version() as db_version");
    const dbInfo = result[0];

    console.log("Query result:", dbInfo);

    return NextResponse.json({
      success: true,
      message: "Database connection successful",
      data: {
        connected: true,
        timestamp: dbInfo?.current_time,
        version: dbInfo?.db_version?.split(' ')[0] || "PostgreSQL", // Just the version number
      },
    });

  } catch (error) {
    console.error("Database test error:", error);
    
    // More specific error messages
    let errorMessage = "Database connection failed";
    if (error instanceof Error) {
      if (error.message.includes("ECONNREFUSED")) {
        errorMessage = "Cannot connect to database server. Check if PostgreSQL is running.";
      } else if (error.message.includes("authentication")) {
        errorMessage = "Database authentication failed. Check credentials in DATABASE_URL.";
      } else if (error.message.includes("database") && error.message.includes("does not exist")) {
        errorMessage = "Database does not exist. Check database name in DATABASE_URL.";
      } else {
        errorMessage = error.message;
      }
    }

    return NextResponse.json(
      { 
        success: false, 
        error: errorMessage 
      },
      { status: 500 }
    );
  }
}