import { config } from "dotenv";
import minimist from "minimist";
config(); // phải chạy trước khi đọc process.env
const argv = minimist(process.argv.slice(2));

// npm run dev  ? nodemon development  ? argv._[0] = "development"
// npm run start ? node dist/index.js production ? argv._[0] = "production"
export const isProd =
  argv._[0] === "production" || process.env.NODE_ENV === "production";

export const BASE_URL = isProd
  ? (process.env.BASE_URL_PROD ??
    process.env.RENDER_EXTERNAL_URL ??
    `https://api.yourdomain.com`)
  : (process.env.BASE_URL_DEV ??
    `http://localhost:${process.env.PORT ?? 4000}`);
