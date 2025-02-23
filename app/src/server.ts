import "reflect-metadata";
import { AppDataSource } from "./data-source";
import app from "./app";
const PORT = process.env.PORT || 3000;

AppDataSource.initialize()

  .then(() => {

    console.log("database connected.");
    app.listen(PORT, () => {
      console.log(`Server running in port ${PORT}`);
    });
  })
  .catch((error) => console.error("Failed to connect in database:", error));
