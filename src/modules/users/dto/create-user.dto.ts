import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
    IsEmail,
    IsNotEmpty,
    IsString,
    Matches,
    MaxLength,
    MinLength,
} from 'class-validator';

export class CreateUserDto {
    @ApiProperty({ example: 'João Silva', minLength: 2, maxLength: 100 })
    @Transform(({ value }: { value: string }) => value?.trim())
    @IsString()
    @IsNotEmpty()
    @MinLength(2)
    @MaxLength(100)
    name: string;

    @ApiProperty({ example: 'joao@exemplo.com', maxLength: 254 })
    @Transform(({ value }: { value: string }) => value?.trim().toLowerCase())
    @IsEmail()
    @IsNotEmpty()
    @MaxLength(254)
    email: string;

    @ApiProperty({
        example: 'Senha@123',
        minLength: 8,
        maxLength: 128,
        description:
            'Mínimo 8 caracteres com pelo menos uma maiúscula, uma minúscula, um número e um caractere especial',
    })
    @IsString()
    @IsNotEmpty()
    @MinLength(8)
    @MaxLength(128)
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/, {
        message:
            'A senha deve conter pelo menos uma letra maiúscula, uma minúscula, um número e um caractere especial',
    })
    password: string;
}
