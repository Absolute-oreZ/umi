# UMI Backend

This is the Java Spring Boot backend for the UMI platform.

## 🔍 Why Spring Boot?

Spring Boot is ideal for building secure, scalable RESTful APIs:
- Provides built-in security, dependency injection, and robust architecture
- Supports seamless integration with external Python services (e.g., Flask)
- Mature ecosystem with excellent community and enterprise support

## 🧩 What the Backend Offers

- CRUD operations for users and groups
- Integration with clustering module (Python)
- Authentication and authorization using Keycloak
- DTO-layer mapping with MapStruct
- Central configuration and clean architecture

## 🛠️ Setup Instructions

### Prerequisites
- Java 17+
- Maven

### 1. Install Dependencies & Build
```bash
./mvnw clean install
```

### 2. Run the Application
```bash
./mvnw spring-boot:run
```

### 3. API Endpoint
```
http://localhost:8080
```
