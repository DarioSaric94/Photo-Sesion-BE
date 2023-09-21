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

6. Create user using powershell - copy one and paste to terminal, then next one untin you get success
   6.1 $uri = "http://localhost:3000/auth/register"
   6.2 $headers = @{ "Content-Type" = "application/json" }
   6.3 $body = @{
       "email" = "test@email.com"   
       "password" = "123123123"}
   6.4 $response = Invoke-RestMethod -Uri $uri -Method Post -Headers $headers -Body ($body | ConvertTo-Json)
   6.5 Write-Host "Response Status Code: $($response.StatusCode)"
   6.6 Write-Host "Response Content: $($response.Content)"
