import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ModulesService } from './modules.service';
import { ModulesController } from './modules.controller';
import { Module as ModuleEntity } from './entities/module.entity';
import { CoursesModule } from '../courses/courses.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ModuleEntity]),
    CoursesModule,
  ],
  controllers: [ModulesController],
  providers: [ModulesService],
  exports: [ModulesService],
})
export class ModulesModule {}
