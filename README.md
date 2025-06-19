# DoctorDoc

AsciiDoc and Markdown Utility Tool.

[![NPM Version][npm-version-image]][npm-url]
[![NPM Install Size][npm-install-size-image]][npm-install-size-url]

<img src="https://raw.githubusercontent.com/anderslatif/DoctorDoc/main/doctordoc_logo.png" alt="doctordoc logo" width="150" >

---

## How to run

```bash
$ npm i -g doctordoc
$ doctordoc
```

---

## Flags

| Flag                                     | Description                                                                             | Run Mode                                                                           |
|------------------------------------------|-----------------------------------------------------------------------------------------|------------------------------------------------------------------------------------|
| `--all`                                  | Run all checks.                                                                         | Default if no other flag is set. Doesn't run `--browse`, `--view-github-markdown`  |
| `--browse [path]`                        | Open repository URL for file/directory.                                                 | Defaults to the current directory if no path provided. Only runs this command.     |
| `--preview-github-markdown <file_path>`  | Send a markdown file to the GitHub API and see the generated HTML file in your browser. | Only runs this command.                                                            |
| `--adoc-validate-links`                  | Validate that AsciiDoc links exist on the file system.                                  |                                                                                    |
| `--adoc-validate-dates`                  | Validate that dates exist within the calendar year.                                     |                                                                                    |
| `--md-validate-links`                    | Validate that Markdown file links exist on the file system.                             |                                                                                    |

Doctordoc searches for file extensions ending with `.adoc` and `.md` in the current directory and subdirectories.

It ignores the following folders: `node_modules`, `.venv`, and `.terraform`.

It ignores the following files: `combined_course_markdown.md`.

---

## Design Decisions

This is mainly a CLI to aid with validation in Git repositories. `--md-validate-links` includes checks for links that are valid in the browser. 

In `.adoc` files create a line like this `**Taught on**: <weekday>` if dates are present in a table. This is used to validate that the date exists within the current calendar year. Dates can be defined like `Feb 2nd`, `February 2nd` or with slight variations thereof.

---

[npm-version-image]: https://img.shields.io/npm/v/doctordoc.svg
[npm-url]: https://www.npmjs.com/package/doctordoc
[npm-install-size-image]: https://packagephobia.com/badge?p=doctordoc
[npm-install-size-url]: https://packagephobia.com/result?p=doctordoc
