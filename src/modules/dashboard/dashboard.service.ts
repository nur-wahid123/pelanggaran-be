import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { QueryDateRangeDto } from 'src/commons/dto/query-daterange.dto';
import { ViolationEntity } from 'src/entities/violation.entity';
import { DataSource } from 'typeorm';
import { DashboardResponseDto } from './dto/response/dashboard-response.dto';
import { StudentEntity } from 'src/entities/student.entity';
import {
  convertMonthNumberToShortMonthName,
  formatDate,
  formatDateToDateMonthString,
  fromStartOfLastMonthToTodayOnLastMonth,
  fromStartOfThisMonthToToday,
} from 'src/commons/utils/date.util';
import { ViolationTypeEntity } from 'src/entities/violation-type.entity';
import { QueryChartDto } from './dto/query-chart.dto';
import { ChartType } from 'src/commons/enums/chart-type.enum';
import {
  ChartData,
  ChartDataResponseDto,
} from './dto/response/chart-data-response.dto';

@Injectable()
export class DashboardService {
  async getChartData(query: QueryChartDto) {
    const { type } = query;
    const response = new ChartDataResponseDto();
    switch (type) {
      case ChartType.DAYS:
        const daysData = await this.datasource.query<
          {
            date: string;
            data_count: number;
          }[]
        >(`
          SELECT 
            (NOW() - INTERVAL '1 day' * i)::DATE AS "date",
            COUNT(v.id) AS "data_count"
          FROM generate_series(0, 6) i
          LEFT JOIN "violations" v ON 
            DATE(v."created_at") = (NOW() - INTERVAL '1 day' * i)::DATE
            AND v."deleted_at" IS NULL
          GROUP BY (NOW() - INTERVAL '1 day' * i)::DATE
          ORDER BY "date" ASC
        `);

        response.data = daysData.map((v) => {
          const a = new ChartData();
          a.key = formatDateToDateMonthString(new Date(v.date));
          a.value = v.data_count;
          return a;
        });
        break;

      case ChartType.WEEKS:
        const weeksData = await this.datasource.query<
          {
            from: string;
            to: string;
            data_count: number;
          }[]
        >(`
          SELECT 
            (date_trunc('week', NOW()) - INTERVAL '1 week' * i)::DATE AS "from",
            (date_trunc('week', NOW()) - INTERVAL '1 week' * i + INTERVAL '6 days')::DATE AS "to",
            COUNT(v.id) AS "data_count"
          FROM generate_series(0, 6) i
          LEFT JOIN "violations" v ON 
            DATE(v."created_at") BETWEEN 
              (date_trunc('week', NOW()) - INTERVAL '1 week' * i)::DATE
              AND
              (date_trunc('week', NOW()) - INTERVAL '1 week' * i + INTERVAL '6 days')::DATE
            AND v."deleted_at" IS NULL
          GROUP BY "from", "to"
          ORDER BY "from" ASC
        `);

        response.data = weeksData.map((v) => {
          const a = new ChartData();
          a.key = `${formatDateToDateMonthString(new Date(v.from))} - ${formatDateToDateMonthString(new Date(v.to))}`;
          a.value = v.data_count;
          return a;
        });
        break;

      case ChartType.MONTHS:
        const monthsData = await this.datasource.query<
          {
            date: string;
            data_count: number;
          }[]
        >(`
          SELECT 
            date_trunc('month', NOW()) - INTERVAL '1 month' * i AS "date",
            COUNT(v.id) AS "data_count"
          FROM generate_series(0, 6) i
          LEFT JOIN "violations" v ON 
            DATE(v."created_at") BETWEEN 
              date_trunc('month', NOW()) - INTERVAL '1 month' * i
              AND
              date_trunc('month', NOW()) - INTERVAL '1 month' * i + INTERVAL '1 month' - INTERVAL '1 day'
            AND v."deleted_at" IS NULL
          GROUP BY date_trunc('month', NOW()) - INTERVAL '1 month' * i
          ORDER BY "date" ASC
        `);

        response.data = monthsData.map((v) => {
          const a = new ChartData();
          a.key = convertMonthNumberToShortMonthName(
            new Date(v.date).getMonth(),
          );
          a.value = v.data_count;
          return a;
        });
        break;
    }
    return response;
  }

  constructor(private readonly datasource: DataSource) {}

