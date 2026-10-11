import { userRepository } from "../../repository/user_repository";
import { ConflictError } from "../../../common/errors/app-error";
import crypto from "crypto";

export async function registerUserUsecase(body: {
  name: string;
  email: string;
  password: string;
  role?: string;
  currentCefr?: string;
}) {
  const existing = await userRepository.findByEmail(body.email);
  if (existing) throw new ConflictError("Email sudah terdaftar");

  const hashedPassword = await Bun.password.hash(body.password);

  const newUser = await userRepository.create({
    id: crypto.randomUUID(),
    name: body.name,
    email: body.email,
    password: hashedPassword,
    role: body.role || "student",
    currentCefr: body.currentCefr || "A1",
    accessType: body.role === "admin" ? 1 : 2,
    memory: {
      facts: [],
      interests: [],
      weaknesses: [],
      totalCalls: 0,
    },
  });

  const { password, ...safeUser } = newUser;
  return safeUser;
}
