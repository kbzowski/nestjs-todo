import { IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { Transform, Type } from 'class-transformer';

const ALLOWED_SORT_FIELDS = ['id', 'title'] as const;
type SortField = (typeof ALLOWED_SORT_FIELDS)[number];

const SORT_ORDER = ['asc', 'desc'] as const;
type SortOrder = (typeof SORT_ORDER)[number];

export class QueryTodoDto {
  @IsOptional()
  @IsString({ message: 'Search term must be a string' })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : undefined,
  )
  search?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Page must be an integer' })
  @Min(1, { message: 'Page must be at least 1' })
  page: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Limit must be an integer' })
  @Min(1, { message: 'Limit must be at least 1' })
  @Max(100, { message: 'Limit must not exceed 100' })
  limit: number = 10;

  @IsOptional()
  @IsString({ message: 'Sort field must be a string' })
  @IsIn(ALLOWED_SORT_FIELDS, {
    message: 'Sort field must be one of: id, title',
  })
  sortBy: SortField = 'id';

  @IsOptional()
  @IsIn(SORT_ORDER, { message: 'Sort order must be asc or desc' })
  sortOrder: SortOrder = 'asc';

  @IsOptional()
  @Transform(({ value }) => {
    return [true, 'enabled', 'true', 1, '1'].includes(value);
  })
  boolExample: false;
}
