export const ROLES = {
  BUSINESS: "Business",
  OPERATOR: "Operator",
  ENGINEER: "Engineer"
};

export function authorize(allowedRoles = []) {
  return (req, res, next) => {
    const userRole = req.headers["x-saare-role"] || ROLES.BUSINESS;

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        error: "Acceso Denegado",
        message: "El rol " + userRole + " no tiene permisos para acceder a esta traza."
      });
    }

    req.userRole = userRole;
    next();
  };
}
