START TRANSACTION;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20261002032527_FactorCodeKeyToZScore') THEN
    UPDATE "Factors" AS f
    SET "CodeKey" = f."CodeKey" || '_z',
        "UpdatedAt" = NOW()
    WHERE f."CodeKey" ~ '^mom_(5|10|20|60|120|252)$'
      AND NOT EXISTS (
          SELECT 1 FROM "Factors" AS g WHERE g."CodeKey" = f."CodeKey" || '_z'
      );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20261002032527_FactorCodeKeyToZScore') THEN
    INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
    VALUES ('20261002032527_FactorCodeKeyToZScore', '9.0.7');
    END IF;
END $EF$;
COMMIT;

