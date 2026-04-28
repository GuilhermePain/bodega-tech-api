import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    Param,
    Patch,
    Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateUserDto } from './dto/create-user.dto';
import { ReturnUserDto } from './dto/return-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Post()
    @ApiResponse({ status: 201, type: ReturnUserDto })
    @ApiResponse({ status: 409, description: 'E-mail já cadastrado.' })
    createUser(@Body() createUserDto: CreateUserDto): Promise<ReturnUserDto> {
        return this.usersService.createUser(createUserDto);
    }

    @Get(':id')
    @ApiResponse({ status: 200, type: ReturnUserDto })
    @ApiResponse({ status: 404, description: 'Usuário não encontrado.' })
    findUserById(@Param('id') id: string): Promise<ReturnUserDto> {
        return this.usersService.findUserById(id);
    }

    @Patch(':id')
    @ApiResponse({ status: 200, type: ReturnUserDto })
    @ApiResponse({ status: 404, description: 'Usuário não encontrado.' })
    updateUser(
        @Param('id') id: string,
        @Body() updateUserDto: UpdateUserDto,
    ): Promise<ReturnUserDto> {
        return this.usersService.updateUser(id, updateUserDto);
    }

    @Patch('active/:id')
    @HttpCode(204)
    @ApiResponse({ status: 204, description: 'Usuário ativado com sucesso.' })
    @ApiResponse({ status: 404, description: 'Usuário não encontrado.' })
    activeUser(@Param('id') id: string): Promise<void> {
        return this.usersService.activeUser(id);
    }

    @Delete('desactive/:id')
    @HttpCode(204)
    @ApiResponse({ status: 204, description: 'Usuário desativado com sucesso.' })
    @ApiResponse({ status: 404, description: 'Usuário não encontrado.' })
    desactiveUser(@Param('id') id: string): Promise<void> {
        return this.usersService.desactiveUser(id);
    }
}
