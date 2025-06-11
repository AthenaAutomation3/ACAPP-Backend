import express, { urlencoded } from "express";
import cors from "cors";
import mysql from "mysql2";
import "dotenv/config"; // This automatically loads the .env file
import morgan from "morgan";
import { default as expressWs } from "express-ws";
import WebSocket from "ws";

const app = express();
const ws = expressWs(app);
const clients = new Set();
let previousState = null;
// const wss = new WebSocket('ws://localhost:3006');

// Middleware to parse JSON and URL-encoded bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
// app.use(morgan("dev"));
app.use(urlencoded({ extended: true }));

// Default route
app.get("/", (req, res) => {
 res.send({ error: false, message: "hello world" });
});
console.log(process.env.DB_HOST);

const connection = mysql.createConnection({
 host: process.env.DB_HOST,
 user: process.env.DB_USER,
 password: process.env.DB_PASSWORD,
 port: process.env.DB_PORT,
 database: process.env.DB_NAME,
 multipleStatements: true,
});

connection.connect((err) => {
 if (err) {
 console.error("Error connecting to the database:", err.stack);
 return;
 }
 console.log("Connected to the database.");
});

app.get("/test", (req, res) => {
 const sql = "SELECT 1 + 1 AS solution";
 connection.query(sql, (err, results) => {
 if (err) {
 console.error("Database test query failed:", err.message);
 return res.status(505).send("Database test query failed");
 }
 res.status(200).send({ results });
 });
});

app.get("/start", (req, res) => {
 const sql = 'UPDATE Fields SET value = "True" WHERE field_name = "START"';
 connection.query(sql, (err, results) => {
 if (err) {
 console.error("Database test query failed:", err.message);
 return res.status(505).send("Database test query failed");
 }
 res.status(200).send({ results });
 });
});

app.get("/Fields", (req, res) => {
 const sql = `SELECT value FROM Fields where field_name = ${req.query.field_name}`;
 connection.query(sql, (err, results) => {
 if (err) {
 console.error("Database test query failed:", err.message);
 return res.status(505).send("Database test query failed");
 }
 res.send(results);
 });
});

app.get("/Readings", (req, res) => {
 const sql = `SELECT ID_Reading,OD_Reading FROM Readings ORDER BY ID DESC LIMIT 20`;
 connection.query(sql, (err, results) => {
 if (err) {
 console.error("Database test query failed:", err.message);
 return res.status(505).send("Database test query failed");
 }
 res.send(results);
 });
});

app.get("/Tables", (req, res) => {
 const sql = `SELECT * FROM Df ORDER BY ID`;
 connection.query(sql, (err, results) => {
 if (err) {
 console.error("Database test query failed: ", err.message);
 return res.status(505).send("Database test query failed");
 }
 res.send(results);
 });
});

app.get("/delete/Tables", (req, res) => {
 const sql = `DELETE FROM Df WHERE ID = ${req.query.ID}`;
 connection.query(sql, (err, results) => {
 if (err) {
 console.error("Database test query failed:", err.message);
 return res.status(505).send("Database test query failed");
 }
 res.status(200).send(results);
 });
});

app.post("/insert/Tables", (req, res) => {
 console.log(req.body);
 let keys = "";
 let values = "";
 for (const [key, value] of Object.entries(req.body)) {
 keys += `${key} ,`;
 values += `'${value}' ,`;
 }
 const sql = `INSERT INTO Df (${keys.slice(0, -1)}) VALUE (${values.slice(
 0,
 -1
 )})`;
 console.log(sql);
 connection.query(sql, (err, results) => {
 if (err) {
 console.error("Database test query failed:", err.message);
 return res.status(505).send("Database test query failed");
 }
 res.status(200).send(results);
 });
});

app.post("/update/Tables", (req, res) => {
 console.log(req.body);
 let string = "";
 for (const [key, value] of Object.entries(req.body)) {
 string += `${key} = '${value}' ,`;
 }
 const sql = `UPDATE Df SET ${string.slice(0, -1)} WHERE ID = ${req.body.ID}`;
 console.log(sql);
 connection.query(sql, (err, results) => {
 if (err) {
 console.error("Database test query failed:", err.message);
 return res.status(505).send("Database test query failed");
 }
 res.status(200).send(results);
 });
});

