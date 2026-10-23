<?php
declare(strict_types=1);

// Ambos formularios usan el .env de la raíz, como el contacto original.
// Si existe el lector anterior, conservar su comportamiento.
if (is_file(__DIR__ . '/env.php')) require_once __DIR__ . '/env.php';

function adminio_mail_config(): array
{
    $vars = [];
    $path = dirname(__DIR__) . '/.env';
    if (is_readable($path)) {
        foreach (file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) as $line) {
            $line = trim($line);
            if ($line === '' || $line[0] === '#' || strpos($line, '=') === false) continue;
            [$key, $value] = explode('=', $line, 2);
            $value = trim($value);
            if (strlen($value) >= 2 && (($value[0] === '"' && substr($value, -1) === '"') || ($value[0] === "'" && substr($value, -1) === "'"))) $value = substr($value, 1, -1);
            $vars[trim($key)] = $value;
        }
    }
    $read = static function (string $key, string $default = '') use ($vars): string {
        if (function_exists('env')) return (string) env($key, $default);
        return (string) ($vars[$key] ?? $default);
    };
    $config = [];
    foreach (['smtp_host' => 'MAIL_HOST', 'smtp_username' => 'MAIL_USERNAME', 'smtp_password' => 'MAIL_PASSWORD', 'from_email' => 'MAIL_FROM_EMAIL', 'to_email' => 'MAIL_TO'] as $key => $variable) {
        $config[$key] = $read($variable);
        if (trim($config[$key]) === '') throw new RuntimeException('mail_not_configured');
    }
    $config['smtp_port'] = filter_var($read('MAIL_PORT', '587'), FILTER_VALIDATE_INT, ['options' => ['min_range' => 1, 'max_range' => 65535]]);
    $config['smtp_secure'] = $read('MAIL_SECURE', 'tls');
    $config['from_name'] = $read('MAIL_FROM_NAME', 'ADMINIO Perú');
    if (!$config['smtp_port'] || !in_array($config['smtp_secure'], ['tls', 'ssl'], true) || !filter_var($config['from_email'], FILTER_VALIDATE_EMAIL) || !filter_var($config['to_email'], FILTER_VALIDATE_EMAIL)) throw new RuntimeException('mail_not_configured');
    return $config;
}

function adminio_mail_autoload(): void
{
    // Preferir la instalación del sitio anterior; admitir las de los módulos.
    foreach (['/vendor/autoload.php', '/cotizaciones/vendor/autoload.php', '/empleos/vendor/autoload.php'] as $relative) {
        $file = dirname(__DIR__) . $relative;
        if (is_file($file)) require_once $file;
        if (class_exists(\PHPMailer\PHPMailer\PHPMailer::class)) return;
    }
    throw new RuntimeException('mail_not_configured');
}

function adminio_mail_rate_dir(string $module): string
{
    return sys_get_temp_dir() . '/adminio-' . substr(hash('sha256', dirname(__DIR__)), 0, 16) . '-' . $module;
}
