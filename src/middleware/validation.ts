import type { Request, Response, NextFunction } from "express";

import { type ZodType, ZodError } from "zod";

export const validateBody = (schema: ZodType) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedData = schema.parse(req.body);
      req.body = validatedData;
      next();
    } catch (e) {
      if (e instanceof ZodError) {
        // structure of an issue object.
        // {
        // path: ["habits", 0, "name"],
        // message: "Expected string"
        // }

        return res.status(400).json({
          error: "Validation Failed",
          details: e.issues.map((error) => ({
            field: error.path.join("."),
            message: error.message,
          })),
        });
      }
      next(e);
    }
  };
};

export const validateParams = (schema: ZodType) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.params);
      next();
    } catch (e) {
      if (e instanceof ZodError) {
        return res.status(400).json({
          error: "Invalid Parameters",
          details: e.issues.map((error) => ({
            field: error.path.join("."),
            message: error.message,
          })),
        });
      }
      next(e);
    }
  };
};

export const validateQuery = (schema: ZodType) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.query);
      next();
    } catch (e) {
      if (e instanceof ZodError) {
        return res.status(400).json({
          error: "Invalid Query paramters",
          details: e.issues.map((error) => ({
            path: error.path.join("."),
            message: error.message,
          })),
        });
      }
      next(e);
    }
  };
};