app.post("/login", (req, res) => {
 
 if (req.body.username == "admin" && req.body.password == "admin") {
 res.send({ success: true, session: "DJ06QPIFTAK4AWXB229J" ,role:"admin"});
 }
 else if (req.body.username == "Omkar" && req.body.password == "Omkar") {
 res.send({ success: true, session: "DJ06QPIFTAK4AWXB229A" ,role:"operator"});
 }
 else if (req.body.username == "Shravani" && req.body.password == "Shravani") {
 res.send({ success: true, session: "DJ06QPIFTAK4AWXB229B" ,role:"operator"});
 }
 else if (req.body.username == "Prathmesh" && req.body.password == "Prathmesh") {
 res.send({ success: true, session: "DJ06QPIFTAK4AWXB229C" ,role:"operator"});
 }
 else if (req.body.username == "Pratik" && req.body.password == "Pratik") {
 res.send({ success: true, session: "DJ06QPIFTAK4AWXB229D" ,role:"operator"});
 }
 else {res.send({ success: false });}
});

app.get("/NewEntry", (req, res) => {
 const sql = `UPDATE Fields SET value = "False" WHERE field_name = "NEW_ENTRY"`;
 connection.query(sql, (err, results) => {
 if (err) {
 console.error("Database test query failed:", err.message);
 return res.status(505).send("Database test query failed");
 }
 res.status(200).send({ results });
 });
});

app.get("/Start", (req, res) => {
 const sql = `UPDATE Fields SET value = "True" WHERE field_name = "START"`;
 connection.query(sql, (err, results) => {
 if (err) {
 console.error("Database test query failed:", err.message);
 return res.status(505).send("Database test query failed");
 }
 res.status(200).send({ results });
 });
});
app.get("/Index", (req, res) => {
 const sql = `UPDATE Fields SET value = "False" WHERE field_name = "INSERT_INDEXING"`;
 connection.query(sql, (err, results) => {
 if (err) {
 console.error("Database test query failed:", err.message);
 return res.status(505).send("Database test query failed");
 }
 res.status(200).send({ results });
 });
});


// app.get("/Semifinish", (req, res) => {
// const sql = `UPDATE Fields SET value = "False" WHERE field_name = "SemiFinish"`;
// connection.query(sql, (err, results) => {
// if (err) {
// console.error("Database test query failed:", err.message);
// return res.status(505).send("Database test query failed");
// }
// res.status(200).send({ results });
// });
// });

// app.get("/roughinginsert", (req, res) => {
// const sql = `UPDATE Fields SET value = "False" WHERE field_name = "RoughingInsert"`;
// connection.query(sql, (err, results) => {
// if (err) {
// console.error("Database test query failed:", err.message);
// return res.status(505).send("Database test query failed");
// }
// res.status(200).send({ results });
// });
// });

//roughing insert
app.get("/Tool2", (req, res) => {
 console.log("updating")
 const sql = 'UPDATE Fields SET value = "True" WHERE field_name = "RoughingInsert"';
 
 connection.query(sql, (err, results) => {
 if (err) {
 console.error("Database test query failed:", err.message);
 return res.status(505).send("Database test query failed");
 }
 res.status(200).send({ results });
 });
 console.log("finished")
});

app.get("/updateTool2", (req, res) => {
  console.log("Updating TOOL2 and RoughingInsert...");
  const updateTool2 = `UPDATE Fields SET value = "False" WHERE field_name = "TOOL2"`;
  connection.query(updateTool2, (err, result1) => {
    if (err) {
      console.error("Failed to update TOOL2:", err.message);
      return res.status(500).send("Failed to update TOOL2");
    }
    res.status(200).send({ message: "Tool2 updated successfully" });
  });
});

