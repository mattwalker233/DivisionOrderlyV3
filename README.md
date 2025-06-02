# Division Orderly

A modern division order management system built with Next.js.

## Features

- State-specific division order processing
- Dashboard with filtering capabilities
- Excel export functionality
- AWS Textract integration for document processing
- Modern UI with Tailwind CSS

## Prerequisites

- Node.js 18.x or later
- AWS account with Textract access
- Vercel account (for deployment)

## Local Development

1. Clone the repository:
```bash
git clone https://github.com/yourusername/division-orderly.git
cd division-orderly
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file with the following variables:
```
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=your_aws_region
```

4. Run the development server:
```bash
npm run dev
```

## Deployment to Vercel

1. Push your code to GitHub
2. Connect your GitHub repository to Vercel
3. Add the following environment variables in Vercel:
   - AWS_ACCESS_KEY_ID
   - AWS_SECRET_ACCESS_KEY
   - AWS_REGION
4. Deploy!

## Environment Variables

- `AWS_ACCESS_KEY_ID`: AWS access key for Textract
- `AWS_SECRET_ACCESS_KEY`: AWS secret key for Textract
- `AWS_REGION`: AWS region (e.g., us-east-1)

## Tech Stack

- Next.js 14
- TypeScript
- Tailwind CSS
- AWS Textract
- shadcn/ui components
- XLSX for Excel export

## License

MIT 