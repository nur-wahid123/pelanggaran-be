import { MigrationInterface, QueryRunner } from "typeorm";

export class AddImageLinksTable1754924608788 implements MigrationInterface {
    name = 'AddImageLinksTable1754924608788'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "violations" ADD "image_group_id" integer`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "violations" DROP COLUMN "image_group_id"`);
    }

}
