import { IsEnum, IsNotEmpty } from 'class-validator';
import { FilterDto } from 'src/commons/dto/filter.dto';
import { ViolationTypeEnum } from 'src/commons/enums/violation-type.enum';

export class QueryViolationDto extends FilterDto {
  @IsNotEmpty()
  @IsEnum(ViolationTypeEnum)
  type: ViolationTypeEnum;
}
