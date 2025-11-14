import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { JwtPayload } from '../../modules/auth/interfaces/jwt-payload.interface';

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): JwtPayload | null => {
    const request =
      ctx.getType() === 'http'
        ? ctx.switchToHttp().getRequest()
        : GqlExecutionContext.create(ctx).getContext().req;
    return request.user ?? null;
  },
);
