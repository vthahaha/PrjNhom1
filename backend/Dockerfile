# ── Build stage ───────────────────────────────────────────
FROM eclipse-temurin:21-jdk-alpine AS build
WORKDIR /app

RUN apk add --no-cache maven

# Copy pom.xml and pre-fetch dependencies (Docker layer caching)
COPY pom.xml .
RUN mvn dependency:resolve -B

COPY src ./src
RUN mvn clean package -DskipTests -B

# ── Runtime stage ─────────────────────────────────────────
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

RUN addgroup -S spring && adduser -S spring -G spring

COPY --from=build /app/target/*.jar app.jar

USER spring

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
