<?php
require_once 'config.php';

class RedisService {
    private $redis = null;
    private $isConnected = false;

    public function __construct() {
        if (!defined('REDIS_ENABLED') || !REDIS_ENABLED) {
            return;
        }

        if (class_exists('Redis')) {
            try {
                $this->redis = new Redis();
                
                // Próba połączenia przez Unix Socket (szybsze na hostingu)
                if (defined('REDIS_SOCKET') && !empty(REDIS_SOCKET)) {
                    $this->isConnected = $this->redis->connect(REDIS_SOCKET);
                } 
                // Fallback do TCP
                else {
                    $this->isConnected = $this->redis->connect(REDIS_HOST, REDIS_PORT, 1);
                }

                if ($this->isConnected) {
                    if (defined('REDIS_PASS') && REDIS_PASS) {
                        $this->redis->auth(REDIS_PASS);
                    }
                }
            } catch (Exception $e) {
                $this->isConnected = false;
            }
        }
    }

    public function get($key) {
        if (!$this->isConnected) return null;
        $data = $this->redis->get($key);
        return $data ? json_decode($data, true) : null;
    }

    public function set($key, $data, $ttl = 3600) {
        if (!$this->isConnected) return false;
        return $this->redis->setex($key, $ttl, json_encode($data));
    }

    public function delete($key) {
        if (!$this->isConnected) return false;
        return $this->redis->del($key);
    }

    public function isAvailable() {
        return $this->isConnected;
    }
}
?>