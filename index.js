const express = require("express")
const path = require("path");
const app = express();
const mysql = require("mysql");

app.use(express.static(path.join(__dirname, "views"),{ extensions: ["html","htm"]}));
app.use(express.static(path.join(__dirname,"public"),{ extensions: ["css","js"]}));
app.use(express.static(path.join(__dirname,"media"),{ extensions: ["gif","jpg","png"]}));

//by setting PORT environment variable we can change which port the app listens on 
//defaults to 8000
const port = process.env.PORT || 8000;
app.listen(port, (err) => {
    if (err) throw err;
    console.log(`server started on port ${port}`);
    console.log(process.env.PORT);
});

app.get("/", (req, res) => {
    res.send("index");

});

app.get("/contact", (req, res) => {
    res.send("contact");
    
});

app.get("/register", (req, res) => {
    res.send("register");
});

app.get("/packages", (req, res) => {
    // Added by Elias Nahas
    var dbh = getConnection();
    dbn.connect((err) => {
        if (err) throw err;
        var sql = "SELECT `PkgName`, `PkgStartDate`, `PkgEndDate`, `PkgDesc`, `PkgBasePrice` FROM `packages`";
        dbh.query(sql, (err, result, fields) => {
            if (err) throw err;
            res.send("packages", { result: result });
        });
        dbh.end((err) => {
            if (err) throw err;
            console.log("Disconnected from database.");
        });
    });
});


app.use((req,res, next) => {
    res.status(404).sendFile(__dirname + "/views/404.html");
});

// Added by Elias Nahas
function getConnection() {
    return mysql.createConnection({
        host: "localhost",
        user: "travelexperts",
        password: "password",
        database: "travelexperts"
    });
};