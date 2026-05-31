import { Injectable } from "@nestjs/common";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { randomUUID } from "crypto";
import { existsSync } from "fs";

@Injectable()
export class LocalStorageService {
  private readonly uploadDir = join(process.cwd(), "uploads");

  async save(buffer: Buffer, mimetype: string): Promise<string> {
    if (!existsSync(this.uploadDir)) {
      await mkdir(this.uploadDir, { recursive: true });
    }

    const ext = mimetype.split("/")[1];
    const filename = `${randomUUID()}.${ext}`;
    await writeFile(join(this.uploadDir, filename), buffer);

    return `/uploads/${filename}`;
  }
}