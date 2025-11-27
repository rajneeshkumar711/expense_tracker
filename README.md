# Expense Tracker - Full Stack Application

## Demo Credentials

### Admin User
- Email: `admin@company.com`
- Password: `password123`

### Employee Users
- Email: `jane@company.com` or `john@company.com`
- Password: `password123`


## Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL (v14 or higher)
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file:
```bash
cp .env.example .env
```

4. Update the `.env` file with your PostgreSQL credentials:
```
DATABASE_URL="postgresql://username:password@localhost:5432/expense_tracker?schema=public"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
PORT=5000
NODE_ENV=development
```

5. Run Prisma migrations:
```bash
npm run prisma:migrate
```

6. Generate Prisma client:
```bash
npm run prisma:generate
```

7. Seed the database:
```bash
npm run prisma:seed
```

8. Start the development server:
```bash
npm run dev
```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file:
```bash
cp .env.example .env
```

4. Update the `.env` file:
```
REACT_APP_API_URL=http://localhost:5000/api
```

5. Start the development server:
```bash
npm start
```

The frontend will run on `http://localhost:3000`

## Testing

### Backend Tests
```bash
cd backend
npm test
```

### Frontend Tests
```bash
cd frontend
npm test
```

## Deployment

### Backend Deployment (Example: Heroku/Railway)

1. Build the application:
```bash
npm run build
```

2. Set environment variables on your hosting platform

3. Run migrations:
```bash
npm run prisma:migrate
```

4. Start the server:
```bash
npm start
```

### Frontend Deployment (Example: Vercel/Netlify)

1. Build the application:
```bash
npm run build
```

2. Deploy the `build` folder to your hosting platform

3. Set environment variables:
   - `REACT_APP_API_URL` - Your backend API URL
