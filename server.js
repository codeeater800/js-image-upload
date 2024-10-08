const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");

const app = express();
const PORT = 3000;

// Middleware to serve static files (like HTML, CSS, and JS)
app.use(express.static("public"));

// Configure Multer to store uploaded files in the user-submissions directory
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = path.join(__dirname, "user-submissions");
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // Save file with a unique timestamp
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 4 * 1024 * 1024 }, // Limit to 4MB
  fileFilter: function (req, file, cb) {
    const filetypes = /jpeg|jpg|png/;
    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = filetypes.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb("Error: Images only!");
    }
  },
});

// Route to handle email validation
app.get("/validate-email", (req, res) => {
  const email = req.query.email;
  const results = [];

  fs.createReadStream("emails.csv")
    .pipe(csv())
    .on("data", (data) => results.push(data))
    .on("end", () => {
      const user = results.find((row) => row.email === email);
      if (user) {
        res.json({ success: true, name: user.name });
      } else {
        res.json({ success: false });
      }
    });
});

app.post("/upload", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res
      .status(400)
      .json({ success: false, message: "No file uploaded" });
  }
  res.json({ success: true, filename: req.file.filename });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
