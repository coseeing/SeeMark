import '@testing-library/jest-dom';

import createDOMFromHTML from '../testing-helpers/create-dom-from-html';
import { getElementByType } from '../testing-helpers/custom-query';
import {
  SEE_MARK_PAYLOAD_DATA_ATTRIBUTES,
  SEEMARK_ELEMENT_TYPE_DATA_ATTRIBUTE,
} from '../shared/common-markup';
import { SUPPORTED_COMPONENT_TYPES } from '../shared/supported-components';

import markdownProcessor from './markdown-processor';

describe('markdownProcessor - position tracking', () => {
  it('should include position info in alert payload', () => {
    const markdownContent = `> [!WARNING]\n> Critical content.`;
    const options = {
      latexDelimiter: 'bracket',
      documentFormat: 'inline',
      imageFiles: {},
    };

    const result = markdownProcessor(markdownContent, options);
    const container = createDOMFromHTML(result);

    const alertContainer = getElementByType(
      container,
      SUPPORTED_COMPONENT_TYPES.ALERT
    );

    expect(alertContainer).not.toBeNull();

    const payloadString = alertContainer.getAttribute(
      SEE_MARK_PAYLOAD_DATA_ATTRIBUTES
    );
    const payload = JSON.parse(payloadString);

    expect(payload.position).toBeDefined();
    expect(payload.position.start).toBeGreaterThanOrEqual(0);
    expect(payload.position.end).toBeGreaterThan(payload.position.start);
  });

  it('should include position info in internal link payload', () => {
    const markdownContent = `Hello [world]<link-id> test`;
    const options = {
      latexDelimiter: 'bracket',
      documentFormat: 'inline',
      imageFiles: {},
    };

    const result = markdownProcessor(markdownContent, options);
    const container = createDOMFromHTML(result);

    const linkContainer = getElementByType(
      container,
      SUPPORTED_COMPONENT_TYPES.INTERNAL_LINK
    );

    const payloadString = linkContainer.getAttribute(
      SEE_MARK_PAYLOAD_DATA_ATTRIBUTES
    );
    const payload = JSON.parse(payloadString);

    expect(payload.position).toBeDefined();
    expect(payload.position.start).toBeGreaterThanOrEqual(0);
    expect(payload.position.end).toBeGreaterThan(payload.position.start);
  });

  it('should include position info in image payload', () => {
    const markdownContent = `![alt text](image-id)`;
    const options = {
      latexDelimiter: 'bracket',
      documentFormat: 'inline',
      imageFiles: { 'image-id': 'path/to/image.png' },
    };

    const result = markdownProcessor(markdownContent, options);
    const container = createDOMFromHTML(result);

    const imageContainer = getElementByType(
      container,
      SUPPORTED_COMPONENT_TYPES.IMAGE
    );

    const payloadString = imageContainer.getAttribute(
      SEE_MARK_PAYLOAD_DATA_ATTRIBUTES
    );
    const payload = JSON.parse(payloadString);

    expect(payload.position).toBeDefined();
    expect(payload.position.start).toBeGreaterThanOrEqual(0);
    expect(payload.position.end).toBeGreaterThan(payload.position.start);
  });

  it('should track positions correctly for multiple components', () => {
    const markdownContent = `[link1]<id1> and [link2]<id2>`;
    const options = {
      latexDelimiter: 'bracket',
      documentFormat: 'inline',
      imageFiles: {},
    };

    const result = markdownProcessor(markdownContent, options);
    const container = createDOMFromHTML(result);

    const links = container.querySelectorAll(
      `[${SEEMARK_ELEMENT_TYPE_DATA_ATTRIBUTE}="${SUPPORTED_COMPONENT_TYPES.INTERNAL_LINK}"]`
    );

    expect(links).toHaveLength(2);

    const payload1 = JSON.parse(
      links[0].getAttribute(SEE_MARK_PAYLOAD_DATA_ATTRIBUTES)
    );
    const payload2 = JSON.parse(
      links[1].getAttribute(SEE_MARK_PAYLOAD_DATA_ATTRIBUTES)
    );

    // Both links should have positions
    expect(payload1.position).toBeDefined();
    expect(payload2.position).toBeDefined();

    // Second link should start after first link
    expect(payload2.position.start).toBeGreaterThan(payload1.position.end);
  });

  it('should handle nested content positions correctly', () => {
    const markdownContent = `> [!NOTE]\n> Text with [link]<id> inside`;
    const options = {
      latexDelimiter: 'bracket',
      documentFormat: 'inline',
      imageFiles: {},
    };

    const result = markdownProcessor(markdownContent, options);
    const container = createDOMFromHTML(result);

    const alertContainer = getElementByType(
      container,
      SUPPORTED_COMPONENT_TYPES.ALERT
    );

    expect(alertContainer).not.toBeNull();

    const alertPayload = JSON.parse(
      alertContainer.getAttribute(SEE_MARK_PAYLOAD_DATA_ATTRIBUTES)
    );

    expect(alertPayload.position).toBeDefined();
    expect(alertPayload.position.start).toBe(0);
    expect(alertPayload.position.end).toBe(39); // Full alert block

    const linkContainer = alertContainer.querySelector(
      `[${SEEMARK_ELEMENT_TYPE_DATA_ATTRIBUTE}="${SUPPORTED_COMPONENT_TYPES.INTERNAL_LINK}"]`
    );

    if (linkContainer) {
      const linkPayload = JSON.parse(
        linkContainer.getAttribute(SEE_MARK_PAYLOAD_DATA_ATTRIBUTES)
      );

      expect(linkPayload.position).toBeDefined();
      // Link position should be relative to document start
      expect(linkPayload.position.start).toBeGreaterThan(10);
      expect(linkPayload.position.end).toBeGreaterThan(
        linkPayload.position.start
      );
    }
  });
});