app.get("/updateTool3", (req, res) => {
  console.log("Updating TOOL3 and RoughingInsert...");
  const updateTool3 = `UPDATE Fields SET value = "False" WHERE field_name = "TOOL3"`;
  connection.query(updateTool3, (err, result1) => {
    if (err) {
      console.error("Failed to update TOOL3:", err.message);
      return res.status(500).send("Failed to update TOOL3");
    }
    console.log("Finished updating TOOL3 and SemiFinish.");
    res.status(200).send({ message: "Tool3 and SemiFinish updated successfully" });
  });
});

app.get("/updateTool8", (req, res) => {
  console.log("Updating TOOL8 and INSERT_INDEXING...");
  const updateTool8 = `UPDATE Fields SET value = "False" WHERE field_name = "TOOL8"`;
  connection.query(updateTool8, (err, result1) => {
    if (err) {
      console.error("Failed to update TOOL8:", err.message);
      return res.status(500).send("Failed to update TOOL8");
    }
    console.log("Finished updating TOOL8 and INSERTINDEXING.");
    res.status(200).send({ message: "Tool8 and INSERTINDEXING updated successfully" });
  });
});

// Set Restart = False
app.get("/updateRestart", (req, res) => {
  console.log("Updating Restart...");
  const sql = 'UPDATE Fields SET value = "False" WHERE field_name = "Restart"';
  connection.query(sql, (err, results) => {
    if (err) {
      console.error("Failed to update Restart:", err.message);
      return res.status(500).send("Failed to update Restart");
    }
    console.log("Finished updating Restart.");
    res.status(200).send({ message: "Restart updated successfully" });
  });
});

// // Set Check_Finish = False (update route)
// app.get("/updateCheck_Finish", (req, res) => {
//   console.log("Updating Check_Finish to False...");
//   const sql = 'UPDATE Fields SET value = "False" WHERE field_name = "Check_Finish"';
//   connection.query(sql, (err, results) => {
//     if (err) {
//       console.error("Failed to update Check_Finish:", err.message);
//       return res.status(500).send("Failed to update Check_Finish");
//     }
//     console.log("Finished updating Check_Finish.");
//     res.status(200).send({ message: "Check_Finish updated successfully" });
//   });
// });


app.get("/stillokTool2", (req, res) => {
 const sql = 'UPDATE Fields SET value = "False" WHERE field_name = "TOOL2"';
 connection.query(sql, (err, results) => {
 if (err) {
 console.error("Database test query failed:", err.message);
 return res.status(505).send("Database test query failed");
 }
 res.status(200).send({ results });
 });
});

app.get("/stillokTool3", (req, res) => {
 const sql = 'UPDATE Fields SET value = "False" WHERE field_name = "TOOL3"';
 connection.query(sql, (err, results) => {
 if (err) {
 console.error("Database test query failed:", err.message);
 return res.status(505).send("Database test query failed");
 }
 res.status(200).send({ results });
 });
});


app.get("/stillokTool8", (req, res) => {
 const sql = 'UPDATE Fields SET value = "False" WHERE field_name = "TOOL8"';
 connection.query(sql, (err, results) => {
 if (err) {
 console.error("Database test query failed:", err.message);
 return res.status(505).send("Database test query failed");
 }
 res.status(200).send({ results });
 });
});

// Still OK = False
app.get("/stillokRestart", (req, res) => {
  const sql = 'UPDATE Fields SET value = "False" WHERE field_name = "Restart"';
  connection.query(sql, (err, results) => {
    if (err) {
      console.error("Database update failed for Restart:", err.message);
      return res.status(505).send("Database update failed for Restart");
    }
    res.status(200).send({ message: "Restart set to False", results });
  });
});

// // Set Check_Finish = False (stillok route)
// app.get("/stillokCheck_Finish", (req, res) => {
//   const sql = 'UPDATE Fields SET value = "False" WHERE field_name = "Check_Finish"';
//   connection.query(sql, (err, results) => {
//     if (err) {
//       console.error("Database update failed for Check_Finish:", err.message);
//       return res.status(505).send("Database update failed for Check_Finish");
//     }
//     res.status(200).send({ message: "Check_Finish set to False", results });
//   });
// });

