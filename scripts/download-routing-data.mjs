import { createHash } from "node:crypto";
import { createReadStream, createWriteStream } from "node:fs";
import { mkdir, readFile, rename, rm, stat } from "node:fs/promises";
import { join, relative } from "node:path";
import { Readable, Transform } from "node:stream";
import { pipeline } from "node:stream/promises";
import { fileURLToPath } from "node:url";

const projectRoot = fileURLToPath(new URL("..", import.meta.url));
const dataDirectory =
  process.env.SPOKES_ROUTING_SOURCE_DIR ??
  fileURLToPath(new URL("../routing/data/source", import.meta.url));
const snapshot = JSON.parse(
  await readFile(
    new URL("../routing/data/hertfordshire-2026-08-13.json", import.meta.url),
    "utf8",
  ),
);

async function checksum(path) {
  const hash = createHash("sha256");
  await pipeline(createReadStream(path), hash);
  return hash.digest("hex");
}

async function existingFileMatches(path, file) {
  try {
    const details = await stat(path);
    return details.size === file.bytes && (await checksum(path)) === file.sha256;
  } catch (error) {
    if (error?.code === "ENOENT") return false;
    throw error;
  }
}

async function download(file) {
  const destination = join(dataDirectory, file.name);
  const partial = `${destination}.part`;

  if (await existingFileMatches(destination, file)) {
    console.log(`${file.name} already matches ${snapshot.id}.`);
    return;
  }

  const source = process.env.SPOKES_ROUTING_DATA_URL ?? file.url;
  console.log(`Downloading ${snapshot.id} source data from ${source}...`);

  const response = await fetch(source, { redirect: "follow" });
  if (!response.ok || !response.body) {
    throw new Error(`Routing data download failed with HTTP ${response.status}.`);
  }

  const hash = createHash("sha256");
  let bytes = 0;
  const verifier = new Transform({
    transform(chunk, _encoding, callback) {
      bytes += chunk.length;
      hash.update(chunk);
      callback(null, chunk);
    },
  });

  try {
    await pipeline(Readable.fromWeb(response.body), verifier, createWriteStream(partial));
    const digest = hash.digest("hex");
    if (bytes !== file.bytes || digest !== file.sha256) {
      throw new Error(
        `Downloaded ${file.name} does not match ${snapshot.id}; expected ${file.bytes} bytes and ${file.sha256}, received ${bytes} bytes and ${digest}.`,
      );
    }
    await rename(partial, destination);
  } catch (error) {
    await rm(partial, { force: true });
    throw error;
  }

  console.log(`Installed ${file.name} for ${snapshot.id}.`);
}

await mkdir(dataDirectory, { recursive: true });
console.log(`Preparing ${snapshot.id} in ./${relative(projectRoot, dataDirectory)}.`);
await download(snapshot.source);
