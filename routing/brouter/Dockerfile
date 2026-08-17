FROM gradle:jdk17-jammy AS build

ARG BROUTER_COMMIT

RUN git clone https://github.com/abrensch/brouter.git /tmp/brouter
WORKDIR /tmp/brouter
RUN git checkout "${BROUTER_COMMIT}"
COPY routing/data-builder/normalize-node-tag-values.patch /tmp/normalize-node-tag-values.patch
COPY routing/data-builder/enrich-major-crossings.patch /tmp/enrich-major-crossings.patch
RUN git apply /tmp/normalize-node-tag-values.patch \
  && git apply /tmp/enrich-major-crossings.patch
RUN ./gradlew clean build fatJar

FROM eclipse-temurin:17-jre-jammy AS runtime

WORKDIR /app
COPY --from=build /tmp/brouter/brouter-server/build/libs/brouter-*-all.jar /app/brouter.jar
COPY --from=build /tmp/brouter/misc/profiles2 /profiles2
COPY --from=build /tmp/brouter/misc/scripts/standalone/server.sh /app/server.sh
COPY routing/profiles/prepare-lookups.sh /app/prepare-lookups.sh
COPY routing/profiles/way-lookups.dat /app/way-lookups.dat
COPY routing/profiles/node-lookups.dat /app/node-lookups.dat

RUN mkdir /customprofiles \
  && chmod +x /app/prepare-lookups.sh /app/server.sh

ENV CLASSPATH=/app/brouter.jar \
    SEGMENTSPATH=/segments4 \
    PROFILESPATH=/profiles2 \
    CUSTOMPROFILESPATH=/customprofiles

EXPOSE 17777

FROM runtime AS data-builder

COPY routing/data-builder/build.sh /app/build.sh
RUN chmod +x /app/build.sh

ENTRYPOINT ["/app/build.sh"]

FROM runtime AS server

ENTRYPOINT ["/app/server.sh"]
