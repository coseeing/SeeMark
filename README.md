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

#### iframe

Embed iframe content with automatic detection for YouTube and CodePen URLs.

```markdown
@![My Video](https://www.youtube.com/embed/4mBrMhczurY)
@![My Pen](https://codepen.io/username/embed/abc123)
@![External Content](https://example.com/embed)
```

The syntax automatically detects YouTube and CodePen URLs and renders them with specialized YouTube/CodePen components. For other URLs, a standard iframe is rendered.

| Prop Name | Type   | Default Value | Description                                  |
| --------- | ------ | ------------- | -------------------------------------------- |
| title     | string | ''            | The title attribute for the iframe.          |
| source    | string | ''            | The source URL for the iframe.               |
| position  | object | -             | Position info: `{ start: number, end: number }` |

You can supply your own custom components for YouTube, CodePen, and iframe rendering by passing them to the `createMarkdownToReactParser` function as shown in the usage example below.

```js
const seeMarkReactParse = useCallback(
  (markdown) => {
    return createMarkdownToReactParser({
      options: {
        latexDelimiter,
        documentFormat,
        imageFiles,
        shouldBuildImageObjectURL,
      },
      components: { youtube: YouTubeComponent, codepen: CodePenComponent, iframe: IframeComponent },
    })(markdown);
  },
  [imageFiles, latexDelimiter, documentFormat]
);
```

#### externalLinkTab

Standard link that opens in a new tab.

```markdown
@[Documentation](https://docs.example.com)
```

| Prop Name | Type   | Default Value | Description                                     |
| --------- | ------ | ------------- | ----------------------------------------------- |
| display   | string | ''            | The text to display for the link.               |
| target    | string | ''            | The target URL.                                 |
| position  | object | -             | Position info: `{ start: number, end: number }` |

#### externalLinkTitle

Link with a title attribute (shown on hover).

```markdown
[Documentation][[Read the docs]](https://docs.example.com)
```

| Prop Name | Type   | Default Value | Description                                     |
| --------- | ------ | ------------- | ----------------------------------------------- |
| display   | string | ''            | The text to display for the link.               |
| title     | string | ''            | The title attribute (hover text).               |
| target    | string | ''            | The target URL.                                 |
| position  | object | -             | Position info: `{ start: number, end: number }` |

#### externalLinkTabTitle

Link with title attribute that opens in a new tab.

```markdown
@[Documentation][[Read the docs]](https://docs.example.com)
```

| Prop Name | Type   | Default Value | Description                                     |
| --------- | ------ | ------------- | ----------------------------------------------- |
| display   | string | ''            | The text to display for the link.               |
| title     | string | ''            | The title attribute (hover text).               |
| target    | string | ''            | The target URL.                                 |
| position  | object | -             | Position info: `{ start: number, end: number }` |

#### internalLink

```markdown
[some text]<sample-id>
```

| Prop Name | Type   | Default Value | Description                                |
| --------- | ------ | ------------- | ------------------------------------------ |
| text      | string | ''            | The text to display for the link.          |
| id        | string | ''            | The ID of the target element for the link. |
| position  | object | -             | Position info: `{ start: number, end: number }` |

#### internalLinkTitle

Internal link with a title attribute.

```markdown
[Go to section][[Section Reference]]<section-123>
```

| Prop Name | Type   | Default Value | Description                                     |
| --------- | ------ | ------------- | ----------------------------------------------- |
| display   | string | ''            | The text to display for the link.               |
| title     | string | ''            | The title attribute (hover text).               |
| target    | string | ''            | The ID of the target element for the link.      |
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

#### imageLink

Image wrapped in a link.

```markdown
![alt text](image-123)((https://example.com/target))
```

| Prop Name | Type   | Default Value | Description                                     |
| --------- | ------ | ------------- | ----------------------------------------------- |
| alt       | string | ''            | The alternative text for the image.             |
| imageId   | string | ''            | The image ID.                                   |
| src       | string | ''            | The source path of the image.                   |
| target    | string | ''            | The target URL for the link.                    |
| position  | object | -             | Position info: `{ start: number, end: number }` |

#### imageDisplay

Image with caption text.

```markdown
![alt text][[Display caption]](image-456)
```

| Prop Name | Type   | Default Value | Description                                     |
| --------- | ------ | ------------- | ----------------------------------------------- |
| alt       | string | ''            | The alternative text for the image.             |
| display   | string | ''            | The caption text to display.                    |
| imageId   | string | ''            | The image ID.                                   |
| src       | string | ''            | The source path of the image.                   |
| position  | object | -             | Position info: `{ start: number, end: number }` |

#### imageDisplayLink

Image with caption text wrapped in a link.

```markdown
![alt text][[Display caption]](image-789)((https://example.com/details))
```

| Prop Name | Type   | Default Value | Description                                     |
| --------- | ------ | ------------- | ----------------------------------------------- |
| alt       | string | ''            | The alternative text for the image.             |
| display   | string | ''            | The caption text to display.                    |
| imageId   | string | ''            | The image ID.                                   |
| src       | string | ''            | The source path of the image.                   |
| target    | string | ''            | The target URL for the link.                    |
| position  | object | -             | Position info: `{ start: number, end: number }` |

### Position Information

All custom components receive a `position` prop that indicates the location of the component in the original markdown source:

```typescript
interface Position {
  start: number;  // Character offset where the component starts
  end: number;    // Character offset where the component ends
}
```
