import { Global, Module } from '@nestjs/common';
import { IsImageExistsConstraint } from './validators/is-image-exists.validator';
import { PrismaModule } from '../prisma/prisma.module';

/**
 * Moduł zawierający wspólne komponenty (walidatory, pipe'y, itp.)
 * @Global - dostępny w całej aplikacji bez konieczności importowania
 */
@Global()
@Module({
  imports: [PrismaModule],
  providers: [IsImageExistsConstraint],
  exports: [IsImageExistsConstraint],
})
export class CommonModule {}
