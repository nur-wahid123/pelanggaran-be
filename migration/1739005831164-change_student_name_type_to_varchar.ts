import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChangeStudentNameTypeToVarchar1739005831164
  implements MigrationInterface
{
  name = 'ChangeStudentNameTypeToVarchar1739005831164';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "violations" ADD "student_id" integer`,
    );
    await queryRunner.query(`ALTER TABLE "students" DROP COLUMN "name"`);
    await queryRunner.query(
      `ALTER TABLE "students" ADD "name" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "violations" ADD CONSTRAINT "FK_cfb2f3af825f7069358aea7d946" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "violations" DROP CONSTRAINT "FK_cfb2f3af825f7069358aea7d946"`,
    );
    await queryRunner.query(`ALTER TABLE "students" DROP COLUMN "name"`);
    await queryRunner.query(
      `ALTER TABLE "students" ADD "name" integer NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "violations" DROP COLUMN "student_id"`,
    );
  }
}