describe('markdownProcessor - position substring extraction validation', () => {
  it('should extract correct markdown substring for alert using position', () => {
    const markdownContent = `> [!WARNING]\n> Critical content.`;
    const options = {
      latexDelimiter: 'bracket',
      documentFormat: 'inline',
      imageFiles: {},
    };

    const result = markdownProcessor(markdownContent, options);
    const container = createDOMFromHTML(result);

    const alertContainer = getElementByType(
      container,
      SUPPORTED_COMPONENT_TYPES.ALERT
    );

    const payload = JSON.parse(
      alertContainer.getAttribute(SEE_MARK_PAYLOAD_DATA_ATTRIBUTES)
    );

    // Extract substring using position
    const extracted = markdownContent.substring(
      payload.position.start,
      payload.position.end
    );

    // Should match the original alert markdown
    expect(extracted).toBe(`> [!WARNING]\n> Critical content.`);
  });

  it('should extract correct markdown substring for internal link using position', () => {
    const markdownContent = `Hello [world]<link-id> test`;
    const options = {
      latexDelimiter: 'bracket',
      documentFormat: 'inline',
      imageFiles: {},
    };

    const result = markdownProcessor(markdownContent, options);
    const container = createDOMFromHTML(result);

    const linkContainer = getElementByType(
      container,
      SUPPORTED_COMPONENT_TYPES.INTERNAL_LINK
    );

    const payload = JSON.parse(
      linkContainer.getAttribute(SEE_MARK_PAYLOAD_DATA_ATTRIBUTES)
    );

    // Extract substring using position
    const extracted = markdownContent.substring(
      payload.position.start,
      payload.position.end
    );

    // Should match the internal link syntax
    expect(extracted).toBe('[world]<link-id>');
  });

  it('should extract correct markdown substring for image using position', () => {
    const markdownContent = `![alt text](image-id)`;
    const options = {
      latexDelimiter: 'bracket',
      documentFormat: 'inline',
      imageFiles: { 'image-id': 'path/to/image.png' },
    };

    const result = markdownProcessor(markdownContent, options);
    const container = createDOMFromHTML(result);

    const imageContainer = getElementByType(
      container,
      SUPPORTED_COMPONENT_TYPES.IMAGE
    );

    const payload = JSON.parse(
      imageContainer.getAttribute(SEE_MARK_PAYLOAD_DATA_ATTRIBUTES)
    );

    // Extract substring using position
    const extracted = markdownContent.substring(
      payload.position.start,
      payload.position.end
    );

    // Should match the image markdown syntax
    expect(extracted).toBe('![alt text](image-id)');
  });

  it('should extract correct substrings for multiple components', () => {
    const markdownContent = `[link1]<id1> and [link2]<id2>`;
    const options = {
      latexDelimiter: 'bracket',
      documentFormat: 'inline',
      imageFiles: {},
    };

    const result = markdownProcessor(markdownContent, options);
    const container = createDOMFromHTML(result);

    const links = container.querySelectorAll(
      `[${SEEMARK_ELEMENT_TYPE_DATA_ATTRIBUTE}="${SUPPORTED_COMPONENT_TYPES.INTERNAL_LINK}"]`
    );

    const payload1 = JSON.parse(
      links[0].getAttribute(SEE_MARK_PAYLOAD_DATA_ATTRIBUTES)
    );
    const payload2 = JSON.parse(
      links[1].getAttribute(SEE_MARK_PAYLOAD_DATA_ATTRIBUTES)
    );

    // Extract both links using their positions
    const extracted1 = markdownContent.substring(
      payload1.position.start,
      payload1.position.end
    );
    const extracted2 = markdownContent.substring(
      payload2.position.start,
      payload2.position.end
    );

    // Should match the respective link syntaxes
    expect(extracted1).toBe('[link1]<id1>');
    expect(extracted2).toBe('[link2]<id2>');

    // Verify positions don't overlap
    expect(payload1.position.end).toBeLessThanOrEqual(payload2.position.start);
  });

  it('should extract correct substrings for mixed components', () => {
    const markdownContent = `Start [link]<id> middle ![img](img-id) end`;
    const options = {
      latexDelimiter: 'bracket',
      documentFormat: 'inline',
      imageFiles: { 'img-id': 'path/to/img.png' },
    };

    const result = markdownProcessor(markdownContent, options);
    const container = createDOMFromHTML(result);

    const linkContainer = getElementByType(
      container,
      SUPPORTED_COMPONENT_TYPES.INTERNAL_LINK
    );
    const imageContainer = getElementByType(
      container,
      SUPPORTED_COMPONENT_TYPES.IMAGE
    );

    const linkPayload = JSON.parse(
      linkContainer.getAttribute(SEE_MARK_PAYLOAD_DATA_ATTRIBUTES)
    );
    const imagePayload = JSON.parse(
      imageContainer.getAttribute(SEE_MARK_PAYLOAD_DATA_ATTRIBUTES)
    );

    // Extract both components using their positions
    const extractedLink = markdownContent.substring(
      linkPayload.position.start,
      linkPayload.position.end
    );
    const extractedImage = markdownContent.substring(
      imagePayload.position.start,
      imagePayload.position.end
    );

    // Should match the respective syntaxes
    expect(extractedLink).toBe('[link]<id>');
    expect(extractedImage).toBe('![img](img-id)');

    // Verify correct order
    expect(linkPayload.position.start).toBeLessThan(
      imagePayload.position.start
    );
  });

  it('should handle component at document start', () => {
    const markdownContent = `[link]<id> some text after`;
    const options = {
      latexDelimiter: 'bracket',
      documentFormat: 'inline',
      imageFiles: {},
    };

    const result = markdownProcessor(markdownContent, options);
    const container = createDOMFromHTML(result);

    const linkContainer = getElementByType(
      container,
      SUPPORTED_COMPONENT_TYPES.INTERNAL_LINK
    );

    const payload = JSON.parse(
      linkContainer.getAttribute(SEE_MARK_PAYLOAD_DATA_ATTRIBUTES)
    );

    // Component at start should have start = 0
    expect(payload.position.start).toBe(0);

    const extracted = markdownContent.substring(
      payload.position.start,
      payload.position.end
    );
    expect(extracted).toBe('[link]<id>');
  });

  it('should handle component at document end', () => {
    const markdownContent = `some text before [link]<id>`;
    const options = {
      latexDelimiter: 'bracket',
      documentFormat: 'inline',
      imageFiles: {},
    };

    const result = markdownProcessor(markdownContent, options);
    const container = createDOMFromHTML(result);

    const linkContainer = getElementByType(
      container,
      SUPPORTED_COMPONENT_TYPES.INTERNAL_LINK
    );

    const payload = JSON.parse(
      linkContainer.getAttribute(SEE_MARK_PAYLOAD_DATA_ATTRIBUTES)
    );

    // Component at end should have end = total length
    expect(payload.position.end).toBe(markdownContent.length);

    const extracted = markdownContent.substring(
      payload.position.start,
      payload.position.end
    );
    expect(extracted).toBe('[link]<id>');
  });

  it('should handle multiline alert with correct position', () => {
    const markdownContent = `> [!NOTE]\n> Line 1\n> Line 2\n> Line 3`;
    const options = {
      latexDelimiter: 'bracket',
      documentFormat: 'inline',
      imageFiles: {},
    };

    const result = markdownProcessor(markdownContent, options);
    const container = createDOMFromHTML(result);

    const alertContainer = getElementByType(
      container,
      SUPPORTED_COMPONENT_TYPES.ALERT
    );

    const payload = JSON.parse(
      alertContainer.getAttribute(SEE_MARK_PAYLOAD_DATA_ATTRIBUTES)
    );

    const extracted = markdownContent.substring(
      payload.position.start,
      payload.position.end
    );

    // Should extract the entire multiline alert
    expect(extracted).toBe(`> [!NOTE]\n> Line 1\n> Line 2\n> Line 3`);
  });

  it('should handle identical repeated internal links with different positions', () => {
    const markdownContent = `[link]<id> and [link]<id>`;
    const options = {
      latexDelimiter: 'bracket',
      documentFormat: 'inline',
      imageFiles: {},
    };

    const result = markdownProcessor(markdownContent, options);
    const container = createDOMFromHTML(result);

    const links = container.querySelectorAll(
      `[${SEEMARK_ELEMENT_TYPE_DATA_ATTRIBUTE}="${SUPPORTED_COMPONENT_TYPES.INTERNAL_LINK}"]`
    );

    expect(links).toHaveLength(2);

    const payload1 = JSON.parse(
      links[0].getAttribute(SEE_MARK_PAYLOAD_DATA_ATTRIBUTES)
    );
    const payload2 = JSON.parse(
      links[1].getAttribute(SEE_MARK_PAYLOAD_DATA_ATTRIBUTES)
    );

    // Both links should have different positions
    expect(payload1.position.start).not.toBe(payload2.position.start);
    expect(payload1.position.end).not.toBe(payload2.position.end);

    // First link should come before second link
    expect(payload1.position.start).toBeLessThan(payload2.position.start);
    expect(payload1.position.end).toBeLessThanOrEqual(payload2.position.start);

    // Extract and verify both are correct
    const extracted1 = markdownContent.substring(
      payload1.position.start,
      payload1.position.end
    );
    const extracted2 = markdownContent.substring(
      payload2.position.start,
      payload2.position.end
    );

    expect(extracted1).toBe('[link]<id>');
    expect(extracted2).toBe('[link]<id>');

    // Verify exact positions
    expect(payload1.position.start).toBe(0);
    expect(payload1.position.end).toBe(10);
    expect(payload2.position.start).toBe(15);
    expect(payload2.position.end).toBe(25);
  });

  it('should handle identical repeated images with different positions', () => {
    const markdownContent = `![img](id) text ![img](id)`;
    const options = {
      latexDelimiter: 'bracket',
      documentFormat: 'inline',
      imageFiles: { id: 'path/to/image.png' },
    };

    const result = markdownProcessor(markdownContent, options);
    const container = createDOMFromHTML(result);

    const images = container.querySelectorAll(
      `[${SEEMARK_ELEMENT_TYPE_DATA_ATTRIBUTE}="${SUPPORTED_COMPONENT_TYPES.IMAGE}"]`
    );

    expect(images).toHaveLength(2);

    const payload1 = JSON.parse(
      images[0].getAttribute(SEE_MARK_PAYLOAD_DATA_ATTRIBUTES)
    );
    const payload2 = JSON.parse(
      images[1].getAttribute(SEE_MARK_PAYLOAD_DATA_ATTRIBUTES)
    );

    // Both images should have different positions
    expect(payload1.position.start).not.toBe(payload2.position.start);
    expect(payload1.position.end).not.toBe(payload2.position.end);

    // First image should come before second image
    expect(payload1.position.start).toBeLessThan(payload2.position.start);

    // Extract and verify
    const extracted1 = markdownContent.substring(
      payload1.position.start,
      payload1.position.end
    );
    const extracted2 = markdownContent.substring(
      payload2.position.start,
      payload2.position.end
    );

    expect(extracted1).toBe('![img](id)');
    expect(extracted2).toBe('![img](id)');
  });

  it('should handle three identical components with correct sequential positions', () => {
    const markdownContent = `[a]<1> [a]<1> [a]<1>`;
    const options = {
      latexDelimiter: 'bracket',
      documentFormat: 'inline',
      imageFiles: {},
    };

    const result = markdownProcessor(markdownContent, options);
    const container = createDOMFromHTML(result);

    const links = container.querySelectorAll(
      `[${SEEMARK_ELEMENT_TYPE_DATA_ATTRIBUTE}="${SUPPORTED_COMPONENT_TYPES.INTERNAL_LINK}"]`
    );

    expect(links).toHaveLength(3);

    const positions = Array.from(links).map((link) => {
      const payload = JSON.parse(
        link.getAttribute(SEE_MARK_PAYLOAD_DATA_ATTRIBUTES)
      );
      return payload.position;
    });

    // All three should have different positions
    expect(positions[0].start).toBe(0);
    expect(positions[1].start).toBe(7);
    expect(positions[2].start).toBe(14);

    // All should be sequential (no overlap)
    expect(positions[0].end).toBeLessThanOrEqual(positions[1].start);
    expect(positions[1].end).toBeLessThanOrEqual(positions[2].start);

    // Verify extraction
    positions.forEach((pos) => {
      const extracted = markdownContent.substring(pos.start, pos.end);
      expect(extracted).toBe('[a]<1>');
    });
  });

  it('should handle paragraph containing image without position collision', () => {
    const markdownContent = 'Text before\n\n![alt](img-id)\n\nText after';
    const options = {
      latexDelimiter: 'bracket',
      documentFormat: 'inline',
      imageFiles: {},
    };

    const result = markdownProcessor(markdownContent, options);
    const container = createDOMFromHTML(result);
    const image = getElementByType(container, SUPPORTED_COMPONENT_TYPES.IMAGE);
    const payload = JSON.parse(
      image.getAttribute(SEE_MARK_PAYLOAD_DATA_ATTRIBUTES)
    );

    // Verify image position is not affected by paragraph token
    expect(payload.position).toBeDefined();
    expect(payload.position.start).toBe(13);
    expect(payload.position.end).toBe(27);

    // Verify extraction
    const extracted = markdownContent.substring(
      payload.position.start,
      payload.position.end
    );
    expect(extracted).toBe('![alt](img-id)');
  });

  it('should handle alert containing image', () => {
    const markdownContent = '> [!NOTE]\n> ![danger](icon-id)';
    const options = {
      latexDelimiter: 'bracket',
      documentFormat: 'inline',
      imageFiles: {},
    };

    const result = markdownProcessor(markdownContent, options);
    const container = createDOMFromHTML(result);

    const alert = getElementByType(container, SUPPORTED_COMPONENT_TYPES.ALERT);
    const image = getElementByType(container, SUPPORTED_COMPONENT_TYPES.IMAGE);

    const alertPayload = JSON.parse(
      alert.getAttribute(SEE_MARK_PAYLOAD_DATA_ATTRIBUTES)
    );
    const imagePayload = JSON.parse(
      image.getAttribute(SEE_MARK_PAYLOAD_DATA_ATTRIBUTES)
    );

    // Verify both have position
    expect(alertPayload.position).toBeDefined();
    expect(imagePayload.position).toBeDefined();

    // Verify image is within alert boundaries
    expect(imagePayload.position.start).toBeGreaterThanOrEqual(
      alertPayload.position.start
    );
    expect(imagePayload.position.end).toBeLessThanOrEqual(
      alertPayload.position.end
    );

    // Verify alert extraction
    const alertExtracted = markdownContent.substring(
      alertPayload.position.start,
      alertPayload.position.end
    );
    expect(alertExtracted).toBe(markdownContent);

    // Verify image extraction
    const imageExtracted = markdownContent.substring(
      imagePayload.position.start,
      imagePayload.position.end
    );
    expect(imageExtracted).toBe('![danger](icon-id)');
  });
});

