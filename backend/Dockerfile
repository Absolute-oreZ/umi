# Build stage
FROM openjdk:21-jdk-slim AS builder

WORKDIR /app

# install maven
RUN apt-get update && apt-get install -y maven && rm -rf /var/lib/apt/lists/*

# copy maven files
COPY pom.xml .
COPY .mvn .mvn
COPY mvnw .

# download dependencies
RUN ./mvnw dependency:go-offline -B

# copy source and build
COPY src src
RUN ./mvnw clean package -DskipTests

# Final image
FROM openjdk:21-slim
WORKDIR /app
COPY --from=builder /app/target/*.jar app.jar

# create non-root user
RUN groupadd -r appuser && useradd -r -g appuser appuser
RUN chown -R appuser:appuser /app
USER appuser

EXPOSE 8082
ENTRYPOINT ["java", "-jar", "app.jar"]