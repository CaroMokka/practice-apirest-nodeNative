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

        res.setHeader("Content-Type", "aplication/json");
        res.writeHead(200);
        return res.end(
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

          const encontrado = contentJS.some((animal) => {
            return (
                String(animal.especie).toLowerCase() ==
                String(body.especie).toLowerCase() &&
                String(animal.nombre).toLowerCase() ==
                String(body.nombre).toLowerCase()
            );
          });

          if(encontrado){
            res.writeHead(409, { "Content-Type": "application/json" })
            return res.end(JSON.stringify({ message: "No es posible registrar, el animal ya existe en nuestro registro" }))
          }

          const animal = {
            id: uuidv4(),
            nombre: body.nombre,
            edad: body.edad,
            especie: body.especie,
            habitat: body.habitat,
          };
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
            const encontrado = contentJS.some( animal => {
              return (
                String(animal.especie).toLowerCase() ==
                String(body.especie).toLowerCase() &&
                String(animal.nombre).toLowerCase() ==
                String(body.nombre).toLowerCase() &&
                animal.id != body.id
            );
            })
            if(encontrado){
              res.writeHead(409, {"Content-Type": "application/json"})
              return res.end(JSON.stringify({ message: "Ya existe otro animal con el mismo nombre y especie"}))
            }
            //Filtro para que no se agreguen nuevas propiedades
            body = Object.fromEntries(
              Object.entries(body).filter(
                ([keyValue]) => keyValue in contentJS[index]
              )
            );
            if (body.nombre == contentJS[index].nombre) {
              res.writeHead(400, { "Content-Type": "application/json" });
              return res.end(JSON.stringify({ message: "Este nombre ya existe" }));
            } else { 
              contentJS[index] = { ...contentJS[index], ...body };
              fs.writeFileSync(
                dataAnimales,
                JSON.stringify(contentJS, null, 2),
                "utf-8"
              );
              res.writeHead(200, { "Content-Type": "application/json" });
              return res.end(
                JSON.stringify({ message: "Lista modificada", data: contentJS })
              );
            }
          } else {
            res.writeHead(404, { "Content-Type": "application/json" });
            return res.end(JSON.stringify({ message: "ID de animal no encontrado" }));
          }
        });

        //DELETE
      } else if (method == "DELETE") {
        const params = urlParsed.query;

        const contentText = fs.readFileSync(dataAnimales, "utf-8");
        const contentJS = JSON.parse(contentText);
        const hasAnimal = contentJS.find((animal) => animal.id == params.id);
        if (hasAnimal) {
          const contentModificated = contentJS.filter(
            (animal) => animal.id != params.id
          );
          fs.writeFileSync(
            dataAnimales,
            JSON.stringify(contentModificated, null, 2),
            "utf-8"
          );
          res.writeHead(200, { "Content-Type": "application/json" });
          return res.end(
            JSON.stringify({
              message: "Animal eliminado de la lista",
              data: hasAnimal,
            })
          );
        } else {
          res.writeHead(200, { "Content-Type": "application/json" });
          return res.end(JSON.stringify({ message: "ID ingresado no existe" }));
        }
      }
    }
  })
  .listen(port, () => console.log(`Servidor escuchando en el puerto ${port}`));