  async getData(dateRange: QueryDateRangeDto) {
    try {
      const { startDate, finishDate } = dateRange;
      const data = await this.datasource
        .createQueryBuilder(ViolationEntity, 'violation')
        .leftJoin('violation.creator', 'creator')
        .leftJoin('violation.student', 'student')
        .leftJoin('violation.violationTypes', 'violationTypes')
        .select(
          'coalesce(sum(coalesce(violationTypes.point,0)),0)',
          'totalPoint',
        )
        .addSelect('count(violation.id)', 'totalViolation')
        .where((qb) => {
          if (startDate && finishDate) {
            qb.andWhere(
              `violation.createdAt BETWEEN '${startDate}' AND '${finishDate}'`,
            );
          }
        })
        .getRawOne<{ totalPoint: number; totalViolation: number }>();
      const mostStudent = await this.datasource
        .createQueryBuilder(StudentEntity, 'student')
        .leftJoin('student.violations', 'violations')
        .select('student.id', 'id')
        .addSelect('student.name', 'name')
        .addSelect('student.nationalStudentId', 'nationalStudentId')
        .addSelect('student.schoolStudentId', 'schoolStudentId')
        .addSelect('count(violations.id)', 'totalViolation')
        .where((qb) => {
          if (startDate && finishDate) {
            qb.andWhere(
              'violations.createdAt BETWEEN :startDate AND :finishDate',
              {
                startDate,
                finishDate,
              },
            );
          }
        })
        .groupBy('student.id')
        .addGroupBy('student.name')
        .addGroupBy('student.nationalStudentId')
        .addGroupBy('student.schoolStudentId')
        .orderBy('"totalViolation"', 'DESC')
        .getRawOne();
      const dsb = new DashboardResponseDto();
      dsb.totalPoint = Number(data.totalPoint);
      dsb.totalViolation = Number(data.totalViolation);
      dsb.studentWithMostViolation = mostStudent;
      const moreThan30 = await this.datasource
        .createQueryBuilder(StudentEntity, 'student')
        .leftJoin('student.violations', 'violations')
        .leftJoin('violations.violationTypes', 'violationTypes')
        .select([
          'student.id',
          'student.name',
          'student.nationalStudentId',
          'student.schoolStudentId',
        ])
        .addSelect('SUM(violationTypes.point)', 'point')
        .having('SUM(violationTypes.point) > 30')
        .where((qb) => {
          if (startDate && finishDate) {
            qb.andWhere(
              'violations.createdAt BETWEEN :startDate AND :finishDate',
              {
                startDate,
                finishDate,
              },
            );
          }
        })
        .groupBy('student.id')
        .addGroupBy('student.name')
        .addGroupBy('student.nationalStudentId')
        .addGroupBy('student.schoolStudentId')
        .getMany();
      const moreThan50 = await this.datasource
        .createQueryBuilder(StudentEntity, 'student')
        .leftJoin('student.violations', 'violations')
        .leftJoin('violations.violationTypes', 'violationTypes')
        .select([
          'student.id',
          'student.name',
          'student.nationalStudentId',
          'student.schoolStudentId',
        ])
        .addSelect('sum(violationTypes.point)', 'point')
        .having('SUM(violationTypes.point) > 50')
        .where((qb) => {
          if (startDate && finishDate) {
            qb.andWhere(
              'violations.createdAt BETWEEN :startDate AND :finishDate',
              {
                startDate,
                finishDate,
              },
            );
          }
        })
        .groupBy('student.id')
        .addGroupBy('student.name')
        .addGroupBy('student.nationalStudentId')
        .addGroupBy('student.schoolStudentId')
        .getMany();
      const moreThan70 = await this.datasource
        .createQueryBuilder(StudentEntity, 'student')
        .leftJoin('student.violations', 'violations')
        .leftJoin('violations.violationTypes', 'violationTypes')
        .select([
          'student.id',
          'student.name',
          'student.nationalStudentId',
          'student.schoolStudentId',
        ])
        .addSelect('sum(violationTypes.point)', 'point')
        .having('SUM(violationTypes.point) > 70')
        .where((qb) => {
          if (startDate && finishDate) {
            qb.andWhere(
              'violations.createdAt BETWEEN :startDate AND :finishDate',
              {
                startDate,
                finishDate,
              },
            );
          }
        })
        .groupBy('student.id')
        .addGroupBy('student.name')
        .addGroupBy('student.nationalStudentId')
        .addGroupBy('student.schoolStudentId')
        .getMany();
      const [strMnth, tdy] = fromStartOfThisMonthToToday();
      const [lsMnth, tdyLmnth] = fromStartOfLastMonthToTodayOnLastMonth();
      const violationsThisMonth = await this.datasource
        .createQueryBuilder(ViolationEntity, 'violation')
        .where((qb) => {
          qb.andWhere(
            'violation.createdAt BETWEEN :startDate AND :finishDate',
            {
              startDate: formatDate(strMnth),
              finishDate: formatDate(tdy),
            },
          );
        })
        .getCount();
      const violationsLastMonth = await this.datasource
        .createQueryBuilder(ViolationEntity, 'violation')
        .where((qb) => {
          qb.andWhere(
            'violation.createdAt BETWEEN :startDate AND :finishDate',
            {
              startDate: formatDate(lsMnth),
              finishDate: formatDate(tdyLmnth),
            },
          );
        })
        .getCount();

      const mostViolationType = await this.datasource
        .createQueryBuilder(ViolationTypeEntity, 'violationType')
        .leftJoin('violationType.violations', 'violations')
        .select([
          'violationType.id',
          'violationType.name',
          'violationType.point',
          'COUNT(violations.id) AS totalViolation',
        ])
        .groupBy('violationType.id')
        .addGroupBy('violationType.name')
        .addGroupBy('violationType.point')
        .orderBy('totalViolation', 'DESC')
        .where((qb) => {
          if (startDate && finishDate) {
            qb.andWhere(
              'violations.createdAt BETWEEN :startDate AND :finishDate',
              {
                startDate,
                finishDate,
              },
            );
          }
        })
        .limit(1)
        .getOne();
      dsb.mostViolationType = mostViolationType;
      dsb.violationPercentageFromLastMonth = Math.floor(
        ((violationsThisMonth - violationsLastMonth) /
          (violationsLastMonth === 0 ? 1 : violationsLastMonth)) *
          100,
      );
      dsb.studentWithPointMoreThan30 = moreThan30;
      dsb.studentWithPointMoreThan50 = moreThan50;
      dsb.studentWithPointMoreThan70 = moreThan70;
      dsb.totalStudent = await this.datasource.manager.count(StudentEntity);
      return dsb;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('internal server error');
    }
  }
}
