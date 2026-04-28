import { ApiProperty } from '@nestjs/swagger';
import { User } from '@/generated/prisma/client';
import { Status } from '@/generated/prisma/enums';

export class ReturnUserDto {
    @ApiProperty({ example: 'uuid-v4' })
    id: string;

    @ApiProperty({ example: 'João Silva' })
    name: string;

    @ApiProperty({ example: 'joao@exemplo.com' })
    email: string;

    @ApiProperty({ enum: Status, example: Status.ATIVO })
    status: Status;

    @ApiProperty({ example: '2026-01-01T00:00:00.000Z' })
    createdAt: Date;

    constructor(user: User) {
        this.id = user.id;
        this.name = user.name;
        this.email = user.email;
        this.status = user.status;
        this.createdAt = user.createdAt;
    }
}