app.get("/reasonupdate", (req, res) => {
 const sql = 'UPDATE Fields SET value = "False" WHERE field_name = "Reason"';
 connection.query(sql, (err, results) => {
 if (err) {
 console.error("Database test query failed:", err.message);
 return res.status(505).send("Database test query failed");
 }
 res.status(200).send({ results });
 });
});


app.get("/Tool2value", (req, res) => {
 console.log("updating")
 const sql = 'UPDATE Fields SET value = "False" WHERE field_name = "TOOL2"';
 connection.query(sql, (err, results) => {
 if (err) {
 console.error("Database test query failed:", err.message);
 return res.status(505).send("Database test query failed");
 }
 res.status(200).send({ results });
 });
 console.log("finished")
});

//semi-finish
app.get("/Tool3", (req, res) => {
 const sql = 'UPDATE Fields SET value = "True" WHERE field_name = "SemiFinish"';
 connection.query(sql, (err, results) => {
 if (err) {
 console.error("Database test query failed:", err.message);
 return res.status(505).send("Database test query failed");
 }
 res.status(200).send({ results });
 });
});

//insert-indexing
app.get("/Tool8", (req, res) => {
 const sql = 'UPDATE Fields SET value = "True" WHERE field_name = "INSERT_INDEXING"';
 connection.query(sql, (err, results) => {
 if (err) {
 console.error("Database test query failed:", err.message);
 return res.status(505).send("Database test query failed");
 }
 res.status(200).send({ results });
 });
});


/**
 * Route: /Restart
 * Action: Set the value of "Restart" to "True"
 */
app.get("/Restart", (req, res) => {
  console.log("Updating Restart to True...");
  const sql = 'UPDATE Fields SET value = "True" WHERE field_name = "Restart"';
  connection.query(sql, (err, results) => {
    if (err) {
      console.error("Failed to update Restart:", err.message);
      return res.status(505).send("Failed to update Restart");
    }
    console.log("Finished updating Restart.");
    res.status(200).send({ message: "Restart set to True", results });
  });
});

// // Set Check_Finish = True
// app.get("/Check_Finish", (req, res) => {
//   console.log("Updating Check_Finish to True...");
//   const sql = 'UPDATE Fields SET value = "True" WHERE field_name = "Check_Finish"';
//   connection.query(sql, (err, results) => {
//     if (err) {
//       console.error("Failed to update Check_Finish:", err.message);
//       return res.status(505).send("Failed to update Check_Finish");
//     }
//     console.log("Finished updating Check_Finish.");
//     res.status(200).send({ message: "Check_Finish set to True", results });
//   });
// });


app.get("/Toolsvalue", (req, res) => {
 const sql = 'SELECT field_name AS name, value FROM Fields WHERE field_name IN ("TOOL2", "TOOL3", "TOOL8")';

 connection.query(sql, (err, results) => {
 if (err) {
 console.error("Database query failed:", err.message);
 return res.status(500).send("Database query failed");
 }

 res.status(200).json({ values: results });
 });
});

// // Get Check_Finish value
// app.get("/Check_Finishvalue", (req, res) => {
//   const sql = 'SELECT * FROM Fields WHERE field_name = "Check_Finish"';
//   connection.query(sql, (err, results) => {
//     if (err) {
//       console.error("Failed to fetch Check_Finish value:", err.message);
//       return res.status(500).send("Fetch failed");
//     }
//     res.status(200).send(results);
//   });
// });


app.get("/usllsl", (req, res) => {
 const sql = "SELECT Feature, USL, LSL FROM Df"; 
 connection.query(sql, (err, result) => {
 if (err) {
 return res.status(500).json({ error: "Database query failed" });
 }
 
 res.json({ results: result });
 });
});

app.get("/newusllsl", (req, res) => {
  const sql = "SELECT ID, USL, LSL, Mean, USL_controlled, LSL_controlled from Limits ";
  connection.query(sql, (err, result) => {
    if(err){
      return res.status(500).json({error: "Database query failed"});
    }

    res.json({result: result});
  })
})

