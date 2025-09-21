"use server";

import { connectToDB } from "@/lib/db";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import userModel from "../models/user.model";
import jsonwebtoken from "jsonwebtoken";

export const logoutAction = async () => {
  const cookieStore = await cookies();
  cookieStore.delete("token");
  redirect("/login");
};

export const loginAction = async (accessToken: string) => {
  const userInfo = await fetch(
    `https://www.googleapis.com/oauth2/v2/userinfo?access_token=${accessToken}`
  );

  const user = await userInfo.json();

  await connectToDB();

  let dbUser;

  const userExists = await userModel.findOne({ email: user?.email });

  console.log(userExists, "userExists");

  if (!userExists) {
    dbUser = await userModel.create({
      googleId: user?.id,
      email: user?.email,
      name: user?.name,
      profileImg: user?.picture,
    });
  } else {
    dbUser = userExists;
  }

  const jwt = jsonwebtoken.sign(
    {
      id: dbUser._id,
    },
    process.env.JWT_SECRET!
  );

  const cookieStore = await cookies();

  cookieStore.set("token", jwt, { httpOnly: true, path: "/" });

  redirect("/dashboard");
};
