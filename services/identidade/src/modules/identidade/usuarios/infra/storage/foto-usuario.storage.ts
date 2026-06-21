import { BadRequestException } from "@nestjs/common";
import { diskStorage } from "multer";
import { extname } from "path";
import { randomUUID } from "crypto";
import type { Request } from "express";

/**
 * Diretório físico onde as fotos de usuário ficam salvas.
 * É o mesmo caminho exposto como estático em /uploads (ver bootstrap-http-app).
 */
export const FOTO_USUARIO_DEST = "uploads/usuarios";

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

/**
 * Configuração do Multer (via FileInterceptor) para upload de foto de perfil.
 * Salva direto em disco com nome único, validando tipo e tamanho do arquivo.
 */
export const fotoUsuarioMulterOptions = {
  storage: diskStorage({
    destination: FOTO_USUARIO_DEST,
    filename: (_req: Request, file: Express.Multer.File, callback) => {
      const uniqueName = `${randomUUID()}${extname(file.originalname).toLowerCase()}`;
      callback(null, uniqueName);
    },
  }),
  limits: {
    fileSize: MAX_FILE_SIZE_BYTES,
  },
  fileFilter: (_req: Request, file: Express.Multer.File, callback: (error: Error | null, acceptFile: boolean) => void) => {
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      callback(new BadRequestException("Formato de imagem inválido. Use JPG, PNG ou WEBP."), false);
      return;
    }
    callback(null, true);
  },
};

/** Monta a URL pública completa a partir do nome do arquivo salvo. */
export function buildFotoUsuarioUrl(filename: string): string {
  const baseUrl = process.env.PUBLIC_URL ?? `http://localhost:${process.env.PORT ?? 4002}`;
  return `${baseUrl}/uploads/usuarios/${filename}`;
}