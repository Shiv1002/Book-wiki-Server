//We'll use Express to create a simple web server for us which runs on port if no value is given for
// the environment variable PORT (Heroku will set this value when we deploy our app)

const express = require("express");
const PORT = process.env.PORT || 3001
const path = require('path')
const helmet = require('helmet')
const app = express();

const multer = require('multer')


const storage = multer.diskStorage(
  {
    destination: function (req, file, cb) {
      cb(null, "upload/")
    },
    filename: function (req, file, cb) {
      cb(null, file.fieldname + '.jpg')
    }
  }
)
const upload = multer({ storage: storage })
// We want to use our Node and Express server as an API, so that it can give our React app data
//change that data, or do some other operation only a server can do.

// In our case, we will simply send our React app a message that says "Hello from server!" in a JSON object.

// The code below creates an endpoint for the route /api.

// If our React app makes a GET request to that route, we respond (using res, which stands for response) with our JSON data:

// server/index.js


app.use(helmet())
app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', "*");
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
})


app.use(express.json());

const fs = require('fs');


const RIP = path => {
  var jsonObj
  try {
    var file = fs.readFileSync(path)
    //file in buffer type //change to json object
    jsonObj = JSON.parse(file)
  } catch (error) {
    console.log("There has been error while parsing your file")
    console.log(error)
  }
  return jsonObj
}


app.use("/public", express.static(path.join(__dirname + "/public"), [{ extensions: ['html', 'jpg'] }]))

app.use('/user', (req, res, next) => {
  console.log('Request Original:', path.join(__dirname + req.originalUrl))
  next()
}, (req, res, next) => {
  console.log('Request Type:', req.params)
  next()
})

app.get('/user', (req, res) => {
  // alert("Please enter your name.");
  res.send('USER')
})




app.use("/images", express.static('upload', [{ extensions: ['jpg', '.json', 'json'] }]))

app.get("/api/books", (req, res) => {
  var books = RIP('./books.json')
  res.json(books);
});

// Error handleling middleware
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).send('Something broke!')
})


app.get("/api/users", (req, res) => {
  var users = RIP('./users.json')
  //takes a object as parameter and returns a json string as response
  //object could be anything "",[],{key:value},number
  res.json(users)
});


app.post("/api/users", (req, res) => {
  //trying to read from users.json file

  var Users = RIP('./users.json')

  console.log("Adding", req.body)

  let newdata = { "postId": req.body.postID, "email": req.body.email, "password": req.body.password };

  if (newdata["postId"] === null || newdata["email"] === null || newdata["password"] === null) {
    console.log("Error occurred")
  }
  else {
    Users.push(newdata)
    var NewUsers = JSON.stringify(Users);
    fs.writeFile('./users.json', NewUsers, function (err) {
      if (err) {
        console.log('There has been an error saving your configuration data.');
        console.log(err.message);
        return;
      }

      console.log('Configuration saved successfully.')

    })
    res.json('Configuration saved successfully.')
  }
})



app.post("/api/books", upload.single('Image'), (req, res) => {

  var books = RIP('./books.json')
  let newdata = (req.body)

  console.log("requested file", "requested body", req.file, req.body)
  var srno = Object.keys(books.bookList).length + 1
  console.log(srno)
  var submit = true
  try {
    fs.rename('upload/Image.jpg', 'upload/' + newdata.Name + '.jpg', (err) => console.log(err))
  } catch (err) {
    console.log(err);
  }

  for (var i in newdata) {
    if (newdata[i] == '' || newdata[i] == null) { console.log(i); submit = false }
  }
  //new data image is empty objject
  if (submit) {
    books.bookList.push({ ...newdata, srno: srno, Thumbnail: newdata.Name + ".jpg" })
    fs.writeFile('./books.json', JSON.stringify(books), function (err) {
      if (err) {
        console.log("An error occured while saving your file");
        console.log(err);
      }
      console.log('Configuration saved successfully.')
    })
    res.status(200).send("Data configured!!!")
  } 
    console.log("Erroe ocurred while configuring data")
    console.log("Data is Empty!!!")
  }


})





app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
