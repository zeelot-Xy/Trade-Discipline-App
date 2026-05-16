const apiBaseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const getServerAssetUrl = (assetPath) => {
  if (!assetPath) {
    return null;
  }

  if (/^(https?:\/\/|data:image\/)/i.test(assetPath)) {
    return assetPath;
  }

  const serverBase = apiBaseUrl.replace(/\/api\/?$/, "");
  return `${serverBase}${assetPath.startsWith("/") ? assetPath : `/${assetPath}`}`;
};
