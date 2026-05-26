<?php

require_once __DIR__ . "/../config/env.php";

class DatabaseConnection
{
    public static function getConnection(): PDO
    {
        static $pdo = null;

        if ($pdo instanceof PDO) {
            return $pdo;
        }

        $host = env("DB_HOST", "161.132.4.164");
        $port = env("DB_PORT", "3306");
        $name = env("DB_NAME", "bd_cruces");
        $user = env("DB_USERNAME", "usr_cruces");
        $pass = env("DB_PASSWORD", "NuevaClaveSegura_2026*");
        $charset = env("DB_CHARSET", "utf8mb4");

        $dsn = "mysql:host={$host};port={$port};dbname={$name};charset={$charset}";
        $options = [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ];

        $pdo = new PDO($dsn, $user, $pass, $options);

        return $pdo;
    }
}
