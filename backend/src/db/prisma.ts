import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { DATABASE_URL } from '../constants/index.js';

// Create a pg Pool and pass it to the Prisma adapter (Prisma 7 pattern)
const pool = new Pool({ connectionString: DATABASE_URL });
const adapter = new PrismaPg(pool as any);

const prisma = new PrismaClient({ adapter } as any);

const handleShutdown = async () => {
	try {
		await prisma.$disconnect();
	} catch (e) {
		// ignore
	}
	try {
		await pool.end();
	} catch (e) {
		// ignore
	}
	// don't exit here; caller may decide
};

process.on('SIGINT', () => void handleShutdown());
process.on('SIGTERM', () => void handleShutdown());

export { pool };
export default prisma;
