const express = require("express")
const path = require("path");
const app = express();

app.use(express.static(path.join(__dirname, "views"),{ extensions: ["html","htm"]}));
app.use(express.static(path.join(__dirname,"public"),{ extensions: ["css","js"]}));
app.use(express.static(path.join(__dirname,"media"),{ extensions: ["gif","jpg","png"]}));

app.listen(8000, (err)=>{
    if (err) throw err;
    console.log("server started on port 8000");
});

app.get("/", (req, res) => {
    res.send("index");

});

app.get("/contact", (req, res) => {
    res.send("register");
    
});

app.get("/register", (req, res) => {
    res.send("register");
});

app.use((req,res, next) => {
    res.status(404).sendFile(__dirname + "/views/404.html");
});