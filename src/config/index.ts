import dotenv from 'dotenv';

dotenv.config();
export const { NODE_ENV, PORT, SECRET_KEY } = process.env;
