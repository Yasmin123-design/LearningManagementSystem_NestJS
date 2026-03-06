import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Public } from '../../common/decorators/public.decorator';
import { Roles, Role } from '../../common/decorators/roles.decorator';
import { AtGuard } from '../auth/guards/at.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

@ApiTags('Categories')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @Roles(Role.ADMIN)
  @UseGuards(AtGuard, RolesGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new category (Admin only)' })
  create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoriesService.create(createCategoryDto);
  }

  @Public()
  @Get()
  @ApiOperation({ summary: 'Get all categories' })
  findAll() {
    return this.categoriesService.findAll();
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get category by ID' })
  findOne(@Param('id') id: string) {
    return this.categoriesService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  @UseGuards(AtGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update category (Admin only)' })
  update(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    return this.categoriesService.update(id, updateCategoryDto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @UseGuards(AtGuard, RolesGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete category (Admin only)' })
  remove(@Param('id') id: string) {
    return this.categoriesService.remove(id);
  }
}
