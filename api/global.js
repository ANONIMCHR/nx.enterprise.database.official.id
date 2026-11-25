import { dispatchVercelApi } from "../vercel-api.js";

export default function handler(req, res) {
  return dispatchVercelApi("global", req, res);
}
