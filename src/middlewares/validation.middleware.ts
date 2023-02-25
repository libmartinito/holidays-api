import { Request, Response, NextFunction } from 'express'
import { validationResult, ValidationError } from 'express-validator'

const validationMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req)
  if (errors.isEmpty()) {
    return next()
  }
  const extractedErrors: { [key: string]: any }[] = []
  errors.array().map(err => extractedErrors.push({ [err.param]: err.msg }))

  return res.status(400).json({ errors: extractedErrors })
}

export default validationMiddleware