import dotenv from "dotenv";

dotenv.config();

import app from "./app.js";

const port = Number(process.env.PORT) || 5000;

app.listen(port, () => {
  console.log(`Perfect Trade server running on port ${port}`);
});
