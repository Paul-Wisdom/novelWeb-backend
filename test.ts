// import { AppDataSource } from "./src/db/dataSource"
// import { Library, User } from "./src/entities"

import { randomBytes } from "crypto";

// const test = async () => { 
// await AppDataSource.query('CREATE SCHEMA public;')
// await AppDataSource.query('GRANT ALL ON SCHEMA public TO postgres;')
// await AppDataSource.query('GRANT ALL ON SCHEMA public TO public;')
// }

// AppDataSource.initialize().then(async () => {
//     const lib = await AppDataSource.getRepository(User).find({relations: ['library']})
//     console.log(lib)
// })

// const date = 'flying snail'
// console.log(date);

// const date2 =  'wanderer tales';
// console.log(date2);

// const p = date.split(' ').join('_')+ '_' + date2.split(' ').join('_')
// console.log(p)

// console.log(new Date())
// console.log(new Date(Date.now() + (30*60*1000)))

const code = randomBytes(2).toString('hex');
console.log(code)