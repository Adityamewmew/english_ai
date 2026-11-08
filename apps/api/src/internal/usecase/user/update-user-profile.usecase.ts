import { userRepository } from "../../repository/user_repository";
import { NotFoundError } from "../../../common/errors/app-error";

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
    memory?: any;
  },
  updaterId?: string
) {
  const existing = await userRepository.findById(id);
  if (!existing) throw new NotFoundError("Pengguna tidak ditemukan");

  const updateData: any = {
    ...body,
    updatedBy: updaterId,
  };

  if (body.memory) {
    const existingMemory = (existing.memory as any) || {
      facts: [],
      interests: [],
      weaknesses: [],
      totalCalls: 0,
    };
    updateData.memory = {
      ...existingMemory,
      ...body.memory,
      // If facts or interests are provided in body.memory, ensure they are arrays
      facts: body.memory.facts ?? existingMemory.facts ?? [],
      interests: body.memory.interests ?? existingMemory.interests ?? [],
      weaknesses: body.memory.weaknesses ?? existingMemory.weaknesses ?? [],
    };
  }

  if (body.password) {
    updateData.password = await Bun.password.hash(body.password, {
      algorithm: "bcrypt",
      cost: 10,
    });
  }

  const updated = await userRepository.update(id, updateData);
  if (!updated) throw new NotFoundError("Gagal memperbarui pengguna");

  const { password, ...safeUser } = updated;
  return safeUser;
}
