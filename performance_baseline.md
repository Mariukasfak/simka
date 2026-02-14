# Performance Baseline: Image Loading Optimization

## Current State
- **File:** `components/ProductSelector.tsx`
- **Implementation:** Standard HTML `<img>` tag.
- **Issues:**
  - **No Lazy Loading:** Images are loaded immediately upon page load, even if they are not in the viewport.
  - **No Size Optimization:** The same image size is served to all devices regardless of their screen size or resolution.
  - **No Format Optimization:** Images are served in their original format (e.g., PNG), missing out on modern, more efficient formats like WebP or AVIF which Next.js provides automatically.
  - **Potential Layout Shift:** Without specified dimensions or a robust container, `<img>` tags can cause Cumulative Layout Shift (CLS).

## Optimization Strategy
- **Action:** Replace `<img>` with Next.js `<Image>` component.
- **Rationale:**
  - **Automatic Lazy Loading:** Reduces initial page load time and saves bandwidth by only loading images when they are about to enter the viewport.
  - **Responsive Images:** serves correctly sized images for different viewports using the `srcset` attribute.
  - **Modern Formats:** Automatically serves WebP/AVIF to browsers that support them.
  - **Visual Stability:** Helps maintain visual stability and improve CLS scores.

## Expected Impact
- Improved **Largest Contentful Paint (LCP)**.
- Improved **Cumulative Layout Shift (CLS)**.
- Reduced **Total Page Weight** due to optimized image sizes and formats.
