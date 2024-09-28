import { ArgumentMetadata, PipeTransform } from '@nestjs/common';

export class IsStringPipe implements PipeTransform{
  transform(value: string, metadata: ArgumentMetadata): any {
    value.toString()
    return value
  }

}