import bcrypt from 'bcryptjs'

const usersSeeder = [
    {
        name:'Admin',
        email:"admin@helpme.com",
        password:bcrypt.hashSync('123456',10),
        isAdmin:true
    },
    {
        name:'elon',
        email:"elon@helpme.com",
        password:bcrypt.hashSync('123456',10),
    },
    {
        name:'zuck',
        email:"zuck@helpme.com",
        password:bcrypt.hashSync('123456',10),
    }
]

export default usersSeeder