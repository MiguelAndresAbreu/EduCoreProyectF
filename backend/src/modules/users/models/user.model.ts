import { Field, ID, ObjectType, registerEnumType } from '@nestjs/graphql';
import { User, UserRole } from '../entities/user.entity';
import { PersonModel } from '../../person/models/person.model';
import { StudentModel } from '../../students/models/student.model';
import { TeacherModel } from '../../teachers/models/teacher.model';

registerEnumType(UserRole, { name: 'UserRole' });

@ObjectType()
export class UserModel {
  @Field(() => ID)
  id: number;

  @Field()
  username: string;

  @Field()
  email: string;

  @Field(() => UserRole)
  role: UserRole;

  @Field()
  isActive: boolean;

  @Field(() => PersonModel, { nullable: true })
  person?: PersonModel | null;

  @Field(() => StudentModel, { nullable: true })
  student?: StudentModel | null;

  @Field(() => TeacherModel, { nullable: true })
  teacher?: TeacherModel | null;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;

  static fromEntity(entity: User | null | undefined): UserModel | null {
    if (!entity) {
      return null;
    }
    const model = new UserModel();
    model.id = entity.id;
    model.username = entity.username;
    model.email = entity.email;
    model.role = entity.role;
    model.isActive = !!entity.isActive;
    model.person = PersonModel.fromEntity(entity.person);
    model.student = entity.student ? StudentModel.fromEntity(entity.student) : null;
    model.teacher = entity.teacher ? TeacherModel.fromEntity(entity.teacher) : null;
    model.createdAt = entity.createdAt;
    model.updatedAt = entity.updatedAt;
    return model;
  }
}
