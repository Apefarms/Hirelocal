import { NextResponse } from "next/server";
import crypto from "crypto";
import pool from "@/lib/db";

export async function POST(req: Request) {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      candidateId,
      amount,
    } = await req.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { success: false, error: "Missing required payment verification details." },
        { status: 400 }
      );
    }

    const key_secret = process.env.RAZORPAY_KEY_SECRET;
    if (!key_secret) {
      return NextResponse.json(
        { success: false, error: "Razorpay secret key not configured." },
        { status: 500 }
      );
    }

    // Cryptographic signature verification: HMAC-SHA256 of "order_id|payment_id" with key_secret
    const text = `${razorpay_order_id}|${razorpay_payment_id}`;
    const generated_signature = crypto
      .createHmac("sha256", key_secret)
      .update(text)
      .digest("hex");

    if (generated_signature !== razorpay_signature) {
      console.error("Payment signature mismatch:", {
        generated_signature,
        razorpay_signature,
      });
      return NextResponse.json(
        { success: false, error: "Payment verification failed. Invalid signature." },
        { status: 400 }
      );
    }

    // Record verified transaction in MySQL
    const paymentRecordId = `pay-${Date.now()}`;
    const paidAmount = amount ? Number(amount) / 100 : 10.00;

    await pool.query(
      `INSERT INTO payments (id, candidate_id, order_id, payment_id, amount, currency, status, item_type)
       VALUES (?, ?, ?, ?, ?, 'INR', 'success', 'ats_resume_download')`,
      [
        paymentRecordId,
        candidateId || null,
        razorpay_order_id,
        razorpay_payment_id,
        paidAmount,
      ]
    );

    return NextResponse.json({
      success: true,
      message: "Payment verified and recorded successfully.",
      paymentId: razorpay_payment_id,
    });
  } catch (error: any) {
    console.error("Error verifying Razorpay payment:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Payment verification error" },
      { status: 500 }
    );
  }
}
