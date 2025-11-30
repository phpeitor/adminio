<?php

function env($key, $default = null) {
    static $vars = null;

    if ($vars === null) {
        $vars = [];

        $path = __DIR__ . "/../.env";

        if (file_exists($path)) {
            $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);

            foreach ($lines as $line) {
                if (strpos(trim($line), '#') === 0) continue;

                if (strpos($line, '=') !== false) {
                    list($name, $value) = explode('=', $line, 2);
                    $vars[trim($name)] = trim($value);
                }
            }
        }
    }

    return isset($vars[$key]) ? $vars[$key] : $default;
}
