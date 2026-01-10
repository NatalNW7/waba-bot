import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback, Profile } from 'passport-google-oauth20';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private readonly prisma: PrismaService) {
    const clientID = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const callbackURL = process.env.GOOGLE_CALLBACK_URL;

    if (!clientID || !clientSecret || !callbackURL) {
      throw new Error(
        'Google OAuth environment variables are required: GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_CALLBACK_URL',
      );
    }

    super({
      clientID,
      clientSecret,
      callbackURL,
      scope: ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ): Promise<void> {
    const { id, emails, displayName, photos } = profile;
    const email = emails?.[0]?.value;

    if (!email) {
      return done(new Error('No email found in Google profile'), undefined);
    }

    try {
      // Find existing user by email or googleId
      let user = await this.prisma.user.findFirst({
        where: {
          OR: [{ email }, { googleId: id }],
        },
        include: { tenant: true },
      });

      if (user) {
        // Update Google profile data if needed
        if (!user.googleId || !user.name || !user.avatarUrl) {
          user = await this.prisma.user.update({
            where: { id: user.id },
            data: {
              googleId: user.googleId || id,
              name: user.name || displayName,
              avatarUrl: user.avatarUrl || photos?.[0]?.value,
            },
            include: { tenant: true },
          });
        }
      } else {
        // Create new user with TENANT role
        user = await this.prisma.user.create({
          data: {
            email,
            googleId: id,
            name: displayName,
            avatarUrl: photos?.[0]?.value,
            role: 'TENANT',
            isActive: true,
          },
          include: { tenant: true },
        });
      }

      done(null, user);
    } catch (error) {
      done(error as Error, undefined);
    }
  }
}
