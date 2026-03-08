import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ModulesService } from './modules.service';
import { CreateModuleDto } from './dto/create-module.dto';
import { UpdateModuleDto } from './dto/update-module.dto';
import { AtGuard } from '../auth/guards/at.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles, Role } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Course Modules')
@Controller('modules')
export class ModulesController {
  constructor(private readonly modulesService: ModulesService) {}

  @Post()
  @Roles(Role.INSTRUCTOR, Role.ADMIN)
  @UseGuards(AtGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new module for a course' })
  create(
    @Body() createModuleDto: CreateModuleDto,
    @CurrentUser('userId') userId: string,
    @CurrentUser('role') role: string,
  ) {
    return this.modulesService.create(createModuleDto, userId, role);
  }

  @Public()
  @Get('course/:courseId')
  @ApiOperation({ summary: 'Get all modules for a course' })
  findAllByCourse(@Param('courseId', ParseUUIDPipe) courseId: string) {
    return this.modulesService.findAllByCourse(courseId);
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get module by ID' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.modulesService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.INSTRUCTOR, Role.ADMIN)
  @UseGuards(AtGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update module' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateModuleDto: UpdateModuleDto,
    @CurrentUser('userId') userId: string,
    @CurrentUser('role') role: string,
  ) {
    return this.modulesService.update(id, updateModuleDto, userId, role);
  }

  @Delete(':id')
  @Roles(Role.INSTRUCTOR, Role.ADMIN)
  @UseGuards(AtGuard, RolesGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete module' })
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('userId') userId: string,
    @CurrentUser('role') role: string,
  ) {
    return this.modulesService.remove(id, userId, role);
  }
}
