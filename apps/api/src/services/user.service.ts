import { db } from "@/db";
import { users } from "@/db/schema";
import { eq, isNull, and, like, or, desc, count } from "drizzle-orm";
import { Response, ServiceResult } from "@/lib/response";
import { Messages } from "@/lib/constants/messages";
import { LoginInput, RegisterInput } from "@/lib/validations/auth";
import { CreateUserInput, UpdateUserInput } from "@/lib/validations/user";
import crypto from "crypto";

export class UserService {
  async getAll(filters: {
    keywords?: string;
    role?: string;
    page?: number;
    perPage?: number;
  }): Promise<ServiceResult<{ list: any[]; total: number; page: number; perPage: number }>> {
    try {
      const page = Math.max(filters.page ?? 1, 1);
      const perPage = Math.min(filters.perPage ?? 10, 100);
      const offset = (page - 1) * perPage;

      const conditions = [isNull(users.deletedAt)];

      if (filters.keywords && filters.keywords.trim() !== "") {
        const kw = `%${filters.keywords.trim()}%`;
        conditions.push(or(like(users.name, kw), like(users.email, kw))!);
      }

      if (filters.role && filters.role !== "all") {
        conditions.push(eq(users.role, filters.role));
      }

      const whereClause = and(...conditions);

      const data = await db
        .select({
          id: users.id,
          name: users.name,
          email: users.email,
          role: users.role,
          accessType: users.accessType,
          currentCefr: users.currentCefr,
          createdAt: users.createdAt,
          updatedAt: users.updatedAt,
        })
        .from(users)
        .where(whereClause)
        .orderBy(desc(users.createdAt))
        .limit(perPage)
        .offset(offset);

      const [{ total }] = await db
        .select({ total: count() })
        .from(users)
        .where(whereClause);

      return Response.buildSuccess({
        list: data,
        total: Number(total),
        page,
        perPage,
      });
    } catch (e) {
      console.error(e);
      return Response.buildErrorService((e as Error).message);
    }
  }

  async getById(id: string): Promise<ServiceResult<any>> {
    try {
      const [user] = await db
        .select()
        .from(users)
        .where(and(eq(users.id, id), isNull(users.deletedAt)))
        .limit(1);

      if (!user) return Response.buildErrorNotFound("Pengguna tidak ditemukan");

      const { password, ...safeUser } = user;
      return Response.buildSuccess(safeUser);
    } catch (e) {
      console.error(e);
      return Response.buildErrorService((e as Error).message);
    }
  }

  async getByEmail(email: string): Promise<ServiceResult<any>> {
    try {
      const [user] = await db
        .select()
        .from(users)
        .where(and(eq(users.email, email), isNull(users.deletedAt)))
        .limit(1);

      if (!user) return Response.buildErrorNotFound("Pengguna tidak ditemukan");
      return Response.buildSuccess(user);
    } catch (e) {
      console.error(e);
      return Response.buildErrorService((e as Error).message);
    }
  }

  async authenticate(payload: LoginInput): Promise<ServiceResult<any>> {
    try {
      const result = await this.getByEmail(payload.email);
      if (!result.success || !result.data) {
        return Response.buildError(401, "Email atau password salah");
      }

      const user = result.data;
      if (user.password !== payload.password) {
        return Response.buildError(401, "Email atau password salah");
      }

      const { password, ...safeUser } = user;
      return Response.buildSuccess(safeUser);
    } catch (e) {
      console.error(e);
      return Response.buildErrorService((e as Error).message);
    }
  }

  async login(payload: LoginInput): Promise<ServiceResult<any>> {
    return await this.authenticate(payload);
  }

  async register(payload: RegisterInput): Promise<ServiceResult<any>> {
    return await this.create(payload);
  }

  async create(payload: CreateUserInput | RegisterInput, adminId?: string): Promise<ServiceResult<any>> {
    try {
      const [existing] = await db
        .select()
        .from(users)
        .where(and(eq(users.email, payload.email), isNull(users.deletedAt)))
        .limit(1);

      if (existing) {
        return Response.buildError(400, "Email sudah terdaftar");
      }

      const newId = crypto.randomUUID();
      const role = "role" in payload && payload.role ? payload.role : ("accessType" in payload && (payload as any).accessType === 1 ? "admin" : "student");
      const accessType = "accessType" in payload && (payload as any).accessType ? Number((payload as any).accessType) : (role === "admin" ? 1 : 2);
      const currentCefr = "currentCefr" in payload && payload.currentCefr ? payload.currentCefr : "A1";

      await db.insert(users).values({
        id: newId,
        name: payload.name,
        email: payload.email,
        password: payload.password,
        role,
        accessType,
        currentCefr,
        createdBy: adminId || null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      return Response.buildSuccessCreated({ id: newId, name: payload.name, email: payload.email, role, accessType });
    } catch (e) {
      console.error(e);
      return Response.buildErrorService((e as Error).message);
    }
  }

  async update(id: string, payload: UpdateUserInput, adminId?: string): Promise<ServiceResult<any>> {
    try {
      const [existing] = await db
        .select()
        .from(users)
        .where(and(eq(users.id, id), isNull(users.deletedAt)))
        .limit(1);

      if (!existing) {
        return Response.buildErrorNotFound("Pengguna tidak ditemukan");
      }

      // Check email uniqueness if email changed
      if (payload.email !== existing.email) {
        const [emailConflict] = await db
          .select()
          .from(users)
          .where(and(eq(users.email, payload.email), isNull(users.deletedAt)))
          .limit(1);

        if (emailConflict) {
          return Response.buildError(400, "Email sudah digunakan oleh pengguna lain");
        }
      }

      const role = payload.role ?? ("accessType" in payload && (payload as any).accessType === 1 ? "admin" : "student");
      const accessType = "accessType" in payload && (payload as any).accessType ? Number((payload as any).accessType) : (role === "admin" ? 1 : 2);

      const updateData: Record<string, any> = {
        name: payload.name,
        email: payload.email,
        role,
        accessType,
        currentCefr: payload.currentCefr,
        updatedBy: adminId || null,
        updatedAt: new Date(),
      };

      if (payload.password && payload.password.trim().length >= 6) {
        updateData.password = payload.password.trim();
      }

      await db.update(users).set(updateData).where(eq(users.id, id));

      return Response.buildSuccess(null, Messages.SUCCESS_UPDATED);
    } catch (e) {
      console.error(e);
      return Response.buildErrorService((e as Error).message);
    }
  }

  async delete(id: string, adminId?: string): Promise<ServiceResult<any>> {
    try {
      const [existing] = await db
        .select()
        .from(users)
        .where(and(eq(users.id, id), isNull(users.deletedAt)))
        .limit(1);

      if (!existing) {
        return Response.buildErrorNotFound("Pengguna tidak ditemukan");
      }

      // Soft delete
      await db
        .update(users)
        .set({
          deletedAt: new Date(),
          deletedBy: adminId || null,
        })
        .where(eq(users.id, id));

      return Response.buildSuccess(null, Messages.SUCCESS_DELETED);
    } catch (e) {
      console.error(e);
      return Response.buildErrorService((e as Error).message);
    }
  }

  async updateCefr(id: string, cefr: string): Promise<ServiceResult<any>> {
    try {
      await db
        .update(users)
        .set({ currentCefr: cefr, updatedAt: new Date() })
        .where(eq(users.id, id));

      return Response.buildSuccess(null);
    } catch (e) {
      console.error(e);
      return Response.buildErrorService((e as Error).message);
    }
  }
}

export const userService = new UserService();
