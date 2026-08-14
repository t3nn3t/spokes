FROM gradle:jdk17-jammy AS build

ARG BROUTER_COMMIT

RUN git clone https://github.com/abrensch/brouter.git /tmp/brouter
WORKDIR /tmp/brouter
RUN git checkout "${BROUTER_COMMIT}"
COPY routing/data-builder/normalize-node-tag-values.patch /tmp/normalize-node-tag-values.patch
RUN git apply /tmp/normalize-node-tag-values.patch
RUN ./gradlew clean build fatJar

FROM eclipse-temurin:17-jre-jammy

WORKDIR /app
COPY --from=build /tmp/brouter/brouter-server/build/libs/brouter-*-all.jar /app/brouter.jar
COPY --from=build /tmp/brouter/misc/profiles2 /app/profiles
COPY routing/data-builder/build.sh /app/build.sh
COPY routing/profiles/prepare-lookups.sh /app/prepare-lookups.sh
COPY routing/profiles/way-lookups.dat /app/way-lookups.dat
COPY routing/profiles/node-lookups.dat /app/node-lookups.dat

RUN chmod +x /app/build.sh /app/prepare-lookups.sh

ENTRYPOINT ["/app/build.sh"]
