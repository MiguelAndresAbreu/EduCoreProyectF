import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { SubjectsService } from '../subjects.service';
import { SubjectModel } from '../models/subject.model';
import { CreateSubjectInput } from '../inputs/create-subject.input';
import { UpdateSubjectInput } from '../inputs/update-subject.input';
import { UserRole } from '../../users/entities/user.entity';
import {RolesGuard} from "@/common/guards/roles.guard";
import {JwtAuthGuard} from "@/common/guards/jwt-auth.guard";
import {Roles} from "@/common/decorators/roles.decorator";

@Resolver(() => SubjectModel)
export class SubjectsResolver {
  constructor(private readonly subjectsService: SubjectsService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @Mutation(() => SubjectModel)
  async createSubject(
    @Args('input') input: CreateSubjectInput,
  ): Promise<SubjectModel> {
    const subject = await this.subjectsService.create(input);
    return SubjectModel.fromEntity(subject);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Query(() => [SubjectModel])
  async subjects(): Promise<SubjectModel[]> {
    const subjects = await this.subjectsService.findAll();
    return subjects.map((subject) => SubjectModel.fromEntity(subject));
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Query(() => SubjectModel)
  async subject(
    @Args('id', { type: () => Int }) id: number,
  ): Promise<SubjectModel> {
    const subject = await this.subjectsService.findOne(id);
    return SubjectModel.fromEntity(subject);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @Mutation(() => SubjectModel)
  async updateSubject(
    @Args('id', { type: () => Int }) id: number,
    @Args('input') input: UpdateSubjectInput,
  ): Promise<SubjectModel> {
    const subject = await this.subjectsService.update(id, input);
    return SubjectModel.fromEntity(subject);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @Mutation(() => Boolean)
  async removeSubject(
    @Args('id', { type: () => Int }) id: number,
  ): Promise<boolean> {
    await this.subjectsService.remove(id);
    return true;
  }
}
