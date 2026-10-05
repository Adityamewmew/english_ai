import { usersRepository } from "../users.repository";
import { NotFoundError } from "../../../core/errors/app-error";

export async function updateUserProfileUsecase(
  id: string,
  body: {
    name?: string;
    email?: string;
    password?: string;
    role?: string;
    accessType?: number;
    currentCefr?: string;
    avatarUrl?: string;
  },
  updaterId?: string
) {
  const existing = await usersRepository.findById(id);
  if (!existing) throw new NotFoundError("Pengguna tidak ditemukan");

  const updateData: any = {
    ...body,
    updatedBy: updaterId,
  };

  if (body.password) {
    updateData.password = await Bun.password.hash(body.password);
  }

  const updated = await usersRepository.update(id, updateData);
  if (!updated) throw new NotFoundError("Gagal memperbarui pengguna");

  const { password, ...safeUser } = updated;
  return safeUser;
}