app.get("/fetchReason", (req, res) => {
 const sql = "SELECT Value from Fields where field_name='Reason';"; 
 connection.query(sql, (err, result) => {
 if (err) {
 return res.status(500).json({ error: "Database query failed" });
 }
 console.log("Reasonsvalue:",result);
 res.json({ results: result });
 });
});

app.put("/updateReason", (req, res) => {
 const sql = "UPDATE Fields SET value='False' WHERE field_name='Reason'";
 connection.query(sql, (err, result) => {
 if (err) {
 return res.status(500).json({ error: "Database query failed" });
 }
 res.json({ results: result });
 });
});

app.get("/currentreading", (req, res) => {
 const query = "SELECT ID_Reading FROM Readings ORDER BY ID DESC LIMIT 1"; // Replace 'your_table' with your actual table name
 
 connection.query(query, (err, results) => {
 if (err) {
 console.error("Error fetching reading:", err);
 res.status(500).send("Error fetching reading");
 return;
 }

 // Check if results exist
 if (results.length > 0) {
 res.json({
 values: [
 {
 ID_Reading: results[0].ID_Reading.toString(), // Ensure it's a string if needed
 },
 ],
 });
 } else {
 res.json({ values: [] });
 }
 });
});







app.post("/addReason", (req, res) => {
 const { reason, currentReading } = req.body; // Get reason and reading from request body
 console.log("Actual reason:", reason);
 console.log("Current reading:", currentReading);

 if (!reason || !currentReading) {
 return res.status(400).json({ message: "Reason and Reading are required" });
 }

 // Insert both reason and currentReading into the table
 const sql = "INSERT INTO reasons (reasons,updated_at, ID_Readings) VALUES (?,UNIX_TIMESTAMP(), ?)"; 

 connection.query(sql, [reason, currentReading], (err, results) => {
 if (err) {
 console.error("Database insert failed:", err.message);
 return res.status(500).json({ message: "Database insert failed" });
 }
 res.status(200).json({ message: "Reason and reading added successfully!", results });
 });
});



app.post('/logindetails', (req, res) => {
 console.log("Request Body:", req.body); // Debugging

 const { username } = req.body;
 console.log("Myusername:", username);

 if (!username) {
 return res.status(400).json({ success: false, message: "Username is required" });
 }

 const query = `
 INSERT INTO user_logins (username, logged_in_at)
 VALUES (?, UNIX_TIMESTAMP());
 `;

 connection.query(query, [username], (err, result) => {
 if (err) {
 console.error('Error inserting data:', err);
 return res.status(500).json({ success: false, message: "Database error" });
 }
 res.json({ success: true, message: "Login record stored successfully" });
 });
});



app.post('/logoutdetails', (req, res) => {
 const { username } = req.body;
 console.log("Yourusername",username);

 if (!username) {
 return res.status(400).json({ success: false, message: "Username is required" });
 }

 const query = `
 UPDATE user_logins ul
JOIN (
 SELECT id FROM user_logins 
 WHERE username = ? 
 AND logged_out_at IS NULL 
 ORDER BY id DESC 
 LIMIT 1
) AS subquery ON ul.id = subquery.id
SET ul.logged_out_at = UNIX_TIMESTAMP();
 `;

 connection.query(query, [username], (err, result) => {
 if (err) {
 console.error("Error updating logout time:", err);
 return res.status(500).json({ success: false, message: "Database error" });
 }
 res.json({ success: true, message: "Logout time recorded successfully" });
 });
});







app.get("/Tool", (req, res) => {
 const sql = `UPDATE Fields SET value = "False" WHERE field_name = "TOOL_BROKEN"`;
 connection.query(sql, (err, results) => {
 if (err) {
 console.error("Database test query failed:", err.message);
 return res.status(505).send("Database test query failed");
 }
 res.status(200).send({ results });
 });
});

