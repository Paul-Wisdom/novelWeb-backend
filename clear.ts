import { AppDataSource } from "./src/db/dataSource";
import { Admin } from "./src/entities";

AppDataSource.initialize().then(async () => {
    await AppDataSource.dropDatabase()
})