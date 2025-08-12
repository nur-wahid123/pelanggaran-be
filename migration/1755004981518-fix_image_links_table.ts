import { MigrationInterface, QueryRunner } from "typeorm";

export class FixImageLinksTable1755004981518 implements MigrationInterface {
    name = 'FixImageLinksTable1755004981518'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "image_links" ("created_at" TIMESTAMP NOT NULL DEFAULT now(), "created_by" integer, "updated_at" TIMESTAMP DEFAULT now(), "updated_by" integer, "deleted_at" TIMESTAMP, "deleted_by" integer, "image_link_id" SERIAL NOT NULL, "id" integer NOT NULL, "image_id" integer NOT NULL, CONSTRAINT "PK_6f70f4cc25b9764ebeca6bdffc2" PRIMARY KEY ("image_link_id"))`);
        await queryRunner.query(`ALTER TABLE "image_links" ADD CONSTRAINT "FK_2f6dc014b6100d95f6c08a0455c" FOREIGN KEY ("image_id") REFERENCES "images"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "image_links" DROP CONSTRAINT "FK_2f6dc014b6100d95f6c08a0455c"`);
        await queryRunner.query(`DROP TABLE "image_links"`);
    }

}
