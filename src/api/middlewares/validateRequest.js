// src/middlewares/validateRequest.js
export const validateRequest = (schema) => (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ errors: result.error.flatten().fieldErrors });
    }
  
    req.body = result.data;
    next();
  };
  