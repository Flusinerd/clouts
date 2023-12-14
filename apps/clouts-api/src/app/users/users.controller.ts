import { Body, Controller, Get, Param, Patch } from '@nestjs/common';
import { PublicUser, UpdateUserRequest } from 'models';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const user = await this.usersService.findOne(id);
    return PublicUser.parse(user);
  }

  @Patch(':id')
  async updateOne(@Param('id') id: string, @Body() data: UpdateUserRequest) {
    const user = await this.usersService.updateUser(id, data);
    return PublicUser.parse(user);
  }
}
