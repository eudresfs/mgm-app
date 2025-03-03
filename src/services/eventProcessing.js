/**
 * Event Processing Service
 * Handles asynchronous processing of tracking and conversion events
 */

const { KafkaClient, Producer, Consumer } = require('kafka-node');
const logger = require('../utils/logger');
const redis = require('../utils/redis');

// Kafka client and producer instances
let kafkaClient;
let producer;

/**
 * Setup Kafka connection and producer
 */
async function setupKafka() {
  try {
    // Initialize Kafka client
    const kafkaHost = process.env.KAFKA_HOST || 'localhost:9092';
    kafkaClient = new KafkaClient({ kafkaHost });
    
    // Create producer
    producer = new Producer(kafkaClient);
    
    // Wait for producer to be ready
    await new Promise((resolve, reject) => {
      producer.on('ready', resolve);
      producer.on('error', reject);
    });
    
    logger.info('Kafka producer ready');
    
    // Setup consumers for different event types
    setupEventConsumers();
    
    return true;
  } catch (error) {
    logger.error('Failed to setup Kafka:', error);
    throw error;
  }
}

/**
 * Publish an event to Kafka
 * @param {string} topic - The event topic
 * @param {Object} data - The event data
 */
async function publishEvent(topic, data) {
  try {
    if (!producer) {
      throw new Error('Kafka producer not initialized');
    }
    
    const payload = [
      {
        topic,
        messages: JSON.stringify(data),
        partition: 0
      }
    ];
    
    return new Promise((resolve, reject) => {
      producer.send(payload, (err, data) => {
        if (err) {
          logger.error(`Error publishing to ${topic}:`, err);
          return reject(err);
        }
        
        logger.debug(`Published to ${topic}:`, { eventId: data });
        resolve(data);
      });
    });
  } catch (error) {
    logger.error(`Error in publishEvent to ${topic}:`, error);
    
    // Fallback: store in Redis for retry
    await redis.lpush(
      'events:failed', 
      JSON.stringify({ topic, data, timestamp: new Date() })
    );
    
    throw error;
  }
}

/**
 * Setup consumers for different event types
 */
function setupEventConsumers() {
  // Click event consumer
  setupConsumer('tracking.click', handleClickEvent);
  
  // Conversion event consumer
  setupConsumer('tracking.conversion', handleConversionEvent);
}

/**
 * Setup a Kafka consumer for a specific topic
 * @param {string} topic - The topic to consume
 * @param {Function} handler - The event handler function
 */
function setupConsumer(topic, handler) {
  try {
    const consumer = new Consumer(
      kafkaClient,
      [{ topic, partition: 0 }],
      {
        autoCommit: true,
        fetchMaxWaitMs: 1000,
        fetchMaxBytes: 1024 * 1024
      }
    );
    
    consumer.on('message', async (message) => {
      try {
        const data = JSON.parse(message.value);
        await handler(data);
      } catch (error) {
        logger.error(`Error processing ${topic} event:`, error);
        
        // Store failed events for retry
        await redis.lpush(
          'events:failed:processing', 
          JSON.stringify({ topic, data: message.value, timestamp: new Date() })
        );
      }
    });
    
    consumer.on('error', (err) => {
      logger.error(`Error in ${topic} consumer:`, err);
    });
    
    logger.info(`Consumer for ${topic} setup successfully`);
  } catch (error) {
    logger.error(`Failed to setup consumer for ${topic}:`, error);
  }
}

/**
 * Handle click event processing
 * @param {Object} data - The click event data
 */
