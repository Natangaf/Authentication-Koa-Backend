import "reflect-metadata";
import { AppDataSource } from "./data-source";
import app from "./app";
import { seedAdminUser } from "./seedAdminUser";
const PORT = process.env.PORT || 3000;

AppDataSource.initialize()
  .then(async () => {
    console.log("database connected.");

    await seedAdminUser();
    
    app.listen(PORT, () => {
      console.log(`Server running in port ${PORT}`);
    });
  })
  .catch((error) => console.error("Failed to connect in database:", error));
