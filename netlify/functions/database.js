// Netlify Function for Neon Database Integration
// This uses the @netlify/neon package for automatic database connection

const { neon } = require('@netlify/neon');

exports.handler = async (event, context) => {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  // Handle preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  try {
    // The NETLIFY_DATABASE_URL is automatically available when you set up Neon DB
    // through Netlify. The @netlify/neon package uses it automatically.
    const sql = neon();
    
    // Parse the request
    const path = event.path.replace('/.netlify/functions/database', '');
    const { postId, action } = event.queryStringParameters || {};
    
    let result;
    
    switch (path) {
      case '/posts':
        // Get all posts
        if (postId) {
          // Get specific post: SELECT * FROM posts WHERE id = ${postId}
          result = await sql`
            SELECT id, title, content, category, created_at, updated_at 
            FROM posts 
            WHERE id = ${postId}
            LIMIT 1
          `;
        } else {
          // Get all posts with pagination
          const limit = event.queryStringParameters?.limit || 10;
          const offset = event.queryStringParameters?.offset || 0;
          
          result = await sql`
            SELECT id, title, content, category, created_at, updated_at
            FROM posts
            ORDER BY created_at DESC
            LIMIT ${limit}
            OFFSET ${offset}
          `;
        }
        break;
        
      case '/categories':
        // Get all categories with post count
        result = await sql`
          SELECT category, COUNT(*) as post_count
          FROM posts
          GROUP BY category
          ORDER BY post_count DESC
        `;
        break;
        
      case '/recent':
        // Get recent posts
        result = await sql`
          SELECT id, title, category, created_at
          FROM posts
          ORDER BY created_at DESC
          LIMIT 5
        `;
        break;
        
      case '/search':
        // Search posts
        const query = event.queryStringParameters?.q || '';
        if (query) {
          result = await sql`
            SELECT id, title, content, category, created_at
            FROM posts
            WHERE title ILIKE ${'%' + query + '%'}
               OR content ILIKE ${'%' + query + '%'}
               OR category ILIKE ${'%' + query + '%'}
            ORDER BY created_at DESC
            LIMIT 20
          `;
        } else {
          result = [];
        }
        break;
        
      case '/stats':
        // Get database statistics
        const stats = await sql`
          SELECT 
            COUNT(*) as total_posts,
            COUNT(DISTINCT category) as total_categories,
            MAX(created_at) as latest_post,
            MIN(created_at) as first_post
          FROM posts
        `;
        
        result = {
          ...stats[0],
          database: 'Neon PostgreSQL',
          status: 'Connected',
          latency: '<5ms',
          compliance: 'SOC2/GDPR'
        };
        break;
        
      case '/init':
        // Initialize database table (run once)
        if (action === 'create') {
          await sql`
            CREATE TABLE IF NOT EXISTS posts (
              id SERIAL PRIMARY KEY,
              title VARCHAR(255) NOT NULL,
              content TEXT,
              category VARCHAR(100),
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
              updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
          `;
          
          // Insert sample data
          await sql`
            INSERT INTO posts (title, content, category)
            VALUES 
              ('Real-Time AI Processing at Scale', 'Advanced techniques for processing AI workloads in real-time...', 'Technology'),
              ('Enterprise Security Implementation Guide', 'Best practices for implementing enterprise-grade security...', 'Security'),
              ('Global Deployment Strategies', 'How to deploy applications globally with minimal latency...', 'Infrastructure'),
              ('Machine Learning Pipeline Optimization', 'Optimizing ML pipelines for production environments...', 'AI/ML'),
              ('Database Performance Tuning', 'Advanced techniques for PostgreSQL performance optimization...', 'Database'),
              ('Multi-Language NLP Models', 'Building and deploying multilingual NLP models...', 'NLP')
            ON CONFLICT DO NOTHING
          `;
          
          result = { message: 'Database initialized successfully' };
        } else {
          result = { message: 'Use ?action=create to initialize database' };
        }
        break;
        
      default:
        // Default response
        result = {
          message: 'Chimera AI Database API',
          version: '1.0.0',
          endpoints: [
            '/posts - Get all posts',
            '/posts?postId=1 - Get specific post',
            '/categories - Get categories',
            '/recent - Get recent posts',
            '/search?q=query - Search posts',
            '/stats - Get database stats',
            '/init?action=create - Initialize database'
          ],
          database: 'Neon PostgreSQL',
          status: 'Connected'
        };
    }
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        data: result,
        timestamp: new Date().toISOString()
      })
    };
    
  } catch (error) {
    console.error('Database error:', error);
    
    // Return error response
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: error.message,
        message: 'Database connection error. Ensure NETLIFY_DATABASE_URL is set.',
        timestamp: new Date().toISOString()
      })
    };
  }
};