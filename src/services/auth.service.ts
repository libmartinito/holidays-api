import { PrismaClient, User } from '@prisma/client'
import { SignUpData } from '@/interfaces/auth.interface'
import { HttpException } from '@/exceptions/HttpException'
import { hash } from 'bcrypt'

class AuthService {
  public users = new PrismaClient().user

  public async signUp(userData: SignUpData): Promise<User> {
    if (!userData) throw new HttpException(400, "User data is empty.")

    const user: User | null = await this.users.findUnique({ where: { email: userData.email } })
    if (user) throw new HttpException(400, `This email ${userData.email} already exists.`)

    const hashedPassword = await hash(userData.password, 10)
    const createdUserData: Promise<User> = this.users.create({ data: { ...userData, password: hashedPassword }})

    return createdUserData
  }
}

export default AuthService