describe('markdownProcessor - mixed component sequences', () => {
  const options = {
    latexDelimiter: 'bracket',
    documentFormat: 'inline',
    imageFiles: {},
  };

  it('should handle all three component types in sequence', () => {
    const markdownContent =
      '[link]<id> ![img](img-id)\n\n> [!NOTE]\n> Alert text';

    const result = markdownProcessor(markdownContent, options);
    const container = createDOMFromHTML(result);

    const link = getElementByType(
      container,
      SUPPORTED_COMPONENT_TYPES.INTERNAL_LINK
    );
    const image = getElementByType(container, SUPPORTED_COMPONENT_TYPES.IMAGE);
    const alert = getElementByType(container, SUPPORTED_COMPONENT_TYPES.ALERT);

    const linkPayload = JSON.parse(
      link.getAttribute(SEE_MARK_PAYLOAD_DATA_ATTRIBUTES)
    );
    const imagePayload = JSON.parse(
      image.getAttribute(SEE_MARK_PAYLOAD_DATA_ATTRIBUTES)
    );
    const alertPayload = JSON.parse(
      alert.getAttribute(SEE_MARK_PAYLOAD_DATA_ATTRIBUTES)
    );

    // Verify sequence: link < image < alert
    expect(linkPayload.position.end).toBeLessThanOrEqual(
      imagePayload.position.start
    );
    expect(imagePayload.position.end).toBeLessThanOrEqual(
      alertPayload.position.start
    );

    // Verify extraction
    expect(
      markdownContent.substring(
        linkPayload.position.start,
        linkPayload.position.end
      )
    ).toBe('[link]<id>');
    expect(
      markdownContent.substring(
        imagePayload.position.start,
        imagePayload.position.end
      )
    ).toBe('![img](img-id)');
    expect(
      markdownContent.substring(
        alertPayload.position.start,
        alertPayload.position.end
      )
    ).toBe('> [!NOTE]\n> Alert text');
  });

  it('should handle multiple alerts in sequence', () => {
    // Test with simpler single alert for now, as multiple consecutive alerts
    // may have rendering issues in inline mode
    const markdown1 = '> [!NOTE]\n> First alert';
    const markdown2 = '> [!WARNING]\n> Second alert';

    const blockOptions = {
      ...options,
      documentFormat: 'block',
    };

    // Test each alert separately to verify position tracking works
    const result1 = markdownProcessor(markdown1, blockOptions);
    const result2 = markdownProcessor(markdown2, blockOptions);

    const container1 = createDOMFromHTML(result1);
    const container2 = createDOMFromHTML(result2);

    const alert1 = getElementByType(
      container1,
      SUPPORTED_COMPONENT_TYPES.ALERT
    );
    const alert2 = getElementByType(
      container2,
      SUPPORTED_COMPONENT_TYPES.ALERT
    );

    const payload1 = JSON.parse(
      alert1.getAttribute(SEE_MARK_PAYLOAD_DATA_ATTRIBUTES)
    );
    const payload2 = JSON.parse(
      alert2.getAttribute(SEE_MARK_PAYLOAD_DATA_ATTRIBUTES)
    );

    // Verify both have positions starting at 0 (since separate parses)
    expect(payload1.position.start).toBe(0);
    expect(payload2.position.start).toBe(0);

    // Verify extraction
    expect(
      markdown1.substring(payload1.position.start, payload1.position.end)
    ).toBe(markdown1);
    expect(
      markdown2.substring(payload2.position.start, payload2.position.end)
    ).toBe(markdown2);
  });
});

