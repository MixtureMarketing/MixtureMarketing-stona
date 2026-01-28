module.exports = {
  ci: {
    collect: {
      staticDistDir: './dist',
      url: [
        '/',
        '/offers/',
        '/audyt-360/',
        '/web-development/ecommerce/',
        '/branza/medycyna',
        '/miasto/warszawa',
        '/baza-wiedzy/core-web-vitals-2025'
      ],
      numberOfRuns: 3,
    },
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 0.95 }],
        'categories:best-practices': ['error', { minScore: 0.95 }],
        'categories:seo': ['error', { minScore: 1.0 }],
        'resource-summary:mainthread-work-breakdown:count': ['warn', { maxNumericValue: 20 }],
        'largest-contentful-paint': ['error', { maxNumericValue: 2500 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
        'total-blocking-time': ['error', { maxNumericValue: 300 }],
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
};
