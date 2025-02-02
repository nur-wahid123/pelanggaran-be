import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1738505597235 implements MigrationInterface {
    name = 'Init1738505597235'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "users" ("created_at" TIMESTAMP NOT NULL DEFAULT now(), "created_by" integer, "updated_at" TIMESTAMP DEFAULT now(), "updated_by" integer, "deleted_at" TIMESTAMP, "deleted_by" integer, "id" SERIAL NOT NULL, "name" character varying NOT NULL, "username" character varying NOT NULL, "password" character varying NOT NULL, "role" "public"."users_role_enum" NOT NULL, CONSTRAINT "UQ_fe0bb3f6520ee0469504521e710" UNIQUE ("username"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "classes" ("created_at" TIMESTAMP NOT NULL DEFAULT now(), "created_by" integer, "updated_at" TIMESTAMP DEFAULT now(), "updated_by" integer, "deleted_at" TIMESTAMP, "deleted_by" integer, "id" SERIAL NOT NULL, "name" character varying NOT NULL, CONSTRAINT "PK_e207aa15404e9b2ce35910f9f7f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "students" ("created_at" TIMESTAMP NOT NULL DEFAULT now(), "created_by" integer, "updated_at" TIMESTAMP DEFAULT now(), "updated_by" integer, "deleted_at" TIMESTAMP, "deleted_by" integer, "id" SERIAL NOT NULL, "name" integer NOT NULL, "school_student_id" character varying NOT NULL, "national_student_id" character varying NOT NULL, "student_class_id" integer, CONSTRAINT "PK_7d7f07271ad4ce999880713f05e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "violation_types" ("created_at" TIMESTAMP NOT NULL DEFAULT now(), "created_by" integer, "updated_at" TIMESTAMP DEFAULT now(), "updated_by" integer, "deleted_at" TIMESTAMP, "deleted_by" integer, "id" SERIAL NOT NULL, "name" character varying NOT NULL, "point" integer NOT NULL, CONSTRAINT "PK_4b8f75707326b1ffda3a8ca82c8" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "violations" ("created_at" TIMESTAMP NOT NULL DEFAULT now(), "created_by" integer, "updated_at" TIMESTAMP DEFAULT now(), "updated_by" integer, "deleted_at" TIMESTAMP, "deleted_by" integer, "id" SERIAL NOT NULL, "date" TIMESTAMP NOT NULL, "note" text, "creator_id" integer, CONSTRAINT "PK_a2aa2d655842de3c02315ba6073" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "violations_students_students" ("violations_id" integer NOT NULL, "students_id" integer NOT NULL, CONSTRAINT "PK_7111755d11f20c6ae6f552f5061" PRIMARY KEY ("violations_id", "students_id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_ae6bf99b9f0c1be4342d3d6739" ON "violations_students_students" ("violations_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_e2b17e32b44c071ebf4a21420b" ON "violations_students_students" ("students_id") `);
        await queryRunner.query(`CREATE TABLE "violations_violation_types_violation_types" ("violations_id" integer NOT NULL, "violation_types_id" integer NOT NULL, CONSTRAINT "PK_0e758cf816d0dd2f9efaa828155" PRIMARY KEY ("violations_id", "violation_types_id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_2f07554df162ad4c249ced28ad" ON "violations_violation_types_violation_types" ("violations_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_14c78d3c46cb81b451d9ccf6fe" ON "violations_violation_types_violation_types" ("violation_types_id") `);
        await queryRunner.query(`ALTER TABLE "students" ADD CONSTRAINT "FK_c1f9388912ff71471698052187e" FOREIGN KEY ("student_class_id") REFERENCES "classes"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "violations" ADD CONSTRAINT "FK_0a77e52d1bd614b705fdab0cde0" FOREIGN KEY ("creator_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "violations_students_students" ADD CONSTRAINT "FK_ae6bf99b9f0c1be4342d3d67392" FOREIGN KEY ("violations_id") REFERENCES "violations"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "violations_students_students" ADD CONSTRAINT "FK_e2b17e32b44c071ebf4a21420b3" FOREIGN KEY ("students_id") REFERENCES "students"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "violations_violation_types_violation_types" ADD CONSTRAINT "FK_2f07554df162ad4c249ced28ad9" FOREIGN KEY ("violations_id") REFERENCES "violations"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "violations_violation_types_violation_types" ADD CONSTRAINT "FK_14c78d3c46cb81b451d9ccf6fe5" FOREIGN KEY ("violation_types_id") REFERENCES "violation_types"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "violations_violation_types_violation_types" DROP CONSTRAINT "FK_14c78d3c46cb81b451d9ccf6fe5"`);
        await queryRunner.query(`ALTER TABLE "violations_violation_types_violation_types" DROP CONSTRAINT "FK_2f07554df162ad4c249ced28ad9"`);
        await queryRunner.query(`ALTER TABLE "violations_students_students" DROP CONSTRAINT "FK_e2b17e32b44c071ebf4a21420b3"`);
        await queryRunner.query(`ALTER TABLE "violations_students_students" DROP CONSTRAINT "FK_ae6bf99b9f0c1be4342d3d67392"`);
        await queryRunner.query(`ALTER TABLE "violations" DROP CONSTRAINT "FK_0a77e52d1bd614b705fdab0cde0"`);
        await queryRunner.query(`ALTER TABLE "students" DROP CONSTRAINT "FK_c1f9388912ff71471698052187e"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_14c78d3c46cb81b451d9ccf6fe"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_2f07554df162ad4c249ced28ad"`);
        await queryRunner.query(`DROP TABLE "violations_violation_types_violation_types"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_e2b17e32b44c071ebf4a21420b"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_ae6bf99b9f0c1be4342d3d6739"`);
        await queryRunner.query(`DROP TABLE "violations_students_students"`);
        await queryRunner.query(`DROP TABLE "violations"`);
        await queryRunner.query(`DROP TABLE "violation_types"`);
        await queryRunner.query(`DROP TABLE "students"`);
        await queryRunner.query(`DROP TABLE "classes"`);
        await queryRunner.query(`DROP TABLE "users"`);
    }

}
