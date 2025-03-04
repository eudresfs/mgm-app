import http from 'k6/http';
import { sleep, check } from 'k6';
import { Counter, Rate, Trend } from 'k6/metrics';

// Custom metrics
const clickErrors = new Counter('click_errors');
const conversionErrors = new Counter('conversion_errors');
const clickLatency = new Trend('click_latency');
const conversionLatency = new Trend('conversion_latency');
const successRate = new Rate('success_rate');

// Test configuration
export const options = {
  scenarios: {
    // Scenario 1: Constant load of 1000 clicks per minute
    constant_load: {
      executor: 'constant-arrival-rate',
      rate: 1000 / 60, // 1000 requests per minute = ~16.67 per second
      timeUnit: '1s',
      duration: '5m',
      preAllocatedVUs: 50,
      maxVUs: 100,
    },
    // Scenario 2: Spike test with 5000 clicks per minute for a short period
    spike_test: {
      executor: 'ramping-arrival-rate',
      startRate: 10,
      timeUnit: '1s',
      preAllocatedVUs: 50,
      maxVUs: 500,
      stages: [
        { duration: '1m', target: 10 }, // Warm up
        { duration: '1m', target: 80 }, // Ramp up to ~5000/minute
        { duration: '30s', target: 80 }, // Stay at peak
        { duration: '1m', target: 10 }, // Ramp down
        { duration: '30s', target: 0 }, // Cool down
      ],
    },
  },
  thresholds: {
    // Performance thresholds
    'click_latency': ['p95<300'], // 95% of requests should be under 300ms
    'conversion_latency': ['p95<500'], // 95% of conversion requests under 500ms
    'success_rate': ['rate>0.95'], // 95% success rate
    'http_req_failed': ['rate<0.05'], // Less than 5% of requests should fail
  },
};

// Shared test data
const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';
const TEST_CAMPAIGN_ID = __ENV.CAMPAIGN_ID || '60f1a5c5e6b3f32b4c9a1234'; // Replace with actual test campaign ID
const TEST_AFFILIATE_ID = __ENV.AFFILIATE_ID || '60f1a5c5e6b3f32b4c9a5678'; // Replace with actual test affiliate ID

// Helper function to generate random data
function generateRandomData() {
  const randomId = Math.floor(Math.random() * 1000000);
  return {
    orderId: `test-order-${randomId}`,
    amount: Math.floor(Math.random() * 500) + 50, // Random amount between 50 and 550
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    ip: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
  };
}

// Main test function
export default function() {
  const randomData = generateRandomData();
  
  // Step 1: Simulate a click
  const clickStartTime = new Date().getTime();
  const clickResponse = http.get(
    `${BASE_URL}/api/tracking/click?campaignId=${TEST_CAMPAIGN_ID}&affiliateId=${TEST_AFFILIATE_ID}`,
    {
      headers: {
        'User-Agent': randomData.userAgent,
        'X-Forwarded-For': randomData.ip,
      },
    }
  );
  const clickEndTime = new Date().getTime();
  
  // Record metrics for click request
  clickLatency.add(clickEndTime - clickStartTime);
  
  // Check if click was successful
  const clickSuccess = check(clickResponse, {
    'click status is 302 (redirect)': (r) => r.status === 302,
    'click response has location header': (r) => r.headers.hasOwnProperty('Location'),
  });
  
  if (!clickSuccess) {
    clickErrors.add(1);
    console.log(`Click error: ${clickResponse.status} ${clickResponse.body}`);
    successRate.add(0);
    return;
  }
  
  successRate.add(1);
  
  // Extract click ID from redirect URL
  const clickId = clickResponse.headers.Location.split('clickId=')[1];
  
  // Step 2: Simulate a conversion (for a subset of clicks)
  if (Math.random() < 0.2) { // Only 20% of clicks lead to conversion
    // Wait a random time between 5-30 seconds to simulate user browsing
    sleep(Math.random() * 25 + 5);
    
    const conversionStartTime = new Date().getTime();
    const conversionResponse = http.post(
      `${BASE_URL}/api/tracking/conversion`,
      JSON.stringify({
        clickId: clickId,
        orderId: randomData.orderId,
        amount: randomData.amount,
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': randomData.userAgent,
          'X-Forwarded-For': randomData.ip,
        },
      }
    );
    const conversionEndTime = new Date().getTime();
    
    // Record metrics for conversion request
    conversionLatency.add(conversionEndTime - conversionStartTime);
    
    // Check if conversion was successful
    const conversionSuccess = check(conversionResponse, {
      'conversion status is 200': (r) => r.status === 200,
      'conversion response has attribution data': (r) => {
        const body = JSON.parse(r.body);
        return body.hasOwnProperty('attributed');
      },
    });
    
    if (!conversionSuccess) {
      conversionErrors.add(1);
      console.log(`Conversion error: ${conversionResponse.status} ${conversionResponse.body}`);
      successRate.add(0);
    } else {
      successRate.add(1);
    }
  }
  
  // Add some randomized sleep between requests to simulate real traffic patterns
  sleep(Math.random() * 3);
}

// Handle test completion
export function handleSummary(data) {
  return {
    'stdout': JSON.stringify({
      metrics: {
        click_latency_p95: data.metrics.click_latency.values['p(95)'],
        conversion_latency_p95: data.metrics.conversion_latency.values['p(95)'],
        success_rate: data.metrics.success_rate.values.rate,
        total_requests: data.metrics.http_reqs.values.count,
        failed_requests: data.metrics.http_req_failed.values.count,
        click_errors: data.metrics.click_errors.values.count,
        conversion_errors: data.metrics.conversion_errors.values.count,
      },
      thresholds_passed: data.metrics.checks.values.rate >= 0.95,
    }),
    'performance/tracking-load-summary.json': JSON.stringify(data),
  };
}