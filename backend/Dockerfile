FROM openjdk:21-jdk-slim

WORKDIR /app

# install maven
RUN apt-get update && apt-get install -y maven && rm -rf /var/lib/apt/lists/*

# copy maven files
COPY pom.xml .
COPY .mvn .mvn
COPY mvnw .

# download dependencies
RUN ./mvnw dependency:go-offline -B

# copy source code
COPY src src

# build stage
RUN ./mvnw clean package -DskipTests

# create final image
FROM openjdk:21-jre-slim
WORKDIR /app
COPY --from=0 /app/target/.jar app.jar

# cretae non root user
RUN groupadd -r appuser && useradd -r -g appuser appuser
RUN chown -R appuser:appuser /apps
USER appuser

EXPOSE 8082
ENTRYPOINT ["java", "-jar", "app.jar"]