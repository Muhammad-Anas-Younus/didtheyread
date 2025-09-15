import { NextRequest } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { trackingId: string } }
) {
  const urlParams = await params;

  const trackingId = urlParams.trackingId;

  console.log(`Email with Tracking ID: ${trackingId} was opened`);

  // Return a 1x1 transparent pixel
  const img = Buffer.from(
    "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
    "base64"
  );

  return new Response(img, {
    status: 200,
    headers: {
      "Content-Type": "image/gif",
      "Content-Length": img.length.toString(),
      "Cache-Control": "no-cache, no-store, must-revalidate",
    },
  });
}
