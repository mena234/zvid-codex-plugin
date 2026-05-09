---
source_url: "https://docs.zvid.io/docs/structure/properties/subtitle-styles"
sidebar_position: 13
---

# SubtitleStyles

`SubtitleStyles` controls subtitle typography, placement, and display mode.

```typescript
interface SubtitleStyles {
  color?: string;
  background?: string;
  isBold?: boolean;
  isItalic?: boolean;
  fontSize?: number;
  fontFamily?: string;
  textTransform?: "uppercase" | "lowercase" | "capitalize";
  outline?: {
    width: number;
    color: string;
  };
  position?:
    | "top-left"
    | "top-right"
    | "bottom-left"
    | "bottom-right"
    | "center-center"
    | "center-left"
    | "center-right";
  marginV?: number;
  marginH?: number;
  mode?: "normal" | "one-word" | "karaoke" | "progressive";
  activeWord?: {
    color: string;
  };
}
```

| Property             | Default                   | Notes                                                                                                                   |
| -------------------- | ------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `color`              | `#FFFFFF`                 | Hex with optional alpha, such as `#FFFFFF` or `#FFFFFFCC`.                                                              |
| `background`         | none                      | Hex with optional alpha.                                                                                                |
| `fontSize`           | `50`                      | Pixels.                                                                                                                 |
| `fontFamily`         | `Poppins`                 | Google Fonts family name.                                                                                               |
| `isBold`, `isItalic` | `false`                   | Typography flags.                                                                                                       |
| `textTransform`      | none                      | `uppercase`, `lowercase`, or `capitalize`.                                                                              |
| `outline`            | none                      | Requires `width` and `color`.                                                                                           |
| `position`           | default placement         | API accepts `top-left`, `top-right`, `bottom-left`, `bottom-right`, `center-center`, `center-left`, and `center-right`. |
| `marginV`, `marginH` | derived from project size | Integer pixels.                                                                                                         |
| `mode`               | `normal`                  | `normal`, `one-word`, `karaoke`, or `progressive`.                                                                      |
| `activeWord.color`   | none                      | Used by karaoke-style modes.                                                                                            |

## Used By

- [Subtitle](../subtitle.md)
