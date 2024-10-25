const http = require("http")
const url = require("url")
const fs = require("fs")
const { v4: uuidv4 } = require('uuid');

const port = 3000

http.createServer((req, res) => {


    const method = req.method
    const urlParsed = url.parse(req.url, true) 
    const pathName = urlParsed.pathname 

    // console.log(req.url)
    // console.log(urlParsed)

    const dataAnimales = `${__dirname}/files/animales.txt`

    if(pathName == "/animales") {
        //GET
        if(method == "GET") {
            const paramsObj = urlParsed.query
            res.end("Listado de Animales")
            //POST
        } else if(method == "POST") {
            let body = ""
            req.on("data", (chunk) => {
                body = body + chunk.toString()
            })
            req.on("end", () => {
                 body = JSON.parse(body)
                 const contentString = fs.readFileSync(dataAnimales, "utf-8")
                 const contentJS = JSON.parse(contentString)

                 const animal = {
                     id: uuidv4(),
                     nombre: body.nombre,
                     edad: body.edad,
                     especie: body.especie,
                     habitat: body.habitat
                 }

                 contentJS.push(animal)
                 fs.writeFileSync(dataAnimales, JSON.stringify(contentJS), "utf-8")
                 res.setHeader("Content-Type", "aplication/json")
                 res.writeHead(201)
                 res.end(JSON.stringify({ message: "Registro éxitoso", data: animal }))
                })  
                //PUT 
        } else if (method == "PUT") {
            res.end("Actualizar Animales")
            //DELETE 
        } else if (method == "DELETE") {
            res.end("Eliminar Animales") 
        }
    }

    

    //res.end(`Llamado a nuestra API ${method}`)

}).listen(port, () => console.log(`Servidor escuchando en el puerto ${port}`))