async function handleClickEvent(data) {
  try {
    // Process click data (store in database, update metrics, etc.)
    logger.debug('Processing click event:', { trackingId: data.trackingId });
    
    // Update click metrics in Redis for real-time dashboards
    await Promise.all([
      // Increment total clicks for campaign
      redis.hincrby(`metrics:campaign:${data.campaignId}`, 'clicks', 1),
      
      // Increment total clicks for affiliate
      redis.hincrby(`metrics:affiliate:${data.affiliateId}`, 'clicks', 1),
      
      // Add to time-series data for analytics
      redis.zadd(
        `timeseries:clicks:${data.campaignId}`, 
        new Date(data.timestamp).getTime(), 
        JSON.stringify({ trackingId: data.trackingId, timestamp: data.timestamp })
      )
    ]);
    
    // Additional processing can be added here
    // - Fraud detection
    // - Geographic analysis
    // - Device categorization
    
  } catch (error) {
    logger.error('Error handling click event:', error);
    throw error;
  }
}

/**
 * Handle conversion event processing
 * @param {Object} data - The conversion event data
 */
async function handleConversionEvent(data) {
  try {
    logger.debug('Processing conversion event:', { conversionId: data.conversionId });
    
    // If we have attribution data, process the conversion
    if (data.attribution) {
      // Update conversion metrics
      await Promise.all([
        // Increment conversions for campaign
        redis.hincrby(`metrics:campaign:${data.attribution.campaignId}`, 'conversions', 1),
        
        // Increment conversions for affiliate
        redis.hincrby(`metrics:affiliate:${data.attribution.affiliateId}`, 'conversions', 1),
        
        // Add revenue amount
        redis.hincrbyfloat(
          `metrics:campaign:${data.attribution.campaignId}`, 
          'revenue', 
          parseFloat(data.amount || 0)
        ),
        
        redis.hincrbyfloat(
          `metrics:affiliate:${data.attribution.affiliateId}`, 
          'revenue', 
          parseFloat(data.amount || 0)
        ),
        
        // Add to time-series data
        redis.zadd(
          `timeseries:conversions:${data.attribution.campaignId}`, 
          new Date(data.timestamp).getTime(), 
          JSON.stringify({
            conversionId: data.conversionId,
            amount: data.amount,
            timestamp: data.timestamp
          })
        )
      ]);
      
      // Calculate commission based on campaign rules
      // This would typically involve looking up the campaign's commission structure
      // and calculating the appropriate amount
      
      // For now, we'll use a simple percentage-based commission
      const commissionRate = 0.1; // 10% commission
      const commissionAmount = parseFloat(data.amount || 0) * commissionRate;
      
      // Store the commission for later processing
      await redis.lpush(
        'commissions:pending', 
        JSON.stringify({
          affiliateId: data.attribution.affiliateId,
          campaignId: data.attribution.campaignId,
          conversionId: data.conversionId,
          orderId: data.orderId,
          amount: data.amount,
          commissionAmount,
          status: 'pending',
          timestamp: data.timestamp
        })
      );
    } else {
      // No attribution - log for analysis
      logger.info('Conversion without attribution:', { conversionId: data.conversionId });
      
      // Store for manual review if needed
      await redis.lpush(
        'conversions:unattributed', 
        JSON.stringify(data)
      );
    }
    
  } catch (error) {
    logger.error('Error handling conversion event:', error);
    throw error;
  }
}

/**
 * Process failed events that were stored in Redis
 */
async function processFailedEvents() {
  try {
    // Get all failed events
    const failedEvents = await redis.lrange('events:failed', 0, -1);
    
    if (failedEvents.length === 0) {
      return;
    }
    
    logger.info(`Processing ${failedEvents.length} failed events`);
    
    // Process each failed event
    for (const eventStr of failedEvents) {
      try {
        const event = JSON.parse(eventStr);
        await publishEvent(event.topic, event.data);
        
        // Remove from failed events list
        await redis.lrem('events:failed', 1, eventStr);
      } catch (error) {
        logger.error('Error reprocessing failed event:', error);
      }
    }
  } catch (error) {
    logger.error('Error in processFailedEvents:', error);
  }
}

module.exports = {
  setupKafka,
  publishEvent,
  processFailedEvents
};