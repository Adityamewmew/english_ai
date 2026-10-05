import { usersRepository } from "../users.repository";
import { UnauthorizedError } from "../../../core/errors/app-error";

export async function authenticateUserUsecase(body: { email: string; password: string }) {
  const user = await usersRepository.findByEmail(body.email);
  if (!user) throw new UnauthorizedError("Email atau password salah");

  const isMatch = await Bun.password.verify(body.password, user.password);
  if (!isMatch) throw new UnauthorizedError("Email atau password salah");

  const { password, ...safeUser } = user;
  return safeUser;
}
