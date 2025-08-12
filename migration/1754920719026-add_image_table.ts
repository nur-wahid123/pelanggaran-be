import { MigrationInterface, QueryRunner } from "typeorm";

export class AddImageTable1754920719026 implements MigrationInterface {
    name = 'AddImageTable1754920719026'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "images" ("created_at" TIMESTAMP NOT NULL DEFAULT now(), "created_by" integer, "updated_at" TIMESTAMP DEFAULT now(), "updated_by" integer, "deleted_at" TIMESTAMP, "deleted_by" integer, "id" SERIAL NOT NULL, "original_name" character varying NOT NULL, "key" character varying NOT NULL, "mimetype" character varying NOT NULL, "size" integer NOT NULL, CONSTRAINT "PK_1fe148074c6a1a91b63cb9ee3c9" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "images"`);
    }

}
