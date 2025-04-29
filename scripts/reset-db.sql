USE [crm]
GO

-- 禁用外键约束
EXEC sp_MSforeachtable "ALTER TABLE ? NOCHECK CONSTRAINT ALL"
GO

-- 删除所有表
DECLARE @sql NVARCHAR(MAX) = N''

SELECT @sql += N'
DROP TABLE ' + QUOTENAME(SCHEMA_NAME(schema_id)) + N'.' + QUOTENAME(name) + N';'
FROM sys.tables
WHERE type = 'U'
ORDER BY CASE
    WHEN name LIKE '%UserRoles%' THEN 1
    WHEN name LIKE '%RolePermissions%' THEN 2
    WHEN name LIKE '%RefreshTokens%' THEN 3
    WHEN name LIKE '%Users%' THEN 4
    WHEN name LIKE '%Roles%' THEN 5
    WHEN name LIKE '%Permissions%' THEN 6
    ELSE 7
END

EXEC sp_executesql @sql
GO

-- 启用外键约束
EXEC sp_MSforeachtable "ALTER TABLE ? WITH CHECK CHECK CONSTRAINT ALL"
GO