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

app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");

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
    dbh.connect((err) => {
        if (err) throw err;
        var sql = "SELECT `PackageId`, `PkgName`, `PkgStartDate`, `PkgEndDate`, `PkgDesc`, `PkgBasePrice` FROM `packages`";
        dbh.query(sql, (err, result) => {
            if (err) throw err;
            res.render("packages", { result: result });
        });
        dbh.end((err) => {
            if (err) throw err;
            console.log("Disconnected from database.");
        });
    });
});

// Added by Elias Nahas
app.get("/getpackage/:PackageId", (req, res) => {
    var package = [];
    var agents = [];
    var tripTypes = [];
    var dbh = getConnection();
    dbh.connect((err) => {
        if (err) throw err;
        var sqlString = "SELECT * FROM packages WHERE PackageId=?";
        dbh.query({ sql: sqlString, values: [req.params.PackageId] }, (err, result) => {
            if (err) throw err;
            package = result;
            sqlString = "SELECT `AgentId`, `AgtFirstName`, `AgtMiddleInitial`, `AgtLastName` FROM agents";
            dbh.query({ sql: sqlString }, (err, result) => {
                if (err) throw err;
                agents = result;
                sqlString = "SELECT * FROM triptypes";
                dbh.query({ sql: sqlString }, (err, result) => {
                    if (err) throw err;
                    tripTypes = result;
                    dbh.end((err) => {
                        if (err) throw err;
                        console.log("Disconnected from database");
                        res.render("booking", { package: package, agents: agents, tripTypes: tripTypes });
                        res.end();
                    });
                });
            });
        });
    });
});

// Added by Elias Nahas
app.post("/createbooking", (req, res) => {
    // Following function found at
    // https://codepal.ai/code-generator/query/D5rDijgo/javascript-generate-random-3-letter-string
    function generate3LetterString() {
        const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        var result = "";

        for (var i=0; i<3; i++) {
            const randomIndex = Math.floor(Math.random() * alphabet.length);
            result += alphabet[randomIndex];
        }

        return result;
    }
    // Random number solution from the following page
    // https://www.geeksforgeeks.org/how-to-generate-a-n-digit-number-using-javascript/
    function generate3NumberString() {
        var result = ("" + Math.random()).substring(2,5);
        return result;
    }

    var dbh = getConnection();
    dbh.connect((err) => {
        if (err) throw err;
        var sql = "INSERT INTO `customers`(`CustFirstName`, `CustLastName`, `CustAddress`, `CustCity`, `CustProv`, `CustPostal`, `CustCountry`, `CustHomePhone`, `CustBusPhone`, `CustEmail`, `AgentId`) VALUES (?,?,?,?,?,?,?,?,?,?,?)";
        var data = [ req.body.CustFirstName, req.body.CustLastName, req.body.CustAddress, req.body.CustCity, req.body.CustProv, req.body.CustPostal, req.body.CustCountry, req.body.CustHomePhone, req.body.CustBusPhone, req.body.CustEmail, req.body.AgentId ];
        dbh.query({ sql: sql, values: data }, (err, result) => {
            if (err) throw err;
            sql = "SELECT max(CustomerId) AS CustomerId FROM `customers`";
            dbh.query({ sql: sql }, (err, result) => {
                if (err) throw err;
                var CustomerId = result[0].CustomerId;
                sql = "INSERT INTO `bookings`(`BookingDate`, `BookingNo`, `TravelerCount`, `CustomerId`, `TripTypeId`, `PackageId`) VALUES (?,?,?,?,?,?)";
                var BookingDate = new Date();
                var randomLetter = generate3LetterString();
                var randomNo = generate3NumberString();
                var BookingNo = randomLetter + randomNo;
                var data = [ BookingDate, BookingNo, req.body.TravelerCount, CustomerId, req.body.TripTypeId, req.body.PackageId ];
                dbh.query({ sql: sql, values: data }, (err, result) => {
                    if (err) throw err;
                    var message = "";
                    if (result.affectedRows) {
                        message = "Thank you for booking!";
                    } else {
                        message = "Booking failed";
                    }
                    res.render("thank-you", { message: message });
                });
            });
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