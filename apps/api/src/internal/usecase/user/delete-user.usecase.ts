import { userRepository } from "../../repository/user_repository";
import { NotFoundError } from "../../../common/errors/app-error";

export async function deleteUserUsecase(id: string, deleterId: string) {
  const existing = await userRepository.findById(id);
  if (!existing) {
    throw new NotFoundError("Pengguna tidak ditemukan");
  }

  return userRepository.softDelete(id, deleterId);
}
