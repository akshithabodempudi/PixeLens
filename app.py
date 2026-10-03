from flask import Flask, render_template, request, jsonify, send_from_directory
from PIL import Image, ImageEnhance, ImageFilter
import os
import uuid

app = Flask(__name__)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOAD_FOLDER = os.path.join(BASE_DIR, "static", "uploads")

os.makedirs(UPLOAD_FOLDER, exist_ok=True)


@app.route("/")
def home():
    return render_template("index.html")


# -----------------------------
# UPLOAD IMAGE
# -----------------------------

@app.route("/upload", methods=["POST"])
def upload():

    if "image" not in request.files:
        return jsonify({
            "success": False,
            "error": "No image received"
        }), 400

    file = request.files["image"]

    if file.filename == "":
        return jsonify({
            "success": False,
            "error": "No file selected"
        }), 400

    extension = os.path.splitext(file.filename)[1].lower()

    allowed_extensions = [".jpg", ".jpeg", ".png", ".webp"]

    if extension not in allowed_extensions:
        return jsonify({
            "success": False,
            "error": "Please upload JPG, JPEG, PNG or WEBP"
        }), 400

    filename = f"{uuid.uuid4()}{extension}"

    filepath = os.path.join(
        UPLOAD_FOLDER,
        filename
    )

    file.save(filepath)

    return jsonify({
        "success": True,
        "filename": filename,
        "url": f"/uploads/{filename}"
    })


# -----------------------------
# SERVE UPLOADED IMAGE
# -----------------------------

@app.route("/uploads/<filename>")
def uploaded_file(filename):

    return send_from_directory(
        UPLOAD_FOLDER,
        filename
    )


# -----------------------------
# EDIT IMAGE
# -----------------------------

@app.route("/edit", methods=["POST"])
def edit():

    data = request.get_json()

    filename = data.get("filename")

    if not filename:
        return jsonify({
            "success": False,
            "error": "No filename received"
        }), 400

    filepath = os.path.join(
        UPLOAD_FOLDER,
        filename
    )

    if not os.path.exists(filepath):
        return jsonify({
            "success": False,
            "error": "Image not found"
        }), 404

    try:

        image = Image.open(filepath).convert("RGB")

        brightness = float(
            data.get("brightness", 1)
        )

        contrast = float(
            data.get("contrast", 1)
        )

        saturation = float(
            data.get("saturation", 1)
        )

        sharpness = float(
            data.get("sharpness", 1)
        )

        blur = float(
            data.get("blur", 0)
        )

        grayscale = float(
            data.get("grayscale", 0)
        )

        rotation = int(
            data.get("rotation", 0)
        )


        # Brightness
        image = ImageEnhance.Brightness(
            image
        ).enhance(brightness)


        # Contrast
        image = ImageEnhance.Contrast(
            image
        ).enhance(contrast)


        # Saturation
        image = ImageEnhance.Color(
            image
        ).enhance(saturation)


        # Sharpness
        image = ImageEnhance.Sharpness(
            image
        ).enhance(sharpness)


        # Grayscale
        if grayscale > 0:

            gray = image.convert(
                "L"
            ).convert("RGB")

            image = Image.blend(
                image,
                gray,
                grayscale
            )


        # Blur
        if blur > 0:

            image = image.filter(
                ImageFilter.GaussianBlur(
                    radius=blur
                )
            )


        # Rotation
        if rotation != 0:

            image = image.rotate(
                rotation,
                expand=True
            )


        # Save edited image
        image.save(
            filepath,
            quality=95
        )


        return jsonify({
            "success": True,
            "url": f"/uploads/{filename}"
        })


    except Exception as e:

        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


# -----------------------------
# DOWNLOAD
# -----------------------------

@app.route("/download/<filename>")
def download(filename):

    return send_from_directory(
        UPLOAD_FOLDER,
        filename,
        as_attachment=True
    )


if __name__ == "__main__":
    app.run(
        debug=True,
        host="127.0.0.1",
        port=5000
    )