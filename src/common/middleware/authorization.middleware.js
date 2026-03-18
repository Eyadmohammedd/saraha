export const authorization = (roles = []) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new Error("Forbidden", { cause: { status: 403 } })
      );
    }
    next();
  };
};