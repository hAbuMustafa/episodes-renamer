// run: nub watch ./ folder-path="d:\blu" from="(S\d+E\d+).*(x.*)" to="x1 ([title])" map="./example/bluey episodes.json"
import { readdir, rename, readFile } from 'node:fs/promises';
import path from 'path';

const args = process.argv.slice(2);

const options = new Map<string, string | undefined>();

args.map((arg) => arg.split('=')).forEach(([k, v]) => options.set(k, v));

const expectedArgs = ['folder-path', 'from', 'to'];

let hasMissingArgs = false;

expectedArgs.forEach((arg) => {
  const hasArg = options.has(arg);
  if (!hasArg) {
    console.error('Missing argument:', arg);
    hasMissingArgs = hasMissingArgs || true;
  }
});

if (hasMissingArgs) process.exit(1);

const folderPath = options.get('folder-path')!;
const fromName = options.get('from')!;
const toName = options.get('to')!;

if (toName.includes('[') && !options.get('map')) {
  console.error('Missing argument: map');
  process.exit(1);
}

if (options.has('map')) {
  try {
    const mapFileContent = await readFile(options.get('map')!, 'utf8');

    options.set('mapObj', JSON.parse(mapFileContent));
  } catch (err) {
    console.error(err);
  }
}

async function getFileNames(dirPath: string) {
  const entries = await readdir(dirPath, { withFileTypes: true });
  const fileNames = entries.filter((entry) => entry.isFile()).map((f) => f.name);

  return fileNames;
}

async function renameFile(oldName: string, newName: string, folder = folderPath) {
  try {
    await rename(path.join(folder, oldName), path.join(folder, newName));
  } catch (err) {
    console.error(err);
  }
}

const files = await getFileNames(folderPath);

const fromPattern = new RegExp(fromName, 'i');

files.forEach((n) => {
  const fileNameArr = n.split('.');
  const fileExt = fileNameArr.pop();
  const fileName = fileNameArr.join('.');

  const groups = fromPattern.exec(fileName)?.slice(1);

  let newName = toName;

  if (groups?.length) {
    groups.forEach((repl, i) => {
      newName = newName.replace(`x${i + 1}`, repl);
    });
  }

  // todo: replace all prop names with their respective values
  // todo: rename files
});
