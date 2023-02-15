import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const FIELDS_TO_COPY = [
  "nyc",
  "funding",
  "keywords",
  "author",
  "license",
  "homepage",
  "bugs",
  "repository",
];

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const __rootdir = __dirname + "/..";
const __packagesdir = `${__rootdir}/packages`;

const dirents = await fs.readdir(__packagesdir, {
  withFileTypes: true,
});

const rootPackage = JSON.parse(
  (await fs.readFile(`${__rootdir}/package.json`)).toString()
);

for (const dir of dirents) {
  if (!dir.isDirectory()) continue;

  const packageFile = `${__packagesdir}/${dir.name}/package.json`;

  const package_ = JSON.parse((await fs.readFile(packageFile)).toString());

  const newPackage = FIELDS_TO_COPY.reduce(
    (newPackage, keyToCopy) => ({
      ...newPackage,
      [keyToCopy]: rootPackage[keyToCopy],
    }),
    package_
  );

  await fs.writeFile(packageFile, JSON.stringify(newPackage, null, 2));
}
