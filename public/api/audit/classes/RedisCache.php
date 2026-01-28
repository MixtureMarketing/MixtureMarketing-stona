<?php
// public/api/audit/classes/RedisCache.php

class AuditCache {
    private $redis;
    private $isConnected = false;

    public function __construct() {
        if (!REDIS_ENABLED) return;

        try {
            if (class_exists('Redis')) {
                $this->redis = new Redis();
                // Obsługa połączenia przez Socket (częste na shared hosting) lub TCP
                if (strpos(REDIS_HOST, '/') === 0) {
                     $connected = $this->redis->connect(REDIS_HOST);
                } else {
                     $connected = $this->redis->connect(REDIS_HOST, REDIS_PORT);
                }

                if ($connected) {
                    if (REDIS_PASSWORD) {
                        $auth = $this->redis->auth(REDIS_PASSWORD);
                        $this->isConnected = $auth;
                    } else {
                        $this->isConnected = true;
                    }
                }
            }
        } catch (Exception $e) {
            // Redis failure shouldn't kill the app, just disable cache
            error_log("Redis Connection Error: " . $e->getMessage());
            $this->isConnected = false;
        }
    }

    public function get($key) {
        if (!$this->isConnected) return null;
        try {
            $data = $this->redis->get('audit:' . $key);
            return $data ? json_decode($data, true) : null;
        } catch (Exception $e) {
            return null;
        }
    }

    public function set($key, $data, $ttl = REDIS_TTL) {
        if (!$this->isConnected) return false;
        try {
            return $this->redis->setEx('audit:' . $key, $ttl, json_encode($data));
        } catch (Exception $e) {
            return false;
        }
    }

    public function exists($key) {
        if (!$this->isConnected) return false;
        return $this->redis->exists('audit:' . $key);
    }
}
?>