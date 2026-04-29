# Virtual Food Photographer

A powerful web application designed for restaurant owners and food stylists to generate incredibly realistic, high-end food photography directly from text-based menu items.

## Features

- **Menu Parsing:** Simply paste your text menu, and the application will automatically extract individual dishes and their descriptions.
- **Multiple Photography Styles:**
  - **Rustic/Dark:** Chiaroscuro lighting, wooden surfaces, deep shadows.
  - **Bright/Modern:** High-key lighting, minimalist white marble, clean lines.
  - **Social Media:** Top-down flat lay, colorful props, vibrant saturation.
- **Pro Lighting Presets:** Choose from Dramatic Spotlight, Soft Natural Window, Golden Hour Glow, or Studio Macro.
- **Dynamic Angles:** Generate photos from various perspectives including Close-up Macro, Three-Quarter View, Overhead Shot, and Environment Shot.
- **Configurable Resolutions:** Export your photography in beautiful 1K, 2K, or 4K resolutions.

## How to Use

1. **Provide Your API Key:** Upon launching the application, you will be prompted to supply a Google Cloud API key with access to the Gemini API for image generation.
2. **Input Your Menu:** On the left configuration panel, paste your menu items. For best results, include brief descriptions of the ingredients or presentation style (e.g., `- Truffle Mushroom Risotto - Creamy arborio rice with black truffle shavings`).
3. **Configure Settings:** Select your desired *Photography Style*, *Image Resolution*, and *Lighting Preset*.
4. **Generate:** Click **Generate Photos**. The app will parse your menu and begin shooting each dish.
5. **Adjust & Refine:** Once a dish photo is generated, you can change the angle using the dropdown next to the "Regenerate" button to see the same dish from a new perspective.
6. **Save:** Click the **Save** button below any generated image to secure a high-quality `.png` to your device.

## Local Setup

If you want to run this application locally, ensure you have Node.js installed on your machine.

1. Clone this repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set your API key in a `.env` file (if running locally/backend) or rely on the web integration:
   ```
   GEMINI_API_KEY=your_key_here
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```
5. Open your browser to `http://localhost:3000`.

## Architecture & Technologies

- **React:** Component based UI architecture.
- **Tailwind CSS:** Modern utility-first styling with a bespoke "Elegant Dark" design theme.
- **Lucide Icons:** Clean and consistent iconography.
- **Vite:** Next-generation frontend tooling.
