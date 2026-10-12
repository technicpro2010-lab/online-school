# DigitalOcean Deployment Guide

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
