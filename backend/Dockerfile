# -------- build stage --------
FROM openjdk:21-jdk-slim AS builder

WORKDIR /app

# install Maven
RUN apt-get update && apt-get install -y maven && rm -rf /var/lib/apt/lists/*

# copy Maven-related files
COPY pom.xml .
COPY .mvn .mvn
COPY mvnw .

# fix permission for mvnw script
RUN chmod +x mvnw

# download dependencies for offline build
RUN ./mvnw dependency:go-offline -B

# copy source code
COPY src src

# build the application
RUN ./mvnw clean package -DskipTests

# -------- runtime stage --------
FROM openjdk:21-slim

WORKDIR /app

# copy the built jar file from the builder stage
COPY --from=builder /app/target/*.jar app.jar

# create non-root user for better security
RUN groupadd -r appuser && useradd -r -g appuser appuser

# fix permissions (ensure user can access /app)
RUN chown -R appuser:appuser /app
USER appuser

EXPOSE 8082

# run the application
ENTRYPOINT ["java", "-jar", "app.jar"]