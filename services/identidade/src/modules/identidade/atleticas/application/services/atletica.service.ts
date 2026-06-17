import { CreateAtleticaDto } from "@identidade/atleticas/application/dto/create-atletica.dto";
import { UpdateAtleticaDto } from "@identidade/atleticas/application/dto/update-atletica.dto";
import { AtleticaDto } from "@identidade/atleticas/application/dto/atletica.dto";
import { Injectable, NotFoundException } from "@nestjs/common";
import { DrizzleService } from "@shared/infra/database/drizzle.service";
import { atleticasTable } from "@identidade/atleticas/infra/database/schemas/atletica.schema";
import { eq } from "drizzle-orm";

@Injectable()
export class AtleticaService {
  constructor(private readonly drizzle: DrizzleService) {}

  async create(dto: CreateAtleticaDto): Promise<AtleticaDto> {
    const [row] = await this.drizzle.db
      .insert(atleticasTable)
      .values({
        nome: dto.nome,
        nomePresidente: dto.nomePresidente,
        corPrimaria: dto.corPrimaria ?? null,
        corFundo: dto.corFundo ?? null,
      })
      .returning();

    return this.toDto(row);
  }

  async findById(id: string): Promise<AtleticaDto> {
    const [row] = await this.drizzle.db
      .select()
      .from(atleticasTable)
      .where(eq(atleticasTable.id, id));

    if (!row) throw new NotFoundException("Atlética não encontrada");
    return this.toDto(row);
  }

  async update(id: string, dto: UpdateAtleticaDto): Promise<void> {
    const [existing] = await this.drizzle.db
      .select()
      .from(atleticasTable)
      .where(eq(atleticasTable.id, id));

    if (!existing) throw new NotFoundException("Atlética não encontrada");

    await this.drizzle.db
      .update(atleticasTable)
      .set({
        ...(dto.nome && { nome: dto.nome }),
        ...(dto.nomePresidente && { nomePresidente: dto.nomePresidente }),
        ...(dto.corPrimaria !== undefined && { corPrimaria: dto.corPrimaria }),
        ...(dto.corFundo !== undefined && { corFundo: dto.corFundo }),
        atualizadoEm: new Date(),
      })
      .where(eq(atleticasTable.id, id));
  }

  private toDto(row: typeof atleticasTable.$inferSelect): AtleticaDto {
    return {
      id: row.id,
      nome: row.nome,
      nomePresidente: row.nomePresidente,
      corPrimaria: row.corPrimaria ?? null,
      corFundo: row.corFundo ?? null,
      criadoEm: row.criadoEm.toISOString(),
    };
  }

  async findAll(): Promise<AtleticaDto[]> {
    const rows = await this.drizzle.db
      .select()
      .from(atleticasTable);

    return rows.map((row) => this.toDto(row));
  }
}