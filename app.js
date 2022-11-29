const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
const multer = require("multer");
const { v4: uuidv4 } = require("uuid");
const mongoose = require("mongoose");
const MONGOURL =
	"mongodb+srv://tempacc_26:toor@cluster0.hclx7.mongodb.net/messages";

const feedRoutes = require("./routes/feed");
const authRoutes = require("./routes/auth");

const app = express();

const fileStorage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, "images");
	},
	filename: function (req, file, cb) {
		cb(null, `${uuidv4()}.${file.mimetype.slice(6)}`);
	},
});

const fileFilter = (req, file, cb) => {
	if (
		file.mimetype === "image/png" ||
		file.mimetype === "image/jpg" ||
		file.mimetype === "image/jpeg"
	)
		cb(null, true);
	else cb(null, false);
};

app.use((req, res, next) => {
	res.setHeader("Access-Control-Allow-Origin", "*");
	res.setHeader(
		"Access-Control-Allow-Methods",
		"OPTIONS, GET, POST, PUT, PATCH, DELETE"
	);
	res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
	next();
});
// app.use(bodyParser.urlencoded()); // x-www-form-urlencoded <form>
app.use(bodyParser.json()); // application/json
app.use(multer({ storage: fileStorage, fileFilter }).single("image"));
app.use("/images", express.static(path.join(__dirname, "images")));

app.use("/feed", feedRoutes);
app.use("/auth", authRoutes);

app.use((error, req, res, next) => {
	const status = error.statusCode || 500;
	const message = error.message;
	const data = error.data;
	res.status(status).json({ message, data });
});

mongoose
	.connect(MONGOURL)
	.then((result) => {
		console.log("DB Connected");
		app.listen(8080);
	})
	.catch((err) => {
		console.log(err);
	});
