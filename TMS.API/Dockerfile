# Use the official ASP.NET Core runtime as the base image
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 80
EXPOSE 443

# Use the SDK image to build the application
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy the project file and restore dependencies
COPY ["TMS.API/TMS.API.csproj", "TMS.API/"]
COPY ["TMS.Application/TMS.Application.csproj", "TMS.Application/"]
COPY ["TMS.Core/TMS.Core.csproj", "TMS.Core/"]
COPY ["TMS.Infrastructure/TMS.Infrastructure.csproj", "TMS.Infrastructure/"]

RUN dotnet restore "TMS.API/TMS.API.csproj"

# Copy the entire source code
COPY . .

# Build the application
WORKDIR "/src/TMS.API"
RUN dotnet build "TMS.API.csproj" -c Release -o /app/build

# Publish the application
FROM build AS publish
RUN dotnet publish "TMS.API.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Create the final runtime image
FROM base AS final
WORKDIR /app

# Create uploads directory
RUN mkdir -p /app/uploads

# Copy the published application
COPY --from=publish /app/publish .

# Set environment variables
ENV ASPNETCORE_ENVIRONMENT=Production
ENV ASPNETCORE_URLS=http://+:80

# Create a non-root user
RUN adduser --disabled-password --gecos '' appuser && chown -R appuser /app
USER appuser

ENTRYPOINT ["dotnet", "TMS.API.dll"]
