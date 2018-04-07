
const express = require('express');
const app = express();
const fs = require('fs');
const {exec} = require('child_process')
const uuid = require('uuid')

const CONTENT_DIRECTORY = process.env.CONTENT_DIRECTORY || './'

app.set('view engine', 'ejs');

app.get('/bundle.js', (req, res) => {
  res.sendFile('./views/bundle.js', {root: __dirname})
})

app.get('/favicon.ico', (req, res) => res.send(null))

const replaceSpaces = path => path.split('%20').join('\ ')

app.use((req, res, next) => {
  const path = replaceSpaces(`./${req.path}`)
  const fullPath = `${CONTENT_DIRECTORY}/${path}`
  const {view, download} = req.query

  fs.stat(fullPath, (err, stat) => {
    if (err) {
      console.error(err)
      res.status(500).send(err)
    }
    const isRoot = !stat

    if (isRoot || stat.isDirectory()) {
      if (download) {
        zipAndReturn(req, res, fullPath, path)
      } else {
        showDirectory(req, res, fullPath, path)
      }
      
    } else {
      res.setHeader("content-type", view ? mimeType(path) : 'application/file');
      fs.createReadStream(fullPath).pipe(res);
    }
    
  
   
  })
})

const mimeType = path => {
  const filename = path.split('/').pop()
  const extension = filename.split('.').pop()

  switch(extension) {
    case 'pdf':
      return 'application/pdf';
    default:
      return 'text/plain';
  }
}

const cleanPath = path => path.split('/').filter(x => x).join('/')

const zipAndReturn = (req, res, fullPath, path) => {
  path = cleanPath(path)
  const name = path.split('/').pop()
  const id = uuid()
  exec(`tar -cf temporary_files/${id}.tar.gz ${fullPath}`, (err, stdout, stderr) => {
    res.setHeader("Content-Disposition",  `attachment; filename=${name}.tar.gz`)     
    fs.createReadStream(`temporary_files/${id}.tar.gz`).pipe(res);
  })
}

const showDirectory = (req, res, fullPath, path) => {
    fs.readdir(fullPath, (err, data) => {
              if (err) {
                res.status(500).send(err)
              } else {
                const promises = data.map(name => getStats(name, fullPath))
                Promise.all(promises)
                  .then(stats => {
                    res.render('dir', {
                      breadcrumbs: buildBreadcrums(path),
                      directory: cleanPath(path),
                      items: stats
                    });

                  })
                  .catch(ex => {
                    console.error(ex)
                    res.status(500).send(ex)
                  })
              }
            })
}

const buildBreadcrums = path => {
  path = cleanPath(path)
  
  return path.split('/').reduce((acc, name, i) => {
    acc.push({
      name,
      path: '/' + path.split('/').splice(0, i + 1).filter(x => x).join('/')
    })
    return acc
  }, [])
}


const getStats = (name, dir) => new Promise((resolve, reject) => {
  fs.stat(`${dir}/${name}`, (err, stats) => {
    if (err) reject(err)

    resolve({
      isDirectory: stats && stats.isDirectory(),
      name
    })
  })
})

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`App started, listening on port ${PORT} and serving ${CONTENT_DIRECTORY}`);
});