import { body, ValidationChain, CustomValidator } from 'express-validator'
import Holidays from 'date-holidays'

const isCountryValid: CustomValidator = value => {
  const hd = new Holidays()
  const countries = hd.getCountries()
  const conutryCodes = Object.keys(countries)

  if (!conutryCodes.includes(value)) throw new Error('Country code does not exists in available countries.')
  return true
}

export const holidayValidationRules = (): ValidationChain[] => {
  return [
    body('user_id').exists().bail().isInt(),
    body('country').exists().bail().custom(isCountryValid),
    body('holiday_id').exists().bail().isDate()
  ]
}