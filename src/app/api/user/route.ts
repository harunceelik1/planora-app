import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { Prisma } from '@prisma/client';

export async function GET() {
  try {
    const users = await db.user.findMany({
      //burada passwordu api çıktısında göstermiyoruz
      select: {
      id: true,
      email: true,
      name: true,
      image: true,
      emailVerified: true,
      },
    });
    return NextResponse.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name,email, password } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name,Email and password are required" },
        { status: 400 }
      );
    }
    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email already in use" },
        { status: 409 }
      );
    }
    // Şifreyi hashle
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await db.user.create({
      data: {
        email,
        password: hashedPassword ,
        name: name,
        image: "",
        emailVerified: null,

      }as Prisma.UserUncheckedCreateInput
    });

    return NextResponse.json({
      user: { id: newUser.id, email: newUser.email, name: newUser.name },
    });
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}

