import dotenv from 'dotenv';
dotenv.config();
import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  
  // Captures transaction latency data
  tracesSampleRate: 1.0, 
  
  // This helps capture the IP addresses of the bots (like Googlebot) we talked about!
  sendDefaultPii: true, 
});

export default Sentry;