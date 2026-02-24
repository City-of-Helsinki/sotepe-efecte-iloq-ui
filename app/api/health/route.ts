import { NextResponse } from 'next/server'

// GET /api/health - Liveness check
// Returns 200 if the Next.js process is running and responding to HTTP requests.
// No authentication required - this endpoint is intended for external monitoring.
export async function GET() {
  return NextResponse.json({ status: 'ok' })
}
