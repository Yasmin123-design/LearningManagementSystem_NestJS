import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LessonsService } from './lessons.service';
import { LessonsController } from './lessons.controller';
import { Lesson } from './entities/lesson.entity';
import { ModulesModule } from '../modules/modules.module';
import { CoursesModule } from '../courses/courses.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Lesson]),
    ModulesModule,
    CoursesModule,
  ],
  controllers: [LessonsController],
  providers: [LessonsService],
  exports: [LessonsService],
})
export class LessonsModule {}
