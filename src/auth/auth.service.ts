import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import * as bcrypt from 'bcryptjs';

import { User } from './entities/user.entity';
import { JwtPayload } from './interfaces/jwt-payload';
import { LoginResponse } from './interfaces/login-response';
import {
  CreateUserDto,
  LoginUserDto,
  RegisterUserDto,
  UpdateAuthDto,
} from './dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<User>,
    private jwtSvc: JwtService,
  ) {}

  async login(loginUserDto: LoginUserDto): Promise<LoginResponse> {
    const { email, password } = loginUserDto;

    try {
      const user = await this.userModel.findOne({ email });
      if (!user) {
        throw new UnauthorizedException(
          `Credenciales no validas para ${email}`,
        );
      }

      if (!bcrypt.compareSync(password, user.password)) {
        throw new UnauthorizedException(
          `Credenciales no validas para contraseña`,
        );
      }

      const { password: _, ...validUser } = user.toJSON();

      return {
        user: validUser,
        token: await this.getJwtToken({ id: user.id }),
      };
    } catch (error) {
      throw new InternalServerErrorException(
        `Algo extraño ha pasado, intente despues (error): ${error}`,
      );
    }
  }

  async register(registerUserDto: RegisterUserDto): Promise<LoginResponse> {
    try {
      const user = await this.create(registerUserDto);

      const { password: _, ...validUser } = user;

      return {
        user: validUser,
        token: await this.getJwtToken({ id: user._id }),
      };
    } catch (error) {
      throw new InternalServerErrorException(
        `Algo extraño ha pasado, intente despues (error): ${error}`,
      );
    }
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    console.log(createUserDto);
    try {
      const { password, ...userData } = createUserDto;

      const newUser = new this.userModel({
        password: bcrypt.hashSync(password, 10),
        ...userData,
      });

      await newUser.save();

      const { password: _, ...user } = newUser.toJSON();

      return user;
    } catch (error) {
      if (error.code === 11000) {
        throw new BadRequestException(`${createUserDto.email} ya existe`);
      }

      throw new InternalServerErrorException(
        `Algo extraño ha pasado, intente despues (error): ${error}`,
      );
    }
  }

  findAll(): Promise<User[]> {
    return this.userModel.find();
  }

  async findUserById(id: string) {
    const user = await this.userModel.findById(id);
    const { password: _, ...userData } = user.toJSON();

    return userData;
  }

  findOne(id: number) {
    return `This action returns a #${id} auth`;
  }

  update(id: number, updateAuthDto: UpdateAuthDto) {
    return `This action updates a #${id} auth`;
  }

  remove(id: number) {
    return `This action removes a #${id} auth`;
  }

  async getJwtToken(payload: JwtPayload) {
    const token = await this.jwtSvc.signAsync(payload);
    return token;
  }
}
