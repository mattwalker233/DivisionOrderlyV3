# Division Orderly Deployment Guide

## Prerequisites

- Node.js 18.17 or later
- NPM or another package manager
- Access to company server with appropriate permissions
- Anthropic API key for Claude AI integration

## Environment Setup

1. Create a `.env.local` file in the root directory with the following variables:
```env
ANTHROPIC_API_KEY=your_api_key_here
NEXT_PUBLIC_API_URL=https://your-server-url.com
```

2. Install dependencies:
```bash
npm install
```

3. Build the application:
```bash
npm run build
```

## Production Deployment

1. Transfer the following files/directories to your server:
   - `.next/` (production build)
   - `public/` (static assets)
   - `package.json`
   - `package-lock.json`
   - `.env.local` (with production values)

2. On the server, install production dependencies:
```bash
npm install --production
```

3. Start the production server:
```bash
npm run start
```

The application will start on port 3005 by default. You can modify this in the `package.json` scripts.

## Server Configuration

### Using PM2 (Recommended)

To keep the application running:

1. Install PM2:
```bash
npm install -g pm2
```

2. Start the application:
```bash
pm2 start npm --name "division-orderly" -- start
```

3. Configure PM2 to start on system boot:
```bash
pm2 startup
pm2 save
```

### Using Nginx as Reverse Proxy

Add this to your Nginx configuration:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3005;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Testing

After deployment:

1. Visit the application URL
2. Test the login system
3. Upload a test division order
4. Verify Claude AI processing works
5. Check dashboard functionality
6. Verify data persistence

## Monitoring

Monitor the application using:
- PM2 monitoring: `pm2 monit`
- Server logs: `pm2 logs division-orderly`
- Application logs in `.next/logs/`

## Backup

Regularly backup:
- Database (if applicable)
- Uploaded documents
- Environment configuration
- Application logs

## Support

For technical support or deployment issues, contact:
[Your contact information] 