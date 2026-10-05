import { usersRepository } from "../users.repository";
import { NotFoundError } from "../../../core/errors/app-error";

export async function deleteUserUsecase(id: string, deleterId: string) {
  const existing = await usersRepository.findById(id);
  if (!existing) {
    throw new NotFoundError("Pengguna tidak ditemukan");
  }

  return usersRepository.softDelete(id, deleterId);
}
