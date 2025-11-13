import { Body, Controller, Get, Param, ParseIntPipe, Post, Put, UseGuards } from '@nestjs/common';
import { TeachersService } from './teachers.service';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('teachers')
export class TeachersController {
  constructor(private readonly teachersService: TeachersService) {}

  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @Post()
  create(@Body() createTeacherDto: CreateTeacherDto) {
    return this.teachersService.create(createTeacherDto);
  }

  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @Get()
  findAll() {
    return this.teachersService.findAll();
  }

  @Roles(UserRole.ADMIN, UserRole.STAFF, UserRole.TEACHER)
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.teachersService.findOne(id);
  }

  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTeacherDto: UpdateTeacherDto,
  ) {
    return this.teachersService.update(id, updateTeacherDto);
  }
}
