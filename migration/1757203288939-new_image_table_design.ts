import { MigrationInterface, QueryRunner } from "typeorm";

export class NewImageTableDesign1757203288939 implements MigrationInterface {
    name = 'NewImageTableDesign1757203288939'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "image_links" DROP CONSTRAINT "FK_2f6dc014b6100d95f6c08a0455c"`);
        await queryRunner.query(`ALTER TABLE "image_links" DROP CONSTRAINT "PK_6f70f4cc25b9764ebeca6bdffc2"`);
        await queryRunner.query(`ALTER TABLE "image_links" DROP COLUMN "image_link_id"`);
        await queryRunner.query(`ALTER TABLE "image_links" DROP COLUMN "image_id"`);
        await queryRunner.query(`ALTER TABLE "violations" DROP COLUMN "image_group_id"`);
        await queryRunner.query(`ALTER TABLE "images" ADD "image_link_id" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "image_links" ADD "violation_id" integer`);
        await queryRunner.query(`ALTER TABLE "image_links" ADD CONSTRAINT "UQ_65c8c56b354618d3ca9d56f8634" UNIQUE ("violation_id")`);
        await queryRunner.query(`ALTER TABLE "image_links" ADD CONSTRAINT "PK_26ff059fa2ca77f3c96546207e8" PRIMARY KEY ("id")`);
        await queryRunner.query(`CREATE SEQUENCE IF NOT EXISTS "image_links_id_seq" OWNED BY "image_links"."id"`);
        await queryRunner.query(`ALTER TABLE "image_links" ALTER COLUMN "id" SET DEFAULT nextval('"image_links_id_seq"')`);
        await queryRunner.query(`ALTER TABLE "images" ADD CONSTRAINT "FK_2f4af0bd6f628e0443fc4c21529" FOREIGN KEY ("image_link_id") REFERENCES "image_links"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "image_links" ADD CONSTRAINT "FK_65c8c56b354618d3ca9d56f8634" FOREIGN KEY ("violation_id") REFERENCES "violations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "image_links" DROP CONSTRAINT "FK_65c8c56b354618d3ca9d56f8634"`);
        await queryRunner.query(`ALTER TABLE "images" DROP CONSTRAINT "FK_2f4af0bd6f628e0443fc4c21529"`);
        await queryRunner.query(`ALTER TABLE "image_links" ALTER COLUMN "id" DROP DEFAULT`);
        await queryRunner.query(`DROP SEQUENCE "image_links_id_seq"`);
        await queryRunner.query(`ALTER TABLE "image_links" DROP CONSTRAINT "PK_26ff059fa2ca77f3c96546207e8"`);
        await queryRunner.query(`ALTER TABLE "image_links" DROP CONSTRAINT "UQ_65c8c56b354618d3ca9d56f8634"`);
        await queryRunner.query(`ALTER TABLE "image_links" DROP COLUMN "violation_id"`);
        await queryRunner.query(`ALTER TABLE "images" DROP COLUMN "image_link_id"`);
        await queryRunner.query(`ALTER TABLE "violations" ADD "image_group_id" integer`);
        await queryRunner.query(`ALTER TABLE "image_links" ADD "image_id" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "image_links" ADD "image_link_id" SERIAL NOT NULL`);
        await queryRunner.query(`ALTER TABLE "image_links" ADD CONSTRAINT "PK_6f70f4cc25b9764ebeca6bdffc2" PRIMARY KEY ("image_link_id")`);
        await queryRunner.query(`ALTER TABLE "image_links" ADD CONSTRAINT "FK_2f6dc014b6100d95f6c08a0455c" FOREIGN KEY ("image_id") REFERENCES "images"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
