const http = require("http");
const url = require("url");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");

const port = 3000;

http
  .createServer((req, res) => {
    const method = req.method;
    const urlParsed = url.parse(req.url, true);
    const pathName = urlParsed.pathname;

    // console.log(req.url)
    // console.log(urlParsed)

    const dataAnimales = `${__dirname}/files/animales.txt`;

    if (pathName == "/animales") {
      //GET
      if (method == "GET") {
        const paramsObj = urlParsed.query;

        const contentText = fs.readFileSync(dataAnimales, "utf-8");
        const contentJS = JSON.parse(contentText);

        const contentFiltered = contentJS.filter((animal) => {
          if (paramsObj.habitat && paramsObj.habitat == animal.habitat) {
            return true;
          }
          if (paramsObj.especie && paramsObj.especie == animal.especie) {
            return true;
          }
          if (!paramsObj.habitat && !paramsObj.especie) {
            return true;
          }
          return false;
        });
        console.log(contentFiltered);

        res.setHeader("Content-Type", "aplication/json");
        res.writeHead(200);
        res.end(
          JSON.stringify({
            message: "Lista de animales",
            data: contentFiltered,
          })
        );

        //POST
      } else if (method == "POST") {
        let body = "";
        req.on("data", (chunk) => {
          body = body + chunk.toString();
        });
        req.on("end", () => {
          body = JSON.parse(body);

          const contentString = fs.readFileSync(dataAnimales, "utf-8");
          const contentJS = JSON.parse(contentString);

          const animal = {
            id: uuidv4(),
            nombre: body.nombre,
            edad: body.edad,
            especie: body.especie,
            habitat: body.habitat,
          };
          if(animal.nombre == body.nombre || animal.especie == body.especie){
            res.writeHead(404, { "Content-Type": "application/json" })
            res.end(JSON.stringify({ message: "Este animal ya existe dentro del registro" }))
          } else {
            contentJS.push(animal);
            fs.writeFileSync(
              dataAnimales,
              JSON.stringify(contentJS, null, 2),
              "utf-8"
            );
            res.writeHead(201, { "Content-Type": "application/json" });
          res.end(
            JSON.stringify({ message: "Registro éxitoso", data: animal })
          );
          }
          
          
          
        });
        //PUT
      } else if (method == "PUT") {
        let body = "";
        req.on("data", (chunk) => {
          body += chunk.toString();
        });
        req.on("end", () => {
          body = JSON.parse(body);

          const contentTxt = fs.readFileSync(dataAnimales, "utf-8");
          let contentJS = JSON.parse(contentTxt);

          const index = contentJS.findIndex((animal) => animal.id == body.id);

          if (index != -1) {
            //Filtro para que no se agreguen nuevas propiedades
            body = Object.fromEntries(
              Object.entries(body).filter(
                ([keyValue]) => keyValue in contentJS[index]
              )
            );
            if (body.nombre == contentJS[index].nombre) {
              res.writeHead(400, { "Content-Type": "application/json"} )
              res.end(JSON.stringify({ message: "Este nombre ya existe" }));
            } else {
              contentJS[index] = { ...contentJS[index], ...body };
              fs.writeFileSync(
                dataAnimales,
                JSON.stringify(contentJS, null, 2),
                "utf-8"
              );
              res.writeHead(200, { "Content-Type": "application/json" });
              res.end(
                JSON.stringify({ message: "Lista modificada", data: contentJS })
              );
            }
          } else {
            res.writeHead(404, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ message: "Animal no encontrado" }));
          }
        });

        //DELETE
      } else if (method == "DELETE") {
        res.end("Eliminar Animales");
      }
    }
  })
  .listen(port, () => console.log(`Servidor escuchando en el puerto ${port}`));
