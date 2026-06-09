import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import type { PaginatedResult, PaginationParams } from "@shared/infra/hateoas";
import { CreateUserDto } from "@users/application/dto/create-user.dto";
import { UpdateUserDto } from "@users/application/dto/update-user.dto";
import { UserPayload } from "@users/application/dto/user-payload.interface";
import { UserResponseDto } from "@users/application/dto/user-response.dto";
import { User } from "@users/domain/models/user.entity";
import {
  USER_REPOSITORY,
  type UserRepository,
} from "@users/domain/repositories/user-repository.interface";
import * as bcrypt from "bcryptjs";

@Injectable()
export class UserService {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
  ) {}

  async create(dto: CreateUserDto): Promise<void> {
    const existing = await this.userRepository.findByEmail(dto.email);
    if (existing) throw new ConflictException("Email already registered");

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = User.restore({
      email: dto.email.toLowerCase(),
      password: hashedPassword,
      permissions: dto.permissions as string[],
    })!;

    await this.userRepository.create(user);
  }

  async edit(id: string, dto: UpdateUserDto): Promise<void> {
    const user = await this.userRepository.findById(id);
    if (!user) throw new NotFoundException("User not found");

    if (dto.email && dto.email !== user.email) {
      const existing = await this.userRepository.findByEmail(dto.email);
      if (existing) throw new ConflictException("Email already registered");
      user.withEmail(dto.email.toLowerCase());
    }

    if (dto.password) {
      const hashedPassword = await bcrypt.hash(dto.password, 10);
      user.withPassword(hashedPassword);
    }

    if (dto.permissions !== undefined)
      user.withPermissions(dto.permissions as string[]);

    await this.userRepository.update(user);
  }

  async remove(id: string): Promise<void> {
    await this.userRepository.delete(id);
  }

  async list(): Promise<UserResponseDto[]> {
    const users = await this.userRepository.findAll();
    return users.map((u) => UserResponseDto.from(u)!);
  }

  async listPaginated(
    params: PaginationParams,
  ): Promise<PaginatedResult<UserResponseDto>> {
    const { rows, total } = await this.userRepository.findAllPaginated(params);
    return {
      data: rows.map((u) => UserResponseDto.from(u)!),
      total,
      page: params.page,
      limit: params.limit,
    };
  }

  async findById(id: string): Promise<UserResponseDto | null> {
    const user = await this.userRepository.findById(id);
    return UserResponseDto.from(user);
  }

  async validateCredentials(
  email: string,
  password: string,
): Promise<UserPayload | null> {
  const user = await this.userRepository.findByEmail(email.toLowerCase());
  console.log('user found:', user?.email);
  console.log('password from db:', user?.password);
  
  if (!user) return null;

  const valid = await bcrypt.compare(password, user.password);
  console.log('bcrypt valid:', valid);
  
  if (!valid) return null;

  return { id: user.id!, email: user.email, permissions: user.permissions };
  }
}