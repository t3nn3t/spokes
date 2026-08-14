FROM gradle:jdk17-jammy AS build

ARG BROUTER_COMMIT

RUN git clone https://github.com/abrensch/brouter.git /tmp/brouter
WORKDIR /tmp/brouter
RUN git checkout "${BROUTER_COMMIT}"
RUN ./gradlew clean build fatJar

FROM eclipse-temurin:17-jre-jammy

WORKDIR /app
COPY --from=build /tmp/brouter/brouter-server/build/libs/brouter-*-all.jar /app/brouter.jar
COPY --from=build /tmp/brouter/misc/profiles2 /app/profiles
COPY routing/data-builder/build.sh /app/build.sh

RUN chmod +x /app/build.sh

ENTRYPOINT ["/app/build.sh"]
