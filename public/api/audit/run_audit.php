<?php
// public/api/audit/run_audit.php
ini_set('display_errors', 0);
error_reporting(0); // W produkcji logujemy do pliku, nie na wyjście

require_once 'audit_config.php';
require_once 'classes/RedisCache.php';

// Increase execution time for deep audits
set_time_limit(120);
ignore_user_abort(true);

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { exit(0); }

$input = json_decode(file_get_contents("php://input"), true);
$url = $input['url'] ?? '';
$competitorUrl = $input['competitorUrl'] ?? '';
$placeId = $input['placeId'] ?? '';
$forceRefresh = $input['force'] ?? false;

if (!$url) {
    http_response_code(400);
    echo json_encode(['error' => 'URL is required']);
    exit;
}

function normalizeUrl($u) {
    if (!preg_match("~^(?:f|ht)tps?://~i", $u)) { $u = "https://" . $u; }
    return rtrim($u, '/');
}
$url = normalizeUrl($url);
$competitorUrl = $competitorUrl ? normalizeUrl($competitorUrl) : null;

$cacheKey = md5('v5_full_' . $url . '|' . $competitorUrl . '|' . $placeId); 
$cache = new AuditCache();

if (!$forceRefresh) {
    $cachedData = $cache->get($cacheKey);
    if ($cachedData) {
        echo json_encode(['status' => 'success', 'source' => 'cache', 'data' => $cachedData]);
        exit;
    }
}

/**
 * PARALLEL EXECUTION ENGINE
 * Fire all external requests at once to avoid sequential bottlenecks
 */

$mh = curl_multi_init();
$handles = [];

