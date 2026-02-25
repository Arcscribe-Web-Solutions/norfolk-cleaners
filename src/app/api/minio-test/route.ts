import { NextRequest, NextResponse } from "next/server";
import { features } from "@/lib/features";

export async function POST(req: NextRequest) {
  try {
    console.log("MinIO test API called");
    
    // Check if storage feature is enabled
    if (!features.storage) {
      console.log("Storage feature disabled");
      return NextResponse.json(
        { 
          success: false, 
          error: "Storage feature is disabled. Set ENABLE_STORAGE=true in .env.local" 
        },
        { status: 400 }
      );
    }

    console.log("Storage feature enabled, importing storage utilities");

    // Import storage utilities (only if storage is enabled)
    const { 
      testConnection, 
      ensureBucket, 
      bucketExists, 
      uploadFile, 
      deleteFile, 
      fileExists 
    } = await import("@/lib/storage");

    const bucketName = process.env.MINIO_BUCKET || "uploads";
    const endpoint = process.env.MINIO_ENDPOINT || "localhost:9000";

    console.log(`Testing MinIO connection to ${endpoint} with bucket ${bucketName}`);

    // Test basic connection
    const isConnected = await testConnection();
    
    if (!isConnected) {
      return NextResponse.json(
        { 
          success: false, 
          error: "MinIO connection failed. Check MINIO_ENDPOINT, credentials, and server status." 
        },
        { status: 500 }
      );
    }

    console.log("Basic connection successful");

    // Check if bucket exists, create if not
    const bucketExisted = await bucketExists(bucketName);
    console.log(`Bucket ${bucketName} exists:`, bucketExisted);
    
    if (!bucketExisted) {
      console.log(`Creating bucket ${bucketName}`);
      await ensureBucket(bucketName);
    }

    // Test file upload and deletion
    const testFileName = `test-${Date.now()}.txt`;
    const testContent = "Norfolk Cleaners MinIO Test - " + new Date().toISOString();

    console.log(`Uploading test file: ${testFileName}`);
    
    try {
      // Upload test file
      await uploadFile(testFileName, testContent, "text/plain", bucketName);
      
      // Verify file exists
      const fileWasUploaded = await fileExists(testFileName, bucketName);
      console.log(`Test file uploaded successfully:`, fileWasUploaded);

      // Clean up - delete test file
      if (fileWasUploaded) {
        await deleteFile(testFileName, bucketName);
        console.log(`Test file deleted`);
      }

      return NextResponse.json({
        success: true,
        message: "MinIO storage test successful",
        data: {
          connected: true,
          endpoint: endpoint,
          bucketExists: bucketExisted,
          testFileUploaded: fileWasUploaded,
          timestamp: new Date().toISOString(),
        },
      });

    } catch (uploadError) {
      console.error("File upload test failed:", uploadError);
      return NextResponse.json(
        { 
          success: false, 
          error: `File operations failed: ${uploadError instanceof Error ? uploadError.message : 'Unknown error'}` 
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error("MinIO test error:", error);
    
    // More specific error messages
    let errorMessage = "MinIO storage test failed";
    if (error instanceof Error) {
      if (error.message.includes("ECONNREFUSED") || error.message.includes("fetch failed")) {
        errorMessage = "Cannot connect to MinIO server. Check MINIO_ENDPOINT and server status.";
      } else if (error.message.includes("InvalidAccessKeyId") || error.message.includes("SignatureDoesNotMatch")) {
        errorMessage = "MinIO authentication failed. Check MINIO_ACCESS_KEY and MINIO_SECRET_KEY.";
      } else if (error.message.includes("NoSuchBucket")) {
        errorMessage = "Bucket does not exist and could not be created.";
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