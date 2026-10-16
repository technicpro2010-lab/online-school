# Deployment Guide

## Render backend with Neon

The Laravel backend is in `backend/OnlineLibary`. Configure the Render service to
use that directory as its root directory and deploy it with the included Dockerfile.
The container runs `php artisan migrate --force` before Apache starts, so the
configured PostgreSQL database must be reachable from Render during startup.

In the Render dashboard, open the backend web service's **Environment** settings
and set:

- `APP_ENV=production`
- `APP_DEBUG=false`
- `APP_KEY` (a generated Laravel application key)
- `DB_CONNECTION=pgsql`
- `DATABASE_URL` (the PostgreSQL connection string)

Use the database's internal connection URL when the database is hosted on Render.
For Neon, use its connection string with `sslmode=require`. Do not set `DB_HOST` to
`127.0.0.1` or `localhost`: that points back to the web-service container, not to
the database. Save the variables and redeploy the backend.

Keep the teacher account in the Neon database. Accounts stored in a local or other
database are not copied to Neon automatically.

For the Vercel frontend, set `VITE_API_URL` to the public Render service URL
(without `/api`), then redeploy the frontend.

## Prerequisites
- DigitalOcean account
- Docker installed locally
- Git installed

## Deployment Steps

### 1. Create a DigitalOcean App Platform Project
- Go to DigitalOcean console
- Click "Create" → "Apps"
- Select your GitHub repository (technicpro2010-lab/online-school)
- Choose the main branch

### 2. Configure the App
- Set the build command: `npm install`
- Set the run command: `npm start`
- Configure environment variables in DigitalOcean console

### 3. Environment Variables
Create a `.env` file based on `.env.example`:
```
NODE_ENV=production
PORT=3000
DATABASE_URL=your_production_db_url
API_KEY=your_production_api_key
```

### 4. Deploy
- DigitalOcean will automatically build and deploy on every push to main branch
- Monitor deployment progress in the DigitalOcean console

### 5. Custom Domain (Optional)
- Go to App Settings → Domains
- Add your custom domain
- Update DNS records at your domain provider

## Local Testing with Docker

```bash
# Build the Docker image
docker build -t online-school .

# Run the container
docker run -p 3000:3000 online-school

# Or use docker-compose
docker-compose up
```

## Troubleshooting

- Check logs: View in DigitalOcean App Platform dashboard
- Restart app: Use DigitalOcean console
- Update dependencies: Push changes to main branch

## Resources
- [DigitalOcean App Platform Docs](https://docs.digitalocean.com/products/app-platform/)
- [Docker Docs](https://docs.docker.com/)