app.get("/lastEntry", (req, res) => {
 const sql = `SELECT LSL,USL FROM Df ORDER BY ID DESC LIMIT 1`;
 connection.query(sql, (err, results) => {
 if (err) {
 console.error("Database test query failed:", err.message);
 return res.status(505).send("Database test query failed");
 }
 res.status(200).send({ results });
 });
});

app.get("/extremeshift", (req, res) => {
 
 const sql = `SELECT value FROM Fields WHERE field_name="ExtremeShift"`;
 
 connection.query(sql, (err, results) => {
 if (err) {
 console.error("Database query failed:", err.message);
 return res.status(500).send("Database query failed"); // Use 500 for server errors
 }
 console.log("extreme value",results);
 
 // Assuming results is an array and you want to send it back
 res.status(200).send({ results });
 });
});


app.get("/Setup", (req, res) => {
  const sql = `
    UPDATE Fields 
    SET value = 'True' 
    WHERE field_name = 'SETUP';

    UPDATE Fields 
    SET value = 'False' 
    WHERE field_name = 'CALIBRATION';

    UPDATE Fields 
    SET value = 'False' 
    WHERE field_name IN ('LOW', 'HIGH', 'MEDIUM', 'ZERO', 'START');
  `;
  connection.query(sql, (err, results) => {
    if (err) {
      console.error("Database test query failed:", err.message);
      return res.status(505).send("Database test query failed");
    }
    res.status(200).send({ results });
  });
});


app.get("/Calibration", (req, res) => {
  const sql = `
    UPDATE Fields 
    SET value = "True" 
    WHERE field_name = "CALIBRATION";
    
    UPDATE Fields 
    SET value = "False" 
    WHERE field_name = "SETUP";
  `;
  connection.query(sql, (err, results) => {
    if (err) {
      console.error("Database test query failed:", err.message);
      return res.status(505).send("Database test query failed");
    }
    res.status(200).send({ results });
  });
});

app.get("/BP", (req, res) => {
  const sql = `UPDATE Fields SET value = "True" WHERE field_name = "BP";`;
  connection.query(sql, (err, results) => {
    if (err) {
      console.error("Database test query failed:", err.message);
      return res.status(505).send("Database test query failed");
    }
    res.status(200).send({ results });
  });
});

app.get("/Home", (req, res) => {
  const sql = `
    UPDATE Fields SET value = "False" WHERE field_name = "CALIBRATION"; 
    UPDATE Fields SET value = "False" WHERE field_name = "SETUP";
  `;
  connection.query(sql, (err, results) => {
    if (err) {
      console.error("Database test query failed:", err.message);
      return res.status(505).send("Database test query failed");
    }
    res.status(200).send({ results });
  });
});

const checkFlag = () => {
  connection.query("SELECT * FROM Fields", (error, fieldResults) => {
    if (error) {
      console.error("Error querying database:", error);
      return;
    }
    const fieldData = fieldResults.reduce((acc, item) => {
      acc[item.field_name] = item.Value;
      return acc;
    }, {});

    // Get the latest reading
    connection.query("SELECT ID_Reading FROM Readings ORDER BY ID DESC LIMIT 1", (error, readingResults) => {
      if (error) {
        console.error("Error querying Readings table:", error);
        return;
      }

      const latestReading = readingResults.length > 0 ? readingResults[0].ID_Reading : null;
      const currentState = {
        ...fieldData,
        ID_Reading: latestReading
      };

      // Only send if state has changed
      if (JSON.stringify(currentState) !== JSON.stringify(previousState)) {
        previousState = currentState;
        // Send the complete state to all connected clients
        clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(currentState));
          }
        });
      }
    });
  });
};

// Reduce the check interval to 2000ms to prevent too frequent updates
setInterval(checkFlag, 2000);

app.ws("/ws", (ws, req) => {
  clients.add(ws);
  
  // Send initial state when client connects
  checkFlag();

  ws.on("message", (msg) => {
    console.log("Received message from client:", msg);
  });

  ws.on("close", () => {
    clients.delete(ws);
  });

  ws.send(JSON.stringify({ message: "Connected to WebSocket server!" }));
});

const port = 3006;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

export default app;