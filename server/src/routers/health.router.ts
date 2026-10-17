import { Router } from "express";

export const healthRouter = Router();
healthRouter.get("", (req, res) => {
  res.json({
    message: "Server is running",
    timestamp: new Date().toISOString(),
  });
});
