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
        htmlMathDisplay,
        imageFiles,
      },
      components: { alert: Alert },
    })(markdown);
  },
  [imageFiles, latexDelimiter, htmlMathDisplay]
);

const content = seeMarkReactParse(markdown);
```

### options

| Option Name    | Type   | Default Value  | Description                                                        |
| -------------- | ------ | -------------- | ------------------------------------------------------------------ |
| latexDelimiter | string | 'bracket'      | The delimiter for LaTeX expressions. Options: 'bracket', 'dollar'. |
| documentFormat | string | 'inline'       | The format of the document. Options: 'inline', 'block'.            |
| imageFiles     | object | { [ID]: File } | A map of image IDs to File objects for image rendering.            |

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

#### internalLink

```markdown
[some text]<sample-id>
```

| Prop Name | Type   | Default Value | Description                                |
| --------- | ------ | ------------- | ------------------------------------------ |
| text      | string | ''            | The text to display for the link.          |
| id        | string | ''            | The ID of the target element for the link. |
