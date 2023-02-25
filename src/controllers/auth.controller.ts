import { Request, Response, NextFunction } from "express"
import { SignUpData } from "@/interfaces/auth.interface"
import { User } from '@prisma/client'
import AuthService from '@services/auth.service'

class AuthController {
  public authService = new AuthService()

  public signUp = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userData: SignUpData = req.body
      const signedUpUserData: User = await this.authService.signUp(userData)

      res.status(200).send(signedUpUserData)
    } catch (error) {
      next(error)
    }
  }
}

export default AuthController