// 1. Scraper Request
$chScrape = curl_init();
curl_setopt($chScrape, CURLOPT_URL, $url);
curl_setopt($chScrape, CURLOPT_RETURNTRANSFER, true);
curl_setopt($chScrape, CURLOPT_FOLLOWLOCATION, true);
curl_setopt($chScrape, CURLOPT_TIMEOUT, 20);
curl_setopt($chScrape, CURLOPT_USERAGENT, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
curl_setopt($chScrape, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($chScrape, CURLOPT_HEADER, true);
curl_multi_add_handle($mh, $chScrape);
$handles['scrape'] = $chScrape;

// 2. PSI Request (The slow one)
$psiUrl = "https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=" . urlencode($url) . "&key=" . GOOGLE_BACKEND_KEY . "&strategy=mobile&category=PERFORMANCE&category=SEO&category=ACCESSIBILITY&category=BEST_PRACTICES";
$chPsi = curl_init($psiUrl);
curl_setopt($chPsi, CURLOPT_RETURNTRANSFER, true);
curl_setopt($chPsi, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($chPsi, CURLOPT_TIMEOUT, 80);
curl_multi_add_handle($mh, $chPsi);
$handles['psi'] = $chPsi;

// 3. Places Request (if ID provided)
$chPlaces = null;
if ($placeId) {
    $chPlaces = curl_init("https://places.googleapis.com/v1/places/" . $placeId);
    curl_setopt($chPlaces, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($chPlaces, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($chPlaces, CURLOPT_HTTPHEADER, ['X-Goog-Api-Key: ' . GOOGLE_BACKEND_KEY, 'X-Goog-FieldMask: rating,userRatingCount,photos,addressComponents']);
    curl_multi_add_handle($mh, $chPlaces);
    $handles['places'] = $chPlaces;
}

// 4. CrUX Request (Fast metadata)
$cruxUrl = "https://chromeuxreport.googleapis.com/v1/records:queryRecord?key=" . GOOGLE_BACKEND_KEY;
$chCrux = curl_init($cruxUrl);
curl_setopt($chCrux, CURLOPT_POST, 1);
curl_setopt($chCrux, CURLOPT_RETURNTRANSFER, true);
curl_setopt($chCrux, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($chCrux, CURLOPT_POSTFIELDS, json_encode(['origin' => $url]));
curl_setopt($chCrux, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
curl_multi_add_handle($mh, $chCrux);
$handles['crux'] = $chCrux;

// Execute all handles
$active = null;
do {
    $status = curl_multi_exec($mh, $active);
    if ($active) curl_multi_select($mh);
} while ($active && $status == CURLM_OK);

// Collect Results
$responses = [];
foreach ($handles as $key => $ch) {
    $responses[$key] = curl_multi_getcontent($ch);
    $info[$key] = curl_getinfo($ch);
    curl_multi_remove_handle($mh, $ch);
    curl_close($ch);
}
curl_multi_close($mh);

// --- PROCESS SCRAPER ---
$scrapeResult = [
    'tech' => ['gtm' => false, 'pixel' => false, 'analytics' => false, 'ssl' => false, 'cms' => []],
    'seo' => ['title' => null, 'h1' => null, 'description' => null, 'robots' => null, 'canonical' => null],
    'social' => [],
    'security' => ['headers' => []]
];

if ($responses['scrape']) {
    $headerSize = $info['scrape']['header_size'];
    $headers = substr($responses['scrape'], 0, $headerSize);
    $html = substr($responses['scrape'], $headerSize);
    
    $scrapeResult['tech']['ssl'] = (strpos($info['scrape']['url'], 'https://') === 0);
    $scrapeResult['tech']['gtm'] = (stripos($html, 'GTM-') !== false || stripos($html, 'googletagmanager.com') !== false || stripos($html, 'zaraz') !== false);
    $scrapeResult['tech']['pixel'] = (stripos($html, 'fbq(') !== false || stripos($html, '_fbq') !== false || stripos($html, 'connect.facebook.net') !== false);
    $scrapeResult['tech']['analytics'] = (preg_match('/UA-[0-9]+-[0-9]/', $html) || preg_match('/G-[A-Z0-9]+/', $html) || stripos($html, 'google-analytics.com') !== false || stripos($html, 'gtag') !== false);

    if (stripos($html, '/wp-content/') !== false) $scrapeResult['tech']['cms'][] = 'WordPress';
    if (stripos($html, '/wp-content/plugins/woocommerce') !== false) $scrapeResult['tech']['cms'][] = 'WooCommerce';
    if (stripos($html, 'shopify') !== false && stripos($html, 'cdn.shopify.com') !== false) $scrapeResult['tech']['cms'][] = 'Shopify';
    if (stripos($html, 'wix.com') !== false && stripos($html, 'wix-bolt') !== false) $scrapeResult['tech']['cms'][] = 'Wix';
    if (stripos($html, 'prestashop') !== false && stripos($html, 'modules/') !== false) $scrapeResult['tech']['cms'][] = 'PrestaShop';
    if (stripos($html, 'shoper') !== false && stripos($html, 'shoper_skin') !== false) $scrapeResult['tech']['cms'][] = 'Shoper';

    // Business Type Detection
    $cartKeywords = ['koszyk', 'do koszyka', 'cart', 'add to cart', 'zamówienie', 'checkout'];
    $priceKeywords = ['zł', 'pln', 'cena', 'price'];
    $isEcommerce = false;
    
    // Check for explicit shop CMS first
    if (in_array('Shopify', $scrapeResult['tech']['cms']) || in_array('WooCommerce', $scrapeResult['tech']['cms']) || in_array('PrestaShop', $scrapeResult['tech']['cms']) || in_array('Shoper', $scrapeResult['tech']['cms'])) {
        $isEcommerce = true;
    } else {
         // Strict content check: needs CART keywords AND explicit price indicators
         $foundCart = false;
         foreach ($cartKeywords as $kw) { if (stripos($html, $kw) !== false) $foundCart = true; }
         
         if ($foundCart) {
            $foundPrice = false;
            foreach ($priceKeywords as $pkw) { if (stripos($html, $pkw) !== false) $foundPrice = true; }
            if ($foundPrice) $isEcommerce = true;
         }
    }

    $scrapeResult['tech']['is_ecommerce'] = $isEcommerce;

    $socialPatterns = ['facebook' => '/facebook\.com/i', 'instagram' => '/instagram\.com/i', 'linkedin' => '/linkedin\.com/i', 'youtube' => '/youtube\.com/i', 'tiktok' => '/tiktok\.com/i'];
    foreach ($socialPatterns as $name => $pattern) { $scrapeResult['social'][$name] = (preg_match($pattern, $html) === 1); }
    
    // New checks for V6
    $scrapeResult['social']['og_tags'] = (stripos($html, 'og:title') !== false && stripos($html, 'og:image') !== false);
    $scrapeResult['tech']['schema_org'] = (stripos($html, 'application/ld+json') !== false || stripos($html, 'itemscope') !== false);
    $scrapeResult['tech']['favicon'] = (stripos($html, 'rel="icon"') !== false || stripos($html, 'rel="shortcut icon"') !== false);

    if (stripos($headers, 'Strict-Transport-Security') !== false) $scrapeResult['security']['headers']['HSTS'] = true;
    if (stripos($headers, 'X-Frame-Options') !== false) $scrapeResult['security']['headers']['X-Frame-Options'] = true;
    if (stripos($headers, 'X-Content-Type-Options') !== false) $scrapeResult['security']['headers']['X-Content-Type-Options'] = true;
    if (stripos($headers, 'Referrer-Policy') !== false) $scrapeResult['security']['headers']['Referrer-Policy'] = true;
    if (stripos($headers, 'Content-Security-Policy') !== false) $scrapeResult['security']['headers']['CSP'] = true;
}

// --- DEEP CONTENT ANALYSIS (DOM) & SEO REFINEMENT ---
$contentData = [
    'images_count' => 0,
    'images_no_alt' => 0,
    'h1_count' => 0,
    'h2_count' => 0,
    'h3_count' => 0,
    'text_ratio' => 0,
    'word_count' => 0
];

if (!empty($html)) {
    $dom = new DOMDocument();
    libxml_use_internal_errors(true);
    // Load HTML (utf-8 hack)
    $dom->loadHTML(mb_convert_encoding($html, 'HTML-ENTITIES', 'UTF-8'), LIBXML_NOERROR | LIBXML_NOWARNING);
    libxml_clear_errors();

    // --- REFINED SEO EXTRACTION (DOM based) ---
    // 1. Title
    $titles = $dom->getElementsByTagName('title');
    if ($titles->length > 0) {
        $scrapeResult['seo']['title'] = trim($titles->item(0)->textContent);
    }
    
    // 2. H1 (Fixes concatenation bug by using textContent)
    $h1s = $dom->getElementsByTagName('h1');
    $contentData['h1_count'] = $h1s->length;
    if ($h1s->length > 0) {
        $rawH1 = $h1s->item(0)->textContent;
        // Normalize whitespace (tabs, newlines -> space)
        $scrapeResult['seo']['h1'] = trim(preg_replace('/\s+/', ' ', $rawH1));
    }

    // 3. Description
    $metas = $dom->getElementsByTagName('meta');
    foreach ($metas as $meta) {
        if (strtolower($meta->getAttribute('name')) === 'description') {
            $scrapeResult['seo']['description'] = trim($meta->getAttribute('content'));
        }
    }

    // --- MARKETING STACK (DOM + Regex Refined) ---
    $scripts = $dom->getElementsByTagName('script');
    foreach ($scripts as $script) {
        $src = $script->getAttribute('src');
        $content = $script->textContent;
        
        // GTM
        if (stripos($src, 'googletagmanager.com/gtm.js') !== false || stripos($content, 'googletagmanager.com/gtm.js') !== false || stripos($content, 'GTM-') !== false) {
            $scrapeResult['tech']['gtm'] = true;
        }
        // Analytics
        if (stripos($src, 'google-analytics.com') !== false || stripos($src, 'gtag') !== false || stripos($content, 'gtag(') !== false || preg_match('/UA-[0-9]+-[0-9]/', $content) || preg_match('/G-[A-Z0-9]+/', $content)) {
            $scrapeResult['tech']['analytics'] = true;
        }
        // Pixel
        if (stripos($src, 'fbevents.js') !== false || stripos($content, 'fbq(') !== false || stripos($content, '_fbq') !== false || stripos($src, 'connect.facebook.net') !== false) {
            $scrapeResult['tech']['pixel'] = true;
        }
    }


    // 1. Image Audit
    $images = $dom->getElementsByTagName('img');
    $contentData['images_count'] = $images->length;
    $contentData['details'] = ['images_missing_alt' => [], 'headings' => []];

    foreach ($images as $img) {
        $alt = $img->getAttribute('alt');
        if (empty(trim($alt))) {
            $contentData['images_no_alt']++;
            if (count($contentData['details']['images_missing_alt']) < 10) {
                $src = $img->getAttribute('src');
                if ($src) $contentData['details']['images_missing_alt'][] = $src;
            }
        }
    }

    // 2. Heading Structure (H2, H3)
    $contentData['h2_count'] = $dom->getElementsByTagName('h2')->length;
    $contentData['h3_count'] = $dom->getElementsByTagName('h3')->length;
    
    // Capture Heading Tree (H1-H3 in order)
    $xpath = new DOMXPath($dom);
    $headings = $xpath->query('//h1|//h2|//h3');
    foreach ($headings as $node) {
        if (count($contentData['details']['headings']) < 30) {
            $contentData['details']['headings'][] = [
                'tag' => strtolower($node->nodeName),
                'text' => trim(preg_replace('/\s+/', ' ', $node->textContent))
            ];
        }
    }

    // 3. Content Density
    $xpath = new DOMXPath($dom);
    // Remove scripts and styles for text calculation
    foreach ($xpath->query('//script|//style|//noscript') as $node) { $node->parentNode->removeChild($node); }
    $textContent = $dom->textContent;
    $textContent = preg_replace('/\s+/', ' ', $textContent); // Normalize whitespace
    $textLen = strlen($textContent);
    $htmlLen = strlen($html);
    $contentData['word_count'] = str_word_count($textContent);
    $contentData['text_ratio'] = $htmlLen > 0 ? round(($textLen / $htmlLen) * 100) : 0;
}

// --- PROCESS PERFORMANCE ---
$perfData = [
    'metrics' => ['lcp' => 3.0, 'cls' => 0],
    'scores' => ['performance' => 0, 'accessibility' => 0, 'seo' => 0, 'best_practices' => 0],
    'audits' => ['optimized_images' => 1, 'viewport' => 1, 'meta_description' => 1],
    'screenshot' => null,
    'source' => 'None'
];

if ($info['crux']['http_code'] === 200) {
    $cData = json_decode($responses['crux'], true);
    $perfData['metrics']['lcp'] = ($cData['record']['metrics']['largest_contentful_paint']['percentiles']['p75'] ?? 2500) / 1000;
    $perfData['metrics']['cls'] = $cData['record']['metrics']['cumulative_layout_shift']['percentiles']['p75'] ?? 0;
    $perfData['source'] = 'CrUX History';
}

if ($info['psi']['http_code'] === 200) {
    $pData = json_decode($responses['psi'], true);
    $lh = $pData['lighthouseResult'] ?? [];
    $audits = $lh['audits'] ?? [];
    $cats = $lh['categories'] ?? [];
    
    if ($perfData['source'] === 'None') {
        $perfData['metrics']['lcp'] = ($audits['largest-contentful-paint']['numericValue'] ?? 2500) / 1000;
        $perfData['metrics']['cls'] = $audits['cumulative-layout-shift']['numericValue'] ?? 0;
        $perfData['source'] = 'PageSpeed Insights';
    } else {
        $perfData['source'] = 'CrUX + PSI';
    }

    $perfData['scores']['performance'] = ($cats['performance']['score'] ?? 0) * 100;
    $perfData['scores']['accessibility'] = ($cats['accessibility']['score'] ?? 0) * 100;
    $perfData['scores']['seo'] = ($cats['seo']['score'] ?? 0) * 100;
    $perfData['scores']['best_practices'] = ($cats['best-practices']['score'] ?? 0) * 100;
    
    $perfData['audits']['optimized_images'] = $audits['uses-optimized-images']['score'] ?? 1;
    $perfData['audits']['viewport'] = $audits['viewport']['score'] ?? 0;
    $perfData['audits']['meta_description'] = $audits['meta-description']['score'] ?? 0;
    $perfData['screenshot'] = $audits['final-screenshot']['details']['data'] ?? null;
    
    // Extract Opportunities
    $opportunities = [];
    foreach ($audits as $key => $audit) {
        if (isset($audit['details']['type']) && $audit['details']['type'] === 'opportunity' && ($audit['score'] ?? 1) < 0.9) {
             $opportunities[] = [
                 'id' => $key,
                 'title' => $audit['title'],
                 'savings' => $audit['details']['overallSavingsMs'] ?? 0
             ];
        }
    }
    usort($opportunities, function($a, $b) { return $b['savings'] <=> $a['savings']; });
    $perfData['opportunities'] = array_slice($opportunities, 0, 5);
}

// --- PROCESS PLACES ---
$placesData = ['rating' => 0, 'reviews' => 0, 'photos_count' => 0, 'city' => null];
if ($chPlaces && $info['places']['http_code'] === 200) {
    $plData = json_decode($responses['places'], true);
    $placesData['rating'] = $plData['rating'] ?? 0;
    $placesData['reviews'] = $plData['userRatingCount'] ?? 0;
    $placesData['photos_count'] = isset($plData['photos']) ? count($plData['photos']) : 0;
    
    // Extract City
    if (isset($plData['addressComponents'])) {
        foreach ($plData['addressComponents'] as $comp) {
            if (in_array('locality', $comp['types'])) {
                $placesData['city'] = $comp['longText'];
                break;
            }
        }
    }
}

// --- LOCAL SEO CHECK ---
$localSeo = ['city' => $placesData['city'], 'in_title' => false, 'in_h1' => false, 'in_content' => false];
if ($placesData['city'] && !empty($html)) {
    $city = mb_strtolower($placesData['city'], 'UTF-8');
    // Simple check - in future we can use stemming/declension support (odmiana przez przypadki)
    // For now, strict match or partial match logic could be better, but let's stick to stripos
    
    if (isset($scrapeResult['seo']['title']) && mb_stripos($scrapeResult['seo']['title'], $city) !== false) $localSeo['in_title'] = true;
    if (isset($scrapeResult['seo']['h1']) && mb_stripos($scrapeResult['seo']['h1'], $city) !== false) $localSeo['in_h1'] = true;
    
    // Check in content (strip tags first)
    $cleanText = strip_tags($html);
    if (mb_stripos($cleanText, $city) !== false) $localSeo['in_content'] = true;
}
$scrapeResult['seo']['local'] = $localSeo;

// Scoring & Errors
$totalScore = 100;
$lcp = $perfData['metrics']['lcp'];
$tech = $scrapeResult['tech'];
$rating = $placesData['rating'];
$reviews = $placesData['reviews'];

$errors = [];
if ($placesData['city'] && !$localSeo['in_content']) {
    // If we know the city but it's not in content -> Local SEO error
    $errors['NO_CITY_KEYWORD'] = true;
    $totalScore -= 5;
}
if (!$tech['pixel']) { $errors['NO_PIXEL'] = true; $totalScore -= 10; }
if (!$tech['analytics']) { $errors['NO_ANALYTICS'] = true; $totalScore -= 10; }
if (!$tech['ssl']) { $errors['NO_SSL'] = true; $totalScore -= 10; }
if ($lcp > 4.0) { $errors['SLOW_LCP'] = true; $totalScore -= 15; }
elseif ($lcp > 2.5) { $errors['MED_LCP'] = true; $totalScore -= 5; }
if ($perfData['audits']['viewport'] < 1) { $errors['NO_MOBILE'] = true; $totalScore -= 15; }
if ($reviews < 5) { $errors['GHOST_FIRM'] = true; $totalScore -= 5; }
if (empty($scrapeResult['social'])) { $errors['NO_SOCIAL'] = true; $totalScore -= 5; }
if (!$scrapeResult['social']['og_tags']) { $errors['NO_OG'] = true; $totalScore -= 5; }
if (!$scrapeResult['tech']['schema_org']) { $errors['NO_SCHEMA'] = true; $totalScore -= 5; }
if (!$scrapeResult['tech']['favicon']) { $errors['NO_FAVICON'] = true; $totalScore -= 2; }
if ($perfData['scores']['accessibility'] < 70) { $errors['BAD_A11Y'] = true; $totalScore -= 5; }

// Content Errors
if ($contentData['images_count'] > 0 && ($contentData['images_no_alt'] / $contentData['images_count'] > 0.1)) {
    // If more than 10% of images miss ALT
    $errors['NO_ALTS'] = true; 
    $totalScore -= 5; 
}
if ($contentData['h1_count'] !== 1) { 
    $errors['BAD_H1'] = true; 
    $totalScore -= 5; 
}
if ($contentData['word_count'] < 200) { 
    $errors['THIN_CONTENT'] = true; 
    $totalScore -= 5; 
}

$output = [
    'client' => [
        'url' => $url,
        'total_score' => max(0, $totalScore),
        'metrics' => [
            'lcp_value' => round($lcp, 2), 
            'cls_value' => $perfData['metrics']['cls'],
            'scores' => $perfData['scores'],
            'opportunities' => $perfData['opportunities'] ?? []
        ],
        'tech' => $tech,
        'seo' => $scrapeResult['seo'],
        'content' => $contentData,
        'social' => $scrapeResult['social'],
        'security' => $scrapeResult['security'],
        'reputation' => ['rating' => $rating, 'reviews_count' => $reviews, 'score' => 0],
        'audit_results' => $errors,
        'screenshot' => $perfData['screenshot']
    ],
    'meta' => ['engine' => 'Audit 360 v5.1-parallel', 'source' => $perfData['source'], 'timestamp' => time()]
];

$cache->set($cacheKey, $output);
echo json_encode(['status' => 'success', 'data' => $output]);
?>
