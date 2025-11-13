import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Get()
  findAll() {
    return this.coursesService.findAll();
  }

  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.coursesService.findOne(id);
  }

  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @Post()
  create(@Body() createCourseDto: CreateCourseDto) {
    return this.coursesService.create(createCourseDto);
  }

  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCourseDto: UpdateCourseDto,
  ) {
    return this.coursesService.update(id, updateCourseDto);
  }

  @Roles(UserRole.ADMIN)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.coursesService.remove(id);
  }
}
