import userModel from "@/app/models/user.model";
import { verifyJwtToken } from "@/lib/auth";
import { connectToDB } from "@/lib/db";
import { cookies } from "next/headers";

export async function GET(request: Request) {
  const cookieStore = await cookies();

  const token = cookieStore.get("token")?.value;

  if (!token) {
    return Response.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const verified = await verifyJwtToken(token);
    await connectToDB();
    const user = await userModel.findById(verified.id);
    if (!user) {
      return Response.json({ message: "User not found" }, { status: 404 });
    }

    return Response.json({ user });
  } catch (error) {
    return Response.json({ message: "Invalid token" }, { status: 401 });
  }
}
