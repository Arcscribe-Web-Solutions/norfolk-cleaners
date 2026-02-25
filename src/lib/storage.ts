/**
 * MinIO Object Storage Client
 * ---------------------------
 * Optional - disabled by default. Set ENABLE_STORAGE=true to activate.
 *
 * Purpose-built for MinIO. Uses the AWS SDK v3 S3 client under the hood
 * (MinIO is S3-compatible) but all configuration is MinIO-first:
 *   - Path-style access is always enabled (required by MinIO)
 *   - No AWS region concept - uses a dummy region internally
 *   - Bucket auto-creation via `ensureBucket()`
 */

import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
  CreateBucketCommand,
  HeadBucketCommand,
  type PutObjectCommandInput,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { requireFeature } from "./features";

// ---------------------------------------------------------------------------
// Singleton
// ---------------------------------------------------------------------------

const globalForMinio = globalThis as unknown as { __minioClient?: S3Client };

function createMinioClient(): S3Client {
  requireFeature("storage");

  return new S3Client({
    endpoint: process.env.MINIO_ENDPOINT ?? "http://localhost:9000",
    // MinIO ignores region - a dummy value satisfies the SDK requirement
    region: "us-east-1",
    credentials: {
      accessKeyId: process.env.MINIO_ACCESS_KEY ?? "minioadmin",
      secretAccessKey: process.env.MINIO_SECRET_KEY ?? "minioadmin",
    },
    // Path-style is mandatory for MinIO (bucket.host won't resolve)
    forcePathStyle: true,
  });
}

/**
 * Returns a singleton MinIO-connected S3Client.
 * Cached on `globalThis` so it survives Next.js HMR in development.
 */
export function getClient(): S3Client {
  if (!globalForMinio.__minioClient) {
    globalForMinio.__minioClient = createMinioClient();
  }
  return globalForMinio.__minioClient;
}

/** The default bucket name, read from env or falling back to `"uploads"`. */
function getBucket(): string {
  return process.env.MINIO_BUCKET ?? "uploads";
}

// ---------------------------------------------------------------------------
// Bucket helpers
// ---------------------------------------------------------------------------

/**
 * Check whether a bucket exists.
 */
export async function bucketExists(bucket?: string): Promise<boolean> {
  try {
    await getClient().send(new HeadBucketCommand({ Bucket: bucket ?? getBucket() }));
    return true;
  } catch {
    return false;
  }
}

/**
 * Create the bucket if it doesn't already exist.
 * Call this once at app startup or in a seed script.
 */
export async function ensureBucket(bucket?: string): Promise<void> {
  const name = bucket ?? getBucket();
  if (await bucketExists(name)) return;
  await getClient().send(new CreateBucketCommand({ Bucket: name }));
}

// ---------------------------------------------------------------------------
// File operations
// ---------------------------------------------------------------------------

/**
 * Upload a file to MinIO.
 *
 * @example
 * ```ts
 * await uploadFile("avatars/user-1.png", buffer, "image/png");
 * ```
 */
export async function uploadFile(
  key: string,
  body: PutObjectCommandInput["Body"],
  contentType?: string,
  bucket?: string
): Promise<void> {
  await getClient().send(
    new PutObjectCommand({
      Bucket: bucket ?? getBucket(),
      Key: key,
      Body: body,
      ContentType: contentType,
    })
  );
}

/**
 * Get a readable stream for a stored file.
 */
export async function getFile(key: string, bucket?: string) {
  const result = await getClient().send(
    new GetObjectCommand({
      Bucket: bucket ?? getBucket(),
      Key: key,
    })
  );
  return result.Body;
}

/**
 * Return metadata (size, content-type, etag, etc.) without downloading.
 */
export async function getFileInfo(key: string, bucket?: string) {
  const result = await getClient().send(
    new HeadObjectCommand({
      Bucket: bucket ?? getBucket(),
      Key: key,
    })
  );
  return {
    contentType: result.ContentType,
    contentLength: result.ContentLength,
    etag: result.ETag,
    lastModified: result.LastModified,
  };
}

/**
 * Check whether an object exists without downloading it.
 */
export async function fileExists(key: string, bucket?: string): Promise<boolean> {
  try {
    await getClient().send(
      new HeadObjectCommand({ Bucket: bucket ?? getBucket(), Key: key })
    );
    return true;
  } catch {
    return false;
  }
}

/**
 * Delete a file from MinIO.
 */
export async function deleteFile(key: string, bucket?: string): Promise<void> {
  await getClient().send(
    new DeleteObjectCommand({
      Bucket: bucket ?? getBucket(),
      Key: key,
    })
  );
}

/**
 * List all objects under a given prefix (folder).
 *
 * @param prefix - Optional key prefix to filter results (e.g. `"uploads/images/"`)
 * @param maxKeys - Maximum number of keys to return (default: 1000)
 */
export async function listFiles(
  prefix?: string,
  maxKeys?: number,
  bucket?: string
) {
  const result = await getClient().send(
    new ListObjectsV2Command({
      Bucket: bucket ?? getBucket(),
      Prefix: prefix,
      MaxKeys: maxKeys,
    })
  );
  return result.Contents ?? [];
}

// ---------------------------------------------------------------------------
// Pre-signed URLs
// ---------------------------------------------------------------------------

/**
 * Generate a pre-signed URL for direct browser uploads or downloads.
 *
 * @param key       - Object key
 * @param method    - `"GET"` for download, `"PUT"` for upload
 * @param expiresIn - URL validity in seconds (default: 3600 = 1 hour)
 */
export async function getPresignedUrl(
  key: string,
  method: "GET" | "PUT" = "GET",
  expiresIn = 3600,
  bucket?: string
): Promise<string> {
  const b = bucket ?? getBucket();
  const command =
    method === "PUT"
      ? new PutObjectCommand({ Bucket: b, Key: key })
      : new GetObjectCommand({ Bucket: b, Key: key });

  return getSignedUrl(getClient(), command, { expiresIn });
}

// ---------------------------------------------------------------------------
// Health check
// ---------------------------------------------------------------------------

/**
 * Test the MinIO connection. Returns `true` if the default bucket is reachable.
 */
export async function testConnection(): Promise<boolean> {
  try {
    await getClient().send(
      new ListObjectsV2Command({
        Bucket: getBucket(),
        MaxKeys: 1,
      })
    );
    return true;
  } catch {
    return false;
  }
}
