import { body, ValidationChain } from 'express-validator'

export const signupValidationRules = (): ValidationChain[] => {
  return [
    body('email').exists().isEmail().bail().normalizeEmail(),
    body('password').exists().isString().bail(),
    body('role').exists().custom((value) => value === 'ADMIN' || 'SUBSCRIBER')
  ]
}

export const loginValidationRules = (): ValidationChain[] => {
  return [
    body('email').exists().isEmail().bail().normalizeEmail(),
    body('password').exists().isString().bail()
  ]
}