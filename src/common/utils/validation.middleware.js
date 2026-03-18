export const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const messages = error.details.map((detail) => ({
        field: detail.path.join("."),
        message: detail.message.replace(/"/g, ""),
      }));

      return res.status(400).json({
        message: "Validation failed",
        errors: messages,
      });
    }

    // Replace req.body with validated data
    req.body = value;
    next();
  };
};
