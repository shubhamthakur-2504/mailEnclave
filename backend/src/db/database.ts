import prisma from './prisma.js';

// Verify database connection
export const connectDB = async (): Promise<void> => {
  try {
    await prisma.$connect();
    console.log('✅ Database connected successfully');
  } catch (error: any) {
    console.error('❌ Database connection failed:', error?.message ?? error);
    process.exit(1);
  }
};

// Disconnect from database
export const disconnectDB = async (): Promise<void> => {
  try {
    await prisma.$disconnect();
    console.log('✅ Database disconnected');
  } catch (error: any) {
    console.error('❌ Error disconnecting database:', error?.message ?? error);
  }
};
