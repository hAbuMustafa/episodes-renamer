# Episodes Renamer

This project helps you batch rename a bunch of files to other specified name.

It is a hobby project I made to try and test the new rust-based `nub`.

## Options

Example code:

```bash
nub ./index.ts folder-path="e:\series\bluey\04" filter="(S\d+E\d+).*galaxy" to="x1x ([title])" ext="mkv" map="./example/bluey episodes.json" verbose
```

- `folder-path`: the path to the folder containing the files to be renamed.
- `filter`: a RegEx pattern to filter file names with. Note that any capture groups defined in the regex will be available for use in the output name as numbered placeholders, i.e. the first capture group can be referenced in the resulting pattern as `x1x` and the 10th as `x10`, and so on.
- `to`: the pattern resembling the resulting file name.
  - You can use `x1x` (change number if required) as placeholders for parts found in the original filename. Y
  - You can use `[property-name]` to reference strings in the `map` file.
- `ext`|`type`|`file-type` (optional): can be used to filter for specific file-types, in case you have, say, `*.srt` files with the same name as their respective `*.mp4` files and you want to rename only one type of them.
- `new-type`|`new-file-type`|`new-ext` (optional): if you wish to convert files from type to another type.
- `map` (optional): a `*.json` file containing a map for properties embeddable in the new file name.
  - expected format:

  ```jsonc
  {
    "episodeIdentifier":{property1:"value",property2:"value"},
    "episodeIdentifier2":{property1:"value",property2:"value"},
  }
  ```

  Also, check the [example file](./example/bluey%20episodes.json).
- `verbose` (optional, flag): if you want the app to inform you about every change processed  (default `false`).
- `silent` (optional, flag): if you want the app to proceed silently with prompting you about every name change (default `false`).
