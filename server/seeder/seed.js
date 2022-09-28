import dotenv from 'dotenv'
import connectDB from '../config/db.js'
import User from '../models/userModel.js'
import Category from '../models/categoryModel.js'
import usersSeeder from './users.js'
import categoriesSeeder from './categories.js'

dotenv.config()
connectDB()

const importData =  async () => {

    try {
        
        await User.deleteMany()
        const users = await User.insertMany(usersSeeder)
        const categories = await Category.insertMany(categoriesSeeder)
        console.log('Data imported!');
        process.exit()

    } catch (error) {
        console.log(`${error}`);
        process.exit(1)
    }

}

const destroyData = async () => {
    try {
        
        await User.deleteMany()
        await Category.deleteMany()
        console.log('Data destroyed!');
        process.exit()

    } catch (error) {
        console.log(`${error}`);
        process.exit(1)
    }
}

if(process.argv[2] === '-d'){
    destroyData()
}else{
    importData()
}