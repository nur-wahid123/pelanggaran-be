import { MigrationInterface, QueryRunner } from "typeorm";

export class AddTableViolationCollection1741788599228 implements MigrationInterface {
    name = 'AddTableViolationCollection1741788599228'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "violation_collection" ("created_at" TIMESTAMP NOT NULL DEFAULT now(), "created_by" integer, "updated_at" TIMESTAMP DEFAULT now(), "updated_by" integer, "deleted_at" TIMESTAMP, "deleted_by" integer, "id" SERIAL NOT NULL, CONSTRAINT "PK_88906077093c3cb0ff615787e61" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "violations" ADD "violation_collection_id" integer`);
        await queryRunner.query(`ALTER TABLE "violations" ADD CONSTRAINT "FK_54258511fdd670d16fb5d022501" FOREIGN KEY ("violation_collection_id") REFERENCES "violation_collection"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "violations" DROP CONSTRAINT "FK_54258511fdd670d16fb5d022501"`);
        await queryRunner.query(`ALTER TABLE "violations" DROP COLUMN "violation_collection_id"`);
        await queryRunner.query(`DROP TABLE "violation_collection"`);
    }

}
