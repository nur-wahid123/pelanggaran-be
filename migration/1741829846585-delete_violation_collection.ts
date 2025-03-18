import { MigrationInterface, QueryRunner } from "typeorm";

export class DeleteViolationCollection1741829846585 implements MigrationInterface {
    name = 'DeleteViolationCollection1741829846585'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "violations" DROP CONSTRAINT "FK_54258511fdd670d16fb5d022501"`);
        await queryRunner.query(`ALTER TABLE "violations" DROP COLUMN "violation_collection_id"`);
        await queryRunner.query(`ALTER TABLE "violations" ADD "date" TIMESTAMP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "violations" ADD "note" text`);
        await queryRunner.query(`ALTER TABLE "violations" ADD "creator_id" integer`);
        await queryRunner.query(`ALTER TABLE "violations" ADD CONSTRAINT "FK_0a77e52d1bd614b705fdab0cde0" FOREIGN KEY ("creator_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "violations" DROP CONSTRAINT "FK_0a77e52d1bd614b705fdab0cde0"`);
        await queryRunner.query(`ALTER TABLE "violations" DROP COLUMN "creator_id"`);
        await queryRunner.query(`ALTER TABLE "violations" DROP COLUMN "note"`);
        await queryRunner.query(`ALTER TABLE "violations" DROP COLUMN "date"`);
        await queryRunner.query(`ALTER TABLE "violations" ADD "violation_collection_id" integer`);
        await queryRunner.query(`ALTER TABLE "violations" ADD CONSTRAINT "FK_54258511fdd670d16fb5d022501" FOREIGN KEY ("violation_collection_id") REFERENCES "violation_collection"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
