import { AppDataSource } from "./src/db/dataSource";

AppDataSource.initialize().then(async () => {
    await AppDataSource.dropDatabase()
})