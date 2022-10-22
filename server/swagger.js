// const swaggerAutogen = require('swagger-autogen')()

// const endpointsFiles = ['./endpoints.js']

// swaggerAutogen(outputFile, endpointsFiles)


import swaggerAutogen from 'swagger-autogen'
swaggerAutogen()

const outputFile = './swagger_output.json'


const endpointsFiles = ['./routes/authRoutes.js','./routes/categoryRoutes.js','./routes/fileRoutes.js','./routes/jobRoutes.js','./routes/userRoutes.js']
swaggerAutogen(outputFile, endpointsFiles)