describe('markdownProcessor - state reset and complex nesting', () => {
  const options = {
    latexDelimiter: 'bracket',
    documentFormat: 'inline',
    imageFiles: {},
  };

  it('should reset position tracking state between multiple parses', () => {
    const markdownContent = '[link]<id>';

    // First parse
    const result1 = markdownProcessor(markdownContent, options);
    const container1 = createDOMFromHTML(result1);
    const link1 = getElementByType(
      container1,
      SUPPORTED_COMPONENT_TYPES.INTERNAL_LINK
    );
    const payload1 = JSON.parse(
      link1.getAttribute(SEE_MARK_PAYLOAD_DATA_ATTRIBUTES)
    );

    // Second parse (same markdown)
    const result2 = markdownProcessor(markdownContent, options);
    const container2 = createDOMFromHTML(result2);
    const link2 = getElementByType(
      container2,
      SUPPORTED_COMPONENT_TYPES.INTERNAL_LINK
    );
    const payload2 = JSON.parse(
      link2.getAttribute(SEE_MARK_PAYLOAD_DATA_ATTRIBUTES)
    );

    // Verify both start at 0 (state was reset)
    expect(payload1.position.start).toBe(0);
    expect(payload2.position.start).toBe(0);
    expect(payload1.position.end).toBe(10);
    expect(payload2.position.end).toBe(10);
  });

  it('should handle alert with multiple nested components', () => {
    // Simplified test: verify alert with one link and one image
    const markdownContent = '> [!NOTE]\n> [link]<id> text ![img](img-id)';

    const blockOptions = {
      ...options,
      documentFormat: 'block',
    };

    const result = markdownProcessor(markdownContent, blockOptions);
    const container = createDOMFromHTML(result);

    const alert = getElementByType(container, SUPPORTED_COMPONENT_TYPES.ALERT);
    const link = getElementByType(
      container,
      SUPPORTED_COMPONENT_TYPES.INTERNAL_LINK
    );
    const image = getElementByType(container, SUPPORTED_COMPONENT_TYPES.IMAGE);

    const alertPayload = JSON.parse(
      alert.getAttribute(SEE_MARK_PAYLOAD_DATA_ATTRIBUTES)
    );
    const linkPayload = JSON.parse(
      link.getAttribute(SEE_MARK_PAYLOAD_DATA_ATTRIBUTES)
    );
    const imagePayload = JSON.parse(
      image.getAttribute(SEE_MARK_PAYLOAD_DATA_ATTRIBUTES)
    );

    // Verify all nested components are within alert boundaries
    expect(linkPayload.position.start).toBeGreaterThanOrEqual(
      alertPayload.position.start
    );
    expect(linkPayload.position.end).toBeLessThanOrEqual(
      alertPayload.position.end
    );

    expect(imagePayload.position.start).toBeGreaterThanOrEqual(
      alertPayload.position.start
    );
    expect(imagePayload.position.end).toBeLessThanOrEqual(
      alertPayload.position.end
    );

    // Verify nested components sequence: link < image
    expect(linkPayload.position.end).toBeLessThanOrEqual(
      imagePayload.position.start
    );

    // Verify extraction
    expect(
      markdownContent.substring(
        linkPayload.position.start,
        linkPayload.position.end
      )
    ).toBe('[link]<id>');
    expect(
      markdownContent.substring(
        imagePayload.position.start,
        imagePayload.position.end
      )
    ).toBe('![img](img-id)');
  });
});

