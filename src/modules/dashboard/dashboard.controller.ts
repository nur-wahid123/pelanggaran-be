import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { QueryDateRangeDto } from 'src/commons/dto/query-daterange.dto';
import { JwtAuthGuard } from 'src/commons/guards/jwt-auth.guard';
import { QueryChartDto } from './dto/query-chart.dto';

@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('data')
  getData(@Query() dateRange: QueryDateRangeDto) {
    return this.dashboardService.getData(dateRange);
  }

  @Get('chart-data')
  getChartData(@Query() query: QueryChartDto) {
    return this.dashboardService.getChartData(query);
  }
}
