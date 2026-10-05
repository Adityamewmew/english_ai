import { usersRepository } from "../users.repository";
import { NotFoundError } from "../../../core/errors/app-error";

export async function getUserProfileUsecase(id: string) {
  const user = await usersRepository.findById(id);
  if (!user) throw new NotFoundError("Pengguna tidak ditemukan");

  const { password, ...safeUser } = user;
  return safeUser;
}
