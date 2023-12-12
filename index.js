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
    res.render("index");

});
// Created and Added by Mohsen Novin Pour
app.get("/aboutUs", (req, res) => {
    res.render("AboutUs");
});
app.get("/contact", (req, res) => {
    var dbh = getConnection();
    var agencies;
    dbh.query({sql: "SELECT * FROM agencies"}, (err,result) => {
        agencies = result;
        console.log(agencies);
    });
    dbh.query({sql: "select * FROM agents"}, (err, result) => {
        var agents = result;
        res.render("contact",{agents: agents, agencies: agencies});
    });    
});

// Register and Log in Page Created and Added to Index by Mohsen Novin Pour, Allows customers to register with TravelExperts and adds their info to TravelExperts DB and Select An agent
app.get("/register", (req, res) => {
    var dbh = getConnection();

    sqlString = "SELECT `AgentId`, `AgtFirstName`, `AgtMiddleInitial`, `AgtLastName` FROM agents";
    dbh.query({ sql: sqlString }, (err, result) => {
        if (err) throw err;
        agents = result;
        console.log(agents);
        res.render("register",{agents: agents});
    });    
});

app.post("/insertcustomer", (req, res) => {
    var dbh = getConnection();
    var sql = "INSERT INTO `customers`(`CustFirstName`, `CustLastName`, `CustAddress`, `CustCity`, `CustProv`, `CustPostal`, `CustCountry`, `CustHomePhone`, `CustBusPhone`, `CustEmail`, `AgentId`) VALUES (?,?,?,?,?,?,?,?,?,?,?)";
    var data = [ req.body.CustFirstName, req.body.CustLastName, req.body.CustAddress, req.body.CustCity, req.body.CustProv, req.body.CustPostal, req.body.CustCountry, req.body.CustHomePhone, req.body.CustBusPhone, req.body.CustEmail, req.body.AgentId ];
         dbh.query({ sql: sql, values: data }, (err, result) => {
    if (err) throw err;
    var message = "";
    if (result.affectedRows) {
        message = "Thank you for registering with us!";
    } else {
        message = "Registration failed";
    }
    res.render("thank-you", { message: message });       
});    
});

app.post("/login", (req, res) => {
    var message = "";
    if (res.affectedRows) {
        message = "Thank you and welcome back!";
    } else {
        message = "Failed to login"
    }
    res.render("thank-you", { message: message });         
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
    var dbh = getConnection();
    dbh.connect((err) => {
        if (err) throw err;
        var sqlString = "SELECT * FROM packages WHERE PackageId=?";
        dbh.query({ sql: sqlString, values: [req.params.PackageId] }, (err, result) => {
            if (err) throw err;
            package = result;
            dbh.end((err) => {
                if (err) throw err;
                console.log("Disconnected from database");
                res.render("booking", { package: package });
                res.end();

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
        var sql = "INSERT INTO `customers`(`CustFirstName`, `CustLastName`, `CustEmail`) VALUES (?,?,?)";
        var data = [ req.body.CustFirstName, req.body.CustLastName, req.body.CustEmail ];
        dbh.query({ sql: sql, values: data }, (err, result) => {
            if (err) throw err;
            sql = "SELECT max(CustomerId) AS CustomerId FROM `customers`";
            dbh.query({ sql: sql }, (err, result) => {
                if (err) throw err;
                var CustomerId = result[0].CustomerId;
                sql = "INSERT INTO `bookings`(`BookingDate`, `BookingNo`, `CustomerId`, `PackageId`) VALUES (?,?,?,?)";
                var BookingDate = new Date();
                var randomLetter = generate3LetterString();
                var randomNo = generate3NumberString();
                var BookingNo = randomLetter + randomNo;
                var data = [ BookingDate, BookingNo, CustomerId, req.body.PackageId ];
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
// Connection and 404 page added by Mohsen Novin Pour, Throws 404 error page on all possible incorrect URLs 
app.get('*', (req, res) => {
    res.render("404");
});

// Added by Elias Nahas
function getConnection() {
    return mysql.createConnection({
        // Centralized database on Amazon AWS
        // host: "travelexperts.cjaxpywc2bvi.us-east-2.rds.amazonaws.com",
        // user: "travelexperts",
        // password: "78+2R=,]h$49",
        // database: "travelexperts"
        host: "localhost",
        user: "travelexperts",
        password: "password",
        database: "travelexperts"
    });
};