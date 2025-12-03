import { IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { Transform, Type } from 'class-transformer';

const ALLOWED_SORT_FIELDS = ['id', 'title'] as const;
type SortField = (typeof ALLOWED_SORT_FIELDS)[number];

const SORT_ORDER = ['asc', 'desc'] as const;
type SortOrder = (typeof SORT_ORDER)[number];

export class QueryTodoDto {
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : undefined,
  )
  @IsString({ message: 'Search term must be a string' })
  @IsOptional()
  search?: string;

  @Min(1, { message: 'Page must be at least 1' })
  @Type(() => Number)
  @IsInt({ message: 'Page must be an integer' })
  @IsOptional()
  page: number = 1;

  @Min(1, { message: 'Limit must be at least 1' })
  @Max(100, { message: 'Limit must not exceed 100' })
  @Type(() => Number)
  @IsInt({ message: 'Limit must be an integer' })
  @IsOptional()
  limit: number = 10;

  @IsIn(ALLOWED_SORT_FIELDS, {
    message: 'Sort field must be one of: id, title',
  })
  @IsOptional()
  sortBy: SortField = 'id';

  @IsIn(SORT_ORDER, { message: 'Sort order must be asc or desc' })
  @IsOptional()
  sortOrder: SortOrder = 'asc';

  @Transform(({ value }: { value: string }) => {
    return [true, 'enabled', 'true', 1, '1'].includes(value);
  })
  @IsOptional()
  boolExample: false;
}
