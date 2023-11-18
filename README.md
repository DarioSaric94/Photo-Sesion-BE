# Photo Session Backend (NestJS)

This backend application manages the functionality for creating password-protected albums and user authentication in the Photo Session App.

## Features

- **Album Creation**: Create password-protected albums for different events or occasions.
- **User Authentication**: Users can register and authenticate to access albums.
- **Database Integration**: Utilizes PostgreSQL for data storage.

## Installation and Setup

To set up the NestJS backend locally, follow these steps:

### 1. Install Dependencies:

Use npm to install project dependencies:

```bash: git clone git@github.com:dariosaric94/photo-sesion-be.git

steps:

1. npm install
2. create .env and set your values, example is down
   DATABASE_URL=postgresql://${POSTGRES_USERNAME}:${POSTGRES_PASSWORD}@${BASE_URL}${DOCKER_PORT}/${POSTGRES_DB}
   BASE_URL=localhost:
   APP_URL=http://localhost:3000/
   POSTGRES_USERNAME=admin
   POSTGRES_PASSWORD=admin
   POSTGRES_DB=NameOfDb
   DOCKER_PORT=5433
   GMAIL_USER=email
   GMAIL_PASS=password
   SECRET_KEY=123123
3. docker compose up
4. npx prisma migrate dev
5. npm run seed
6. npm run start:dev
```

### 2. Create Admin User:

```bash:

steps:

1. Create user using powershell - copy one and paste to terminal, then next one untin you get success:
2. $uri = "http://localhost:3000/auth/register"
3. $headers = @{ "Content-Type" = "application/json" }
4. $body = @{
   "email" = "test@email.com"
   "password" = "123123123"}
5. $response = Invoke-RestMethod -Uri $uri -Method Post -Headers $headers -Body ($body | ConvertTo-Json)
6. Write-Host "Response Status Code: $($response.StatusCode)"
7. Write-Host "Response Content: $($response.Content)"
```
