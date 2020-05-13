const axios = require('axios');
const cheerio = require('cheerio');

//variales del sitio se puede cambiar

async function recorrer_paginas() {
    let link_libros = [];
    for (var i = 0; i < 2; i++) {

        console.log('> > RECORRIENDO PAGINA', (i + 1));

        await axios.get('https://www.lectulandia.co/book/page/' + (i + 1) + '/')
            .then(function (response) {
                const $ = cheerio.load(response.data);
                $('.card-click-target').each(function (i, e) {
                    let links = 'https://www.lectulandia.co' + $(e).attr('href');
                    //console.log(links);
                    link_libros.push(links);
                });
            })
            .catch(function (error) {
                console.error(error);
            });
    }

    console.log(`ENCONTRE ${link_libros.length} LIBROS PARA DESCARGAR`);
    info_libros(link_libros);
}

async function info_libros(arrayLibros) {
    for (let detalleLibro of arrayLibros) {
        await axios.get(detalleLibro)
            .then(function (response) {
                const $ = cheerio.load(response.data);

                //Agregamos informacion del libro... Genero y los links de descarga los pondre por separado ya que hay que recorrer, es probable que exista una mejor manera de obtenerlo. Pero esto sirve temporalmente
                let info_libro = {
                    titulo: $('#title > h1').text(),
                    autor: $('#autor > .dinSource').text(),
                    genero: [],
                    portada: $('#cover > img').attr('src'),
                    sinopsis: $('#sinopsis > span').text()
                }

                //Recorremos los generos de los libros para agregar en un array
                $('#genero > .dinSource').each(function (i, e) {
                    info_libro['genero'].push($(e).text());
                })

                //Recorremos los links de descarga (epub y pdf) para agregarlos al objeto
                $('#downloadContainer > a').each(function (i, e) {
                    let links = $(e).attr('href');
                    if (links.charAt(16) == 1) {
                        info_libro['epub'] = decodeURI('https://www.lectulandia.co' + links);
                    } else {
                        info_libro['pdf'] = decodeURI('https://www.lectulandia.co' + links);
                    }
                });

                console.log(info_libro);
            })
            .catch(function (error) {
                console.error(error);
            })
    }
}

//Iniciamos busqueda
recorrer_paginas()