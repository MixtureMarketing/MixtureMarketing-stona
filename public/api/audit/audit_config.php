<?php
// public/api/audit/audit_config.php
require_once 'classes/RedisCache.php';

// Include Main Config for SMTP Credentials
if (file_exists(__DIR__ . '/../config.php')) {
    require_once __DIR__ . '/../config.php';
}

// --- GOOGLE API KEY B (Prywatny) ---
if (file_exists(__DIR__ . '/audit_secrets.php')) {
    require_once __DIR__ . '/audit_secrets.php';
}
define('GOOGLE_BACKEND_KEY', getenv('GOOGLE_BACKEND_KEY') ?: (defined('SECRET_BACKEND_KEY') ? SECRET_BACKEND_KEY : ''));

// --- REDIS CONFIG ---
if (!defined('REDIS_ENABLED')) define('REDIS_ENABLED', true);
if (!defined('REDIS_HOST')) define('REDIS_HOST', '/usr/local/redis/sockets/serwer322648.sock');
if (!defined('REDIS_PORT')) define('REDIS_PORT', 0);
if (!defined('REDIS_PASSWORD')) define('REDIS_PASSWORD', null);
if (!defined('REDIS_TTL')) define('REDIS_TTL', 60 * 60 * 24 * 7);

// --- SYSTEM CONFIG ---
define('PDF_STORAGE_PATH', __DIR__ . '/../../uploads/reports/');
?>