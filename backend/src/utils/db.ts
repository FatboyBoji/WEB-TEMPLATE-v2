import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

// Load environment variables based on NODE_ENV
const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env.development';
dotenv.config({ path: envFile });

// Create a singleton Prisma client instance
export const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

// Log the database connection status
console.log(`Database connection initialized with ${process.env.NODE_ENV} settings`);
console.log(`Database URL defined: ${process.env.DATABASE_URL ? 'Yes' : 'No'}`); 