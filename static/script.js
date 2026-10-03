const imageInput =
    document.getElementById("imageInput");

const uploadArea =
    document.getElementById("uploadArea");

const previewImage =
    document.getElementById("previewImage");

const emptyPreview =
    document.getElementById("emptyPreview");

const applyBtn =
    document.getElementById("applyBtn");

const downloadBtn =
    document.getElementById("downloadBtn");

const resetBtn =
    document.getElementById("resetBtn");


let currentFilename = null;
let rotation = 0;


/* =========================
   SLIDERS
========================= */

const sliders = [
    "brightness",
    "contrast",
    "saturation",
    "sharpness",
    "blur",
    "grayscale"
];


sliders.forEach(id => {

    const slider =
        document.getElementById(id);

    const output =
        document.getElementById(
            id + "Value"
        );


    slider.addEventListener(
        "input",
        () => {

            const value =
                slider.value;


            if (id === "grayscale") {

                output.textContent =
                    Math.round(value * 100) + "%";

            } else {

                output.textContent =
                    value;
            }


            updatePreview();

        }
    );

});


/* =========================
   UPLOAD
========================= */

imageInput.addEventListener(
    "change",
    function () {

        const file =
            this.files[0];

        if (!file) return;

        uploadImage(file);

    }
);


async function uploadImage(file) {

    const formData =
        new FormData();

    formData.append(
        "image",
        file
    );


    try {

        uploadArea.style.opacity =
            "0.5";


        const response =
            await fetch(
                "/upload",
                {
                    method: "POST",
                    body: formData
                }
            );


        const data =
            await response.json();


        if (!data.success) {

            alert(data.error);

            return;
        }


        /* Store filename */

        currentFilename =
            data.filename;


        /* SHOW IMAGE */

        previewImage.src =
            data.url + "?t=" + Date.now();


        previewImage.style.display =
            "block";


        emptyPreview.style.display =
            "none";


        /* Enable download */

        downloadBtn.disabled =
            false;


        /* Reset editor */

        resetControls();


        console.log(
            "Uploaded:",
            data.url
        );


    } catch (error) {

        console.error(error);

        alert(
            "Unable to upload the image."
        );


    } finally {

        uploadArea.style.opacity =
            "1";
    }
}


/* =========================
   PREVIEW FILTER
========================= */

function updatePreview() {

    if (!currentFilename)
        return;


    const brightness =
        document.getElementById(
            "brightness"
        ).value;


    const contrast =
        document.getElementById(
            "contrast"
        ).value;


    const saturation =
        document.getElementById(
            "saturation"
        ).value;


    const grayscale =
        document.getElementById(
            "grayscale"
        ).value;


    const blur =
        document.getElementById(
            "blur"
        ).value;


    previewImage.style.filter = `
        brightness(${brightness})
        contrast(${contrast})
        saturate(${saturation})
        grayscale(${grayscale})
        blur(${blur}px)
    `;


    previewImage.style.transform =
        `rotate(${rotation}deg)`;

}


/* =========================
   APPLY REAL EDIT
========================= */

applyBtn.addEventListener(
    "click",
    async function () {


        if (!currentFilename) {

            alert(
                "Please upload a photo first."
            );

            return;
        }


        applyBtn.textContent =
            "Applying...";


        const editData = {

            filename:
                currentFilename,

            brightness:
                document.getElementById(
                    "brightness"
                ).value,

            contrast:
                document.getElementById(
                    "contrast"
                ).value,

            saturation:
                document.getElementById(
                    "saturation"
                ).value,

            sharpness:
                document.getElementById(
                    "sharpness"
                ).value,

            blur:
                document.getElementById(
                    "blur"
                ).value,

            grayscale:
                document.getElementById(
                    "grayscale"
                ).value,

            rotation:
                rotation
        };


        try {

            const response =
                await fetch(
                    "/edit",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify(
                                editData
                            )
                    }
                );


            const result =
                await response.json();


            if (!result.success) {

                alert(
                    result.error
                );

                return;
            }


            /*
             * IMPORTANT:
             * Replace preview with
             * actual edited image.
             */

            previewImage.src =
                result.url +
                "?t=" +
                Date.now();


            previewImage.style.filter =
                "none";


            previewImage.style.transform =
                "none";


            alert(
                "Your photo has been edited successfully! ✨"
            );


        } catch (error) {

            console.error(error);

            alert(
                "Something went wrong while editing."
            );


        } finally {

            applyBtn.textContent =
                "Apply Changes";
        }

    }
);


/* =========================
   ROTATE LEFT
========================= */

document
    .getElementById("rotateLeft")
    .addEventListener(
        "click",
        () => {

            rotation -= 90;

            updatePreview();

        }
    );


/* =========================
   ROTATE RIGHT
========================= */

document
    .getElementById("rotateRight")
    .addEventListener(
        "click",
        () => {

            rotation += 90;

            updatePreview();

        }
    );


/* =========================
   RESET
========================= */

resetBtn.addEventListener(
    "click",
    resetControls
);


function resetControls() {

    document.getElementById(
        "brightness"
    ).value = 1;


    document.getElementById(
        "contrast"
    ).value = 1;


    document.getElementById(
        "saturation"
    ).value = 1;


    document.getElementById(
        "sharpness"
    ).value = 1;


    document.getElementById(
        "blur"
    ).value = 0;


    document.getElementById(
        "grayscale"
    ).value = 0;


    document.getElementById(
        "brightnessValue"
    ).textContent = "1.0";


    document.getElementById(
        "contrastValue"
    ).textContent = "1.0";


    document.getElementById(
        "saturationValue"
    ).textContent = "1.0";


    document.getElementById(
        "sharpnessValue"
    ).textContent = "1.0";


    document.getElementById(
        "blurValue"
    ).textContent = "0";


    document.getElementById(
        "grayscaleValue"
    ).textContent = "0%";


    rotation = 0;


    previewImage.style.filter =
        "none";


    previewImage.style.transform =
        "none";
}


/* =========================
   DOWNLOAD
========================= */

downloadBtn.addEventListener(
    "click",
    () => {

        if (!currentFilename) {

            alert(
                "Please upload a photo first."
            );

            return;
        }


        window.location.href =
            "/download/" +
            currentFilename;

    }
);


/* =========================
   DRAG & DROP
========================= */

uploadArea.addEventListener(
    "dragover",
    event => {

        event.preventDefault();

        uploadArea.classList.add(
            "dragover"
        );

    }
);


uploadArea.addEventListener(
    "dragleave",
    () => {

        uploadArea.classList.remove(
            "dragover"
        );

    }
);


uploadArea.addEventListener(
    "drop",
    event => {

        event.preventDefault();

        uploadArea.classList.remove(
            "dragover"
        );


        const file =
            event.dataTransfer.files[0];


        if (file) {

            uploadImage(file);

        }

    }
);