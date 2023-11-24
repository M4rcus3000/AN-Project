const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cors = require('cors');
const multer = require('multer'); // Add this line for file upload
const path = require('path');
const fs = require('fs'); 
const mammoth = require('mammoth');
const htmlDocx = require('html-docx-js');

const app = express();
const port = 80;

// Replace these with your actual database credentials
const db = mysql.createConnection({
  host: 'db-for-the-win.cth6wfpv9jf0.us-east-1.rds.amazonaws.com',
  user: 'admin',
  password: 'travis114',
  database: 'cloud',
});

// Connect to the database
db.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err);
    return;
  }
  console.log('Connected to the database');
});

// Middleware to parse JSON and form data
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Multer setup for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // The directory where files will be stored
  },
  filename: function (req, file, cb) {
    // Save the file with its original name
    cb(null, file.originalname);
  },
});
const upload = multer({ storage: storage });
// Serve HTML files
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.get('/dashboard.html', (req, res) => {
  res.sendFile(__dirname + '/dashboard.html');
});

// Authentication endpoint
app.post('/authenticate', (req, res) => {
  const { username, password } = req.body;

  // Replace this with your actual database query
  const query = 'SELECT * FROM users WHERE username = ? AND password = ?';

  db.query(query, [username, password], (err, results) => {
    if (err) {
      console.error('Database query error:', err);
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }

    if (results.length > 0) {
      res.json({ success: true, message: 'Login successful' });
    } else {
      res.status(401).json({ success: false, message: 'Invalid username or password' });
    }
  });
});

// File upload endpoint
app.post('/upload', upload.single('file'), (req, res) => {
  const file = req.file;

  if (!file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }

  // Handle the file as needed (e.g., save to storage, process, etc.)
  // For demonstration purposes, we'll just return the file details
  const fileDetails = {
    originalname: file.originalname,
    mimetype: file.mimetype,
    size: file.size,
  };
  res.json({ success: true, message: 'File uploaded successfully', file: fileDetails });
});

app.post('/convert', upload.single('file'), async (req, res) => {
  const file = req.file;

  console.log('Uploaded File:', file);

  if (!file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }

  const inputFilePath = path.join(__dirname, 'uploads', file.originalname);
  const outputFilePath = path.join(__dirname, 'uploads', `${path.parse(file.originalname).name}.html`);

  console.log('Input File Path:', inputFilePath);
  console.log('Output File Path:', outputFilePath);

  if (!fs.existsSync(inputFilePath)) {
    return res.status(400).json({ success: false, message: 'File does not exist' });
  }

  try {
    // Read the file as a buffer
    const data = await fs.promises.readFile(inputFilePath);

    // Convert the buffer to an array buffer
    const arrayBuffer = data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength);

    // Use the parseWordDocxFile function to convert to HTML
    parseWordDocxFile({ files: [{ name: file.originalname, arrayBuffer }] });

    res.json({ success: true, message: 'File uploaded and conversion started successfully' });
  } catch (readError) {
    console.error('Error reading file:', readError);
    res.status(500).json({ success: false, message: 'Error reading file.' });
  }
});

// Add the parseWordDocxFile function
function parseWordDocxFile({ files }) {
  if (!files.length) return;

  var file = files[0];

  console.time();
  mammoth.convertToHtml({ arrayBuffer: file.arrayBuffer }).then(function (resultObject) {
    let result1 = document.querySelector('#result1');
    result1.innerHTML = resultObject.value;
    console.log(resultObject.value);
  });
  console.timeEnd();

  mammoth.extractRawText({ arrayBuffer: file.arrayBuffer }).then(function (resultObject) {
    let result2 = document.querySelector('#result2');
    result2.innerHTML = resultObject.value;
    console.log(resultObject.value);
  });

  mammoth.convertToMarkdown({ arrayBuffer: file.arrayBuffer }).then(function (resultObject) {
    let result3 = document.querySelector('#result3');
    result3.innerHTML = resultObject.value;
    console.log(resultObject.value);
  });
}


app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
