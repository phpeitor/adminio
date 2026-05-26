<?php

require_once __DIR__ . "/../db/connection.php";

class AsistenciaAdministradoresModel
{
    private PDO $db;
    private ?string $dateColumn = null;
    private string $tableName = 'asistencia_administradores';

    public function __construct()
    {
        $this->db = DatabaseConnection::getConnection();
    }

    public function getReport(int $limit = 100, int $offset = 0, ?string $desde = null, ?string $hasta = null): array
    {
        $dateColumn = $this->resolveDateColumn();
        [$whereSql, $params] = $this->buildDateFilter($dateColumn, $desde, $hasta);

        $sql = "SELECT * FROM {$this->tableName} {$whereSql} ORDER BY DATE(`{$dateColumn}`) DESC LIMIT :limit OFFSET :offset";
        $stmt = $this->db->prepare($sql);

        foreach ($params as $key => $value) {
            $stmt->bindValue($key, $value);
        }

        $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
        $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
        $stmt->execute();

        $rows = $stmt->fetchAll();
        $columns = [];

        if (!empty($rows)) {
            $columns = array_keys($rows[0]);
        }

        return [
            'columns' => $columns,
            'rows' => $rows,
            'dateColumn' => $this->getDateColumn(),
        ];
    }

    public function countAll(?string $desde = null, ?string $hasta = null): int
    {
        $dateColumn = $this->resolveDateColumn();
        [$whereSql, $params] = $this->buildDateFilter($dateColumn, $desde, $hasta);

        $stmt = $this->db->prepare("SELECT COUNT(*) AS total FROM {$this->tableName} {$whereSql}");

        foreach ($params as $key => $value) {
            $stmt->bindValue($key, $value);
        }

        $stmt->execute();
        $row = $stmt->fetch();

        return (int) ($row['total'] ?? 0);
    }

    private function buildDateFilter(string $dateColumn, ?string $desde, ?string $hasta): array
    {
        $clauses = [];
        $params = [];

        if ($desde !== null && $desde !== '') {
            $clauses[] = "DATE(`{$dateColumn}`) >= :desde";
            $params[':desde'] = $desde;
        }

        if ($hasta !== null && $hasta !== '') {
            $clauses[] = "DATE(`{$dateColumn}`) <= :hasta";
            $params[':hasta'] = $hasta;
        }

        if (empty($clauses)) {
            return ['', []];
        }

        return ['WHERE ' . implode(' AND ', $clauses), $params];
    }

    private function resolveDateColumn(): string
    {
        $column = $this->getDateColumn();

        if ($column === null) {
            throw new RuntimeException('No se encontró una columna de fecha en asistencia_administradores');
        }

        return $column;
    }

    public function getDateColumn(): ?string
    {
        if ($this->dateColumn !== null) {
            return $this->dateColumn;
        }

        $exactDateColumn = $this->db->prepare(
            "SELECT COLUMN_NAME
             FROM INFORMATION_SCHEMA.COLUMNS
             WHERE TABLE_SCHEMA = DATABASE()
               AND TABLE_NAME = ?
               AND COLUMN_NAME = 'fecha'
             LIMIT 1"
        );
        $exactDateColumn->execute([$this->tableName]);
        $exactRow = $exactDateColumn->fetch();

        if (!empty($exactRow['COLUMN_NAME'])) {
            $this->dateColumn = 'fecha';
            return $this->dateColumn;
        }

        $preferredNames = [
            'created_at',
            'updated_at',
            'fecha_registro',
            'fecha_asistencia',
            'date',
        ];

        $placeholders = implode(',', array_fill(0, count($preferredNames), '?'));
        $sql = "
            SELECT COLUMN_NAME, DATA_TYPE
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_SCHEMA = DATABASE()
              AND TABLE_NAME = ?
              AND (
                                        COLUMN_NAME IN ({$placeholders})
                                        OR DATA_TYPE IN ('date', 'datetime', 'timestamp')
                  )
                        ORDER BY FIELD(COLUMN_NAME, 'created_at', 'updated_at', 'fecha_registro', 'fecha_asistencia', 'date') ASC,
                     ORDINAL_POSITION ASC
            LIMIT 1
        ";

        $stmt = $this->db->prepare($sql);
        $stmt->execute(array_merge([$this->tableName], $preferredNames));
        $row = $stmt->fetch();

        $this->dateColumn = $row['COLUMN_NAME'] ?? null;

        return $this->dateColumn;
    }
}
