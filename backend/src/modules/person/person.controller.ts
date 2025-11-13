import { Body, Controller, ForbiddenException, Get, Param, ParseIntPipe, Put, UseGuards } from '@nestjs/common';
import { PersonService } from './person.service';
import { UpdatePersonDto } from './dto/update-person.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { UsersService } from '../users/users.service';
import { UserRole } from '../users/entities/user.entity';

@UseGuards(JwtAuthGuard)
@Controller('person')
export class PersonController {
  constructor(
    private readonly personService: PersonService,
    private readonly usersService: UsersService,
  ) {}

  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: JwtPayload,
  ) {
    const currentUser = await this.usersService.findById(user.sub);
    if (currentUser.role !== UserRole.ADMIN && currentUser.person.id !== id) {
      throw new ForbiddenException('No puedes consultar otra persona');
    }
    return this.personService.findOne(id);
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePersonDto: UpdatePersonDto,
    @CurrentUser() user: JwtPayload,
  ) {
    const currentUser = await this.usersService.findById(user.sub);
    if (currentUser.role !== UserRole.ADMIN && currentUser.person.id !== id) {
      throw new ForbiddenException('No puedes modificar otra persona');
    }
    return this.personService.update(id, updatePersonDto);
  }
}
