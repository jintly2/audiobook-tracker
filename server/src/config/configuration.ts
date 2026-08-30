export default () => ({
  port: parseInt(process.env.SERVER_PORT || '3001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET || 'audiobook-tracker-dev-secret-change-in-production',
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  },
});
