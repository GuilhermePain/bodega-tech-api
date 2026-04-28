import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class UpdateUserDto {
    @ApiPropertyOptional({ example: 'João Silva', minLength: 2, maxLength: 100 })
    @Transform(({ value }: { value: string }) => value?.trim())
    @IsString()
    @IsOptional()
    @MinLength(2)
    @MaxLength(100)
    name?: string;

    @ApiPropertyOptional({ example: 'joao@exemplo.com', maxLength: 254 })
    @Transform(({ value }: { value: string }) => value?.trim().toLowerCase())
    @IsEmail()
    @IsOptional()
    @MaxLength(254)
    email?: string;
}
