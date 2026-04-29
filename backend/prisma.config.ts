import { defineConfig } from '@prisma/config';
import { DATABASE_URL } from './src/constants/index.js';

export default defineConfig({
  datasource: {
    url: DATABASE_URL,
  },
});
