import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../src/app.module';
import { UserRoleSeed } from './userRole.seed';

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const userRoles = app.get(UserRoleSeed);

    await userRoles.seed();

    console.log('Seed data created successfully!');
  } catch (error) {
    console.error('Error seeding data:', error.message);
  } finally {
    await app.close();
  }
}

seed();
