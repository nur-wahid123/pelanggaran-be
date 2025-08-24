import { MigrationInterface, QueryRunner } from "typeorm";

export class AddSchoolPofileTable1756042346353 implements MigrationInterface {
    name = 'AddSchoolPofileTable1756042346353'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "school_profile" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "value" character varying NOT NULL, CONSTRAINT "PK_bb0313d4bc2957cfb49ceb9611e" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "school_profile"`);
    }

}
