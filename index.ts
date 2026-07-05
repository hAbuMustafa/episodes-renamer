// run: nub watch ./ folder-path="d:\blu" filter="(S\d+E\d+).*(x.*)" to="x1 ([title])" map="./example/bluey episodes.json"
import { readdir, rename, readFile } from 'node:fs/promises';
import readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import path from 'path';

const args = process.argv.slice(2);

const options = new Map<string, string | undefined>();

args.map((arg) => arg.split('=')).forEach(([k, v]) => options.set(k, v));

const expectedArgs = ['folder-path', 'filter', 'to'];

let hasMissingArgs = false;

expectedArgs.forEach((arg) => {
  const hasArg = options.has(arg);
  if (!hasArg) {
    console.error('Missing argument:', arg);
    hasMissingArgs = hasMissingArgs || true;
  }
});

if (hasMissingArgs) process.exit(1);

const prompt = readline.createInterface({ input, output });

const folderPath = options.get('folder-path')!;
const filterPattern = options.get('filter')!;
const toName = options.get('to')!;
const verbose = options.has('v') || options.has('verbose');
const silent =
  options.has('silent') ||
  options.has('no-prompt') ||
  options.has('no-prompts') ||
  options.has('noPrompt') ||
  options.has('noPrompts');

let metadataMap: Record<string, Record<string, any>> | undefined;
let newExt = options.get('new-ext');

if (toName.includes('[') && !options.get('map')) {
  console.error('Missing argument: map');
  prompt.close();
  process.exit(1);
}

if (options.has('map')) {
  try {
    const mapFileContent = await readFile(options.get('map')!, 'utf8');

    metadataMap = JSON.parse(mapFileContent);
  } catch (err) {
    console.error(err);
    prompt.close();
    process.exit(1);
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

    if (verbose) console.info(oldName, '==>', newName);
  } catch (err) {
    console.error(err);
    prompt.close();
    process.exit(1);
  }
}

const filterRegex = new RegExp(filterPattern, 'i');

let allFilesCount = 0;

const files = await getFileNames(folderPath).then((fNames) => {
  allFilesCount = fNames.length;

  return fNames.filter((nm) => filterRegex.test(nm));
});

if (!files.length) {
  console.info('No files match set filter were found.');
  prompt.close();
  process.exit(0);
}

const placeholders = /\[.*\]/g
  .exec(toName)
  ?.slice(0)
  .map((n) => n.replace(/[\[\]]/g, ''));

let renamedCount = 0;

files.forEach(async (n) => {
  const fileNameArr = n.split('.');
  const fileExt = fileNameArr.pop();
  const fileName = fileNameArr.join('.');

  const seasonNum = /(?<=[^a-z]?s)\d+/i.exec(fileName)?.[0].padStart(2, '0');
  const episodeNum = /(?<=[^a-z]?e)\d+/i
    .exec(fileName)?.[0]
    .padStart(files.length.toString().length ?? 2, '0');

  const metadata = metadataMap?.[`S${seasonNum}E${episodeNum}`];

  const groups = filterRegex.exec(fileName)?.slice(1);

  let newName = toName;

  if (groups?.length) {
    groups.forEach((repl, i) => {
      newName = newName.replace(`x${i + 1}x`, repl);
    });
  }

  newName = newName.replaceAll(/x\d+x/g, '');

  // replace all prop names with their respective values
  placeholders?.forEach((p) => {
    newName = newName.replaceAll(`[${p}]`, metadata?.[p] ?? '');
  });

  // rename files
  if (silent) {
    renameFile(n, [newName.trim(), newExt ?? fileExt].join('.'));
  } else {
    const proceed = await prompt
      .question(
        `Rename "${n}" to "${[newName.trim(), newExt ?? fileExt].join('.')}"? (Y/n) `
      )
      .then((answer) => answer.toLowerCase().trim());

    switch (proceed) {
      case '':
      case 'y':
      case 'yes':
        renameFile(n, [newName.trim(), newExt ?? fileExt].join('.'));
        renamedCount++;

        break;
      case 'abort':
        console.info('Terminating batch rename.');
        prompt.close();
        process.exit(0);
      default:
        break;
    }
  }
});

if (verbose)
  console.info(
    silent ? files.length : renamedCount,
    'file names were changed out of',
    allFilesCount,
    'files'
  );

process.exit(0);
