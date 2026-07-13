/**
 * Creates (or promotes) an admin user from ADMIN_NAME / ADMIN_EMAIL / ADMIN_PASSWORD in .env.
 * Run once: npm run seed:admin
 * Safe to re-run — if the email already exists, it just promotes that account to admin.
 */
import { connectDB, disconnectDB } from '../config/db';
import { User } from '../models/User.model';
import { logger } from '../utils/logger';

const run = async (): Promise<void> => {
  const name = process.env.ADMIN_NAME;
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!name || !email || !password) {
    logger.error('Missing ADMIN_NAME, ADMIN_EMAIL, or ADMIN_PASSWORD in .env. Add them and re-run.');
    process.exit(1);
  }

  await connectDB();

  const existing = await User.findOne({ email: email.toLowerCase() });

  if (existing) {
    existing.role = 'admin';
    existing.tokenVersion += 1; // invalidate any old sessions
    await existing.save();
    logger.info(`✅ Existing user ${email} promoted to admin.`);
  } else {
    await User.create({
      name,
      email: email.toLowerCase(),
      password, // hashed automatically by the pre-save hook
      role: 'admin',
      isEmailVerified: true,
    });
    logger.info(`✅ Admin account created: ${email}`);
  }

  await disconnectDB();
  process.exit(0);
};

run().catch((err) => {
  logger.error('Failed to seed admin', err);
  process.exit(1);
});
