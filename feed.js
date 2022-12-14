const { validationResult } = require("express-validator");
const clearImage = require("../util/clearImage");
const Post = require("../models/post");

exports.getPosts = (req, res, next) => {
	const currentPage = req.query.page || 1;
	const perPage = 5;
	let totalItems;

	Post.find()
		.count()
		.then((count) => {
			totalItems = count;
			return Post.find()
				.skip((currentPage - 1) * perPage)
				.limit(perPage);
		})
		.then((posts) => {
			res
				.status(200)
				.json({ message: "Fetched posts successfully", posts, totalItems });
		})
		.catch((err) => {
			if (!err.statusCode) err.statusCode = 500;
			next(err);
		});
};

exports.createPost = (req, res, next) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		const error = new Error("Validation failed entered data is incorrect.");
		error.statusCode = 422;
		throw error;
	}

	if (!req.file) {
		const error = new Error("No image provided.");
		error.statusCode = 422;
		throw error;
	}

	const title = req.body.title;
	const content = req.body.content;
	const imageUrl = req.file.path.replace("\\", "/");

	const post = new Post({
		title,
		content,
		imageUrl,
		creator: { name: "Natu" },
	});

	console.log(post);

	post
		.save()
		.then((result) => {
			res.status(201).json({
				message: "Post created successfully!",
				post: result,
			});
		})
		.catch((err) => {
			if (!err.statusCode) err.statusCode = 500;
			next(err);
		});
};

exports.getPost = (req, res, next) => {
	const postId = req.params.postId;

	Post.findById(postId).then((post) => {
		if (!post) {
			const error = new Error("Could not find post.");
			error.statusCode = 404;
			throw error;
		}
		res.status(200).json({ message: "Post fetched.", post });
	});
};

exports.updatePost = (req, res, next) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		const error = new Error("Validation failed entered data is incorrect.");
		error.statusCode = 422;
		throw error;
	}

	const postId = req.params.postId;
	const title = req.body.title;
	const content = req.body.content;
	let imageUrl = req.body.image;

	if (req.file) imageUrl = req.file.path.replace("\\", "/");
	if (!imageUrl) {
		const error = new Error("No file picked.");
		error.statusCode = 422;
		throw error;
	}

	Post.findById(postId)
		.then((post) => {
			if (!post) {
				const error = new Error("Could not find post");
				error.statusCode = 404;
				throw error;
			}

			if (post.imageUrl !== imageUrl) clearImage(post.imageUrl);

			post.title = title;
			post.content = content;
			post.imageUrl = imageUrl;

			return post.save();
		})
		.then((result) => {
			return res.status(200).json({
				message: "Post updated!",
				post: result,
			});
		})
		.catch((err) => {
			if (!err.statusCode) err.statusCode = 500;
			next(err);
		});
};

exports.deletePost = (req, res, next) => {
	const postId = req.params.postId;
	Post.findById(postId)
		.then((post) => {
			if (!post) {
				const error = new Error("Could not find post");
				error.statusCode = 404;
				throw error;
			}
			clearImage(post.imageUrl);
			return Post.findByIdAndRemove(postId);
		})
		.then((result) => {
			console.log(result);
			res.status(200).json({ message: "Deleted Post." });
		})
		.catch((err) => {
			if (!err.statusCode) err.statusCode = 500;
			next(err);
		});
};
