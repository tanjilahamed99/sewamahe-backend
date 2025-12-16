const fs = require("fs-extra");
const { mkdirp } = require("mkdirp");
const sharp = require("sharp");
const path = require("path");
const randomstring = require("randomstring");
const Image = require("../models/Image");
const store = require("../store");
const File = require("../models/File");

exports.uploadImage = async (req, res) => {
    try {
        // ✅ Extract correct file object (Formidable v3+ always returns arrays)
        const image = Array.isArray(req.files.image)
            ? req.files.image[0]
            : req.files.image;

        const { crop } = req.fields || {};

        if (!image) return res.status(400).json({ error: "FILE_REQUIRED" });

        // ✅ Correct property names (v3 uses `mimetype`, `filepath`, `originalFilename`)
        const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
        if (!allowedTypes.includes(image.mimetype)) {
            return res.status(400).json({ error: "INVALID_FILE_TYPE" });
        }

        if (image.size > 5 * 1024 * 1024) {
            return res.status(400).json({ error: "FILE_TOO_LARGE" });
        }

        const shield = randomstring.generate({
            length: 120,
            charset: "alphanumeric",
        });

        // ✅ Use correct name field
        const imageDoc = await new Image({
            name: image.originalFilename,
            author: req.user._id,
            size: image.size,
            shield,
        }).save();

        const folder = `${store.config.dataFolder}/${req.user._id}`;
        await mkdirp(folder);

        const shieldedID = shield + imageDoc._id;
        const baseLocation = `${folder}/${shieldedID}.jpg`;

        // ✅ Use correct file path property
        await sharp(image.filepath).rotate().toFile(baseLocation);

        for (let i = 0; i < store.config.sizes.length; i++) {
            const location = `${folder}/${shieldedID}-${store.config.sizes[i]}.jpg`;
            let size = {};
            if (crop === "square")
                size = {
                    width: store.config.sizes[i],
                    height: store.config.sizes[i],
                };
            else size = { width: store.config.sizes[i] };
            await sharp(image.filepath).rotate().resize(size).toFile(location);
        }
        // await fs.unlink(image.filepath);

        imageDoc.location = baseLocation;
        imageDoc.shieldedID = shieldedID;
        await imageDoc.save();
        res.status(200).json({
            status: 200,
            image: imageDoc,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "SERVER_ERROR" });
    }
};

exports.getImage = (req, res, next) => {
    const { id, size } = req.params;
    Image.findOne({ shieldedID: id })
        .then((descriptor) => {
            if (!descriptor) return res.status(500);

            let location = descriptor.location;

            if (size) {
                location = `${location.substr(
                    0,
                    location.length - 4
                )}-${size}.jpg`;
            }

            fs.access(location, fs.constants.F_OK, (err) => {
                if (err) {
                    console.log(err);
                    return res.status(404).send("Not Found");
                }

                fs.createReadStream(location).pipe(res);
                res.set("Content-type", "image/jpeg");
                res.status(200);
            });
        })
        .catch((err) => {
            return res.status(404).send("Not Found");
        });
};

exports.uploadFile = async (req, res) => {
    try {
        const file = Array.isArray(req.files.file)
            ? req.files.file[0]
            : req.files.file;
        if (!file) return res.status(400).json({ error: "FILE_REQUIRED" });

        const tempPath = file.filepath;
        const ext = path.extname(file.originalFilename); // dynamic extension

        const shield = randomstring.generate({
            length: 120,
            charset: "alphanumeric",
            capitalization: "lowercase",
        });

        const fileDoc = await new File({
            name: file.originalFilename,
            author: req.user._id,
            size: file.size,
            type: file.mimetype,
            shield,
        }).save();

        const folder = `${store.config.dataFolder}/${req.user._id}`;
        await mkdirp(folder);

        const shieldedID = shield + fileDoc._id;
        const location = `${folder}/${shieldedID}${ext}`;

        // Move the file from temp to target location
        await fs.move(tempPath, location, { overwrite: true });

        fileDoc.location = location;
        fileDoc.shieldedID = shieldedID;
        await fileDoc.save();

        res.status(200).json({
            status: 200,
            file: fileDoc,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "SERVER_ERROR" });
    }
};

exports.getFile = async (req, res) => {
    try {
        const { id } = req.params;
        const descriptor = await File.findOne({ shieldedID: id });

        if (!descriptor)
            return res.status(404).json({ error: "FILE_NOT_FOUND" });

        const location = path.resolve(descriptor.location);

        if (!fs.existsSync(location))
            return res.status(404).json({ error: "MISSING_FILE" });

        res.setHeader("Content-Type", descriptor.type);
        res.setHeader(
            "Content-Disposition",
            `attachment; filename="${descriptor.name}"`
        );

        const stream = fs.createReadStream(location);
        stream.pipe(res);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "SERVER_ERROR" });
    }
};
