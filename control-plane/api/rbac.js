export const ROLES = {
  BUSINESS: 'Business',
  OPERATOR: 'Operator',
  ENGINEER: 'Engineer'
};

export function authorizeRole(allowedRoles = []) {
  return (req, res, next) => {
    const userRole = req.headers['x-saare-role'] || ROLES.BUSINESS;

    if (allowedRoles.includes(userRole)) {
      next();
    } else {
      res.status(403).json({
        error: 'Acceso Denegado',
        message: `El rol ${userRole} no tiene autorizacion para esta operacion.`
      });
    }
  };
}
