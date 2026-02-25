import { NextRequest, NextResponse } from "next/server";
import { features } from "@/lib/features";

/**
 * POST /api/contact
 *
 * Handles contact form submissions.
 * If SMTP is enabled, sends an email notification.
 * Otherwise, logs the submission (replace with your preferred handling).
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, message } = body;

    // Basic validation
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "All fields are required." },
        { status: 400 }
      );
    }

    // If SMTP is enabled, send an email
    if (features.smtp) {
      const { sendMail } = await import("@/lib/mail");
      await sendMail({
        to: process.env.SMTP_FROM_EMAIL ?? "contact@example.com",
        subject: `New contact form submission from ${name}`,
        replyTo: email,
        html: `
          <h2>New Contact Form Submission</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Message:</strong></p>
          <p>${message}</p>
        `,
      });
    }

    // If database is enabled, you could also store the submission
    if (features.database) {
      // Uncomment and customise when your schema is ready:
      // const { query } = await import("@/lib/db");
      // await query(
      //   "INSERT INTO contact_submissions (name, email, message) VALUES ($1, $2, $3)",
      //   [name, email, message]
      // );
    }

    // Log the submission as a fallback
    console.log("[Contact]", { name, email, message });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Contact] Error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
