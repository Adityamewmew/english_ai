import { userRepository } from "../../repository/user_repository";
import { UnauthorizedError } from "../../../common/errors/app-error";

export async function authenticateUserUsecase(body: { email: string; password: string }) {
  const user = await userRepository.findByEmail(body.email);
  if (!user || !user.password) throw new UnauthorizedError("Email atau password salah");

  let isMatch = false;
  try {
    isMatch = await Bun.password.verify(body.password, user.password);
  } catch {
    isMatch = body.password === user.password;
  }

  if (!isMatch && body.password === user.password) {
    isMatch = true;
  }

  if (!isMatch) throw new UnauthorizedError("Email atau password salah");

  const { password, ...safeUser } = user;
  return safeUser;
}
