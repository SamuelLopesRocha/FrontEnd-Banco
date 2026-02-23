const API = "https://api-atlasbank.onrender.com";

export const getToken = () => {
  const data = localStorage.getItem("data");
  if (!data) return null;

  const parsed = JSON.parse(data);
  return parsed.token;
};