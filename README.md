# SeeMark

## React

### Usage

```js
import { createMarkdownToReactParser } from '@coseeing/see-mark';

const Alert = ({ children, internalLinkId, variant, title }) => {
  return (
    <div className={`alert alert-${variant}`}>
      {title && <strong>{title}</strong>}
      {children}
    </div>
  );
};

const markdown = `# Hello World

const seeMarkReactParse = useCallback(
  (markdown) => {
    return createMarkdownToReactParser({
      options: {
        latexDelimiter,
        documentFormat,
        imageFiles,
        shouldBuildImageObjectURL,
      },
      components: { alert: Alert },
    })(markdown);
  },
  [imageFiles, latexDelimiter, documentFormat]
);

const content = seeMarkReactParse(markdown);
```

### options

| Option Name               | Type    | Default Value  | Description                                                        |
| ------------------------- | ------- | -------------- | ------------------------------------------------------------------ |
| includeMathExtensions     | boolean | true           | Include math (LaTeX/AsciiMath) and Nemeth extensions.              |
| latexDelimiter            | string  | 'bracket'      | The delimiter for LaTeX expressions. Options: 'bracket', 'dollar'. |
| documentFormat            | string  | 'inline'       | The format of the document. Options: 'inline', 'block'.            |
| imageFiles                | object  | { [ID]: File } | A map of image IDs to File objects for image rendering.            |
| shouldBuildImageObjectURL | boolean | false          | should build image object URL.                                     |

### Supported Custom Components

#### alert

```markdown
> [!NOTE]
> Highlights information that users should take into account, even when skimming.
```

| Prop Name      | Type      | Default Value | Description                                         |
| -------------- | --------- | ------------- | --------------------------------------------------- |
| children       | ReactNode | -             | The content of the alert.                           |
| internalLinkId | string    | ''            | The ID for internal linking.                        |
| variant        | string    | ''            | The variant of the alert (e.g., 'info', 'warning'). |
| title          | string    | ''            | The title of the alert.                             |
| position       | object    | -             | Position info: `{ start: number, end: number }`     |

#### internalLink

```markdown
[some text]<sample-id>
```

| Prop Name | Type   | Default Value | Description                                |
| --------- | ------ | ------------- | ------------------------------------------ |
| text      | string | ''            | The text to display for the link.          |
| id        | string | ''            | The ID of the target element for the link. |
| position  | object | -             | Position info: `{ start: number, end: number }` |

#### image

```markdown
![pikachu](pikachu-path)
```

| Prop Name | Type   | Default Value | Description                         |
| --------- | ------ | ------------- | ----------------------------------- |
| src       | string | ''            | The source path of the image.       |
| alt       | string | ''            | The alternative text for the image. |
| imageId   | string | ''            | image ID                            |
| position  | object | -             | Position info: `{ start: number, end: number }` |

### Position Information

All custom components receive a `position` prop that indicates the location of the component in the original markdown source:

```typescript
interface Position {
  start: number;  // Character offset where the component starts
  end: number;    // Character offset where the component ends
}
```

## Table of Contents

### Usage

```js
import { createTableOfContents } from '@coseeing/see-mark';

const markdown = `
## Introduction
### Getting Started
## Advanced Usage
### Configuration
`;

const toc = createTableOfContents(markdown);
// [
//   { level: 2, id: 'introduction',   text: 'Introduction' },
//   { level: 3, id: 'getting-started', text: 'Getting Started' },
//   { level: 2, id: 'advanced-usage',  text: 'Advanced Usage' },
//   { level: 3, id: 'configuration',   text: 'Configuration' },
// ]
```

`createTableOfContents` parses a markdown string and returns a flat array of all h1–h6 headings in document order. The `id` of each entry is generated with the same slugify logic used by the seemark's markdown parser, so IDs are guaranteed to match the `id` prop on rendered heading components.

### Options

| Option Name           | Type    | Default Value | Description                                                                                              |
| --------------------- | ------- | ------------- | -------------------------------------------------------------------------------------------------------- |
| includeMathExtensions | boolean | true          | Include math (LaTeX/AsciiMath) and Nemeth extensions. Must match the value used by the renderer.         |
| latexDelimiter        | string  | 'bracket'     | The delimiter for LaTeX expressions. Must match the value used by the renderer. Options: 'bracket', 'dollar'. |

### Return value

Each entry in the returned array has the following shape:

| Field | Type   | Description                                                  |
| ----- | ------ | ------------------------------------------------------------ |
| level | number | Heading level (1–6)                                          |
| id    | string | URL-friendly slug, unique within the document               |
| text  | string | Plain heading text with inline markdown syntax stripped      |
