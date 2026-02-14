# Siemka Design Tool

An interactive web application for creating custom t-shirt and hoodie designs.

## Features

- Product selection (t-shirts and hoodies)
- Color variants
- Logo upload with drag & drop
- Design customization (size and opacity)
- Real-time preview
- Order submission

## Tech Stack

- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- EmailJS for email notifications
- HTML2Canvas for design preview generation

## Development Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a `.env` file with the following variables:

   ```
   EMAILJS_SERVICE_ID=your_service_id
   EMAILJS_TEMPLATE_ID=your_template_id
   EMAILJS_PUBLIC_KEY=your_public_key

   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

## Deployment

The application is configured for deployment on Netlify:

1. Connect your GitHub repository to Netlify
2. Configure environment variables in Netlify dashboard
3. Set up custom domain (app.siemka.lt)
4. Enable SSL certificate

## Future Features

- 3D product preview
- Additional product types
- Shopping cart integration
- Multiple language support
- Advanced design tools
