import { jwtVerify } from "jose";

export async function verifyJwtToken(token: string) {
  try {
    const verified = await jwtVerify(
      token,
      new TextEncoder().encode(process.env.JWT_SECRET!)
    );
    return verified.payload;
  } catch (error) {
    throw new Error("Your token is expired");
  }
}
