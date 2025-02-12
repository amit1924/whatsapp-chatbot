const generateImage = async (prompt) => {
  try {
    const width = 512;
    const height = 512;
    const seed = 42;
    const model = "stable-diffusion";

    const imageUrl = `https://pollinations.ai/p/${encodeURIComponent(
      prompt
    )}?width=${width}&height=${height}&seed=${seed}&model=${model}`;

    return imageUrl;
  } catch (error) {
    console.error("❌ Error generating image:", error.message);
    return null;
  }
};
export default generateImage;