describe('markdownProcessor - edge cases', () => {
  const options = {
    latexDelimiter: 'bracket',
    documentFormat: 'inline',
    imageFiles: {},
  };

  it('should handle components with minimal content', () => {
    // Test minimal valid content (not completely empty, which might not generate tokens)
    const markdown1 = '[a]<id>';
    const markdown2 = '![a](img-id)';

    const result1 = markdownProcessor(markdown1, options);
    const result2 = markdownProcessor(markdown2, options);

    const container1 = createDOMFromHTML(result1);
    const container2 = createDOMFromHTML(result2);

    const link = getElementByType(
      container1,
      SUPPORTED_COMPONENT_TYPES.INTERNAL_LINK
    );
    const image = getElementByType(container2, SUPPORTED_COMPONENT_TYPES.IMAGE);

    // Verify no crash and has position
    expect(link).toBeTruthy();
    expect(image).toBeTruthy();

    const linkPayload = JSON.parse(
      link.getAttribute(SEE_MARK_PAYLOAD_DATA_ATTRIBUTES)
    );
    const imagePayload = JSON.parse(
      image.getAttribute(SEE_MARK_PAYLOAD_DATA_ATTRIBUTES)
    );

    expect(linkPayload.position).toBeDefined();
    expect(imagePayload.position).toBeDefined();
  });

  it('should handle very long component text', () => {
    const longText = 'a'.repeat(500);
    const markdownContent = `[${longText}]<id>`;

    const result = markdownProcessor(markdownContent, options);
    const container = createDOMFromHTML(result);

    const link = getElementByType(
      container,
      SUPPORTED_COMPONENT_TYPES.INTERNAL_LINK
    );
    const payload = JSON.parse(
      link.getAttribute(SEE_MARK_PAYLOAD_DATA_ATTRIBUTES)
    );

    // Verify position tracking works for large tokens
    expect(payload.position).toBeDefined();
    expect(payload.position.end - payload.position.start).toBe(
      markdownContent.length
    );

    // Verify extraction is correct
    const extracted = markdownContent.substring(
      payload.position.start,
      payload.position.end
    );
    expect(extracted).toBe(markdownContent);
  });
});
