const getFilePickerOptions = (filename) => {
    const extension = filename.slice(((filename.lastIndexOf(".") - 1) >>> 0) + 2).toLowerCase();

    const typeMap = {
        txt: { description: "Text File", accept: { "text/plain": [".txt"] } },
        png: { description: "PNG Image", accept: { "image/png": [".png"] } },
        jpg: { description: "JPEG Image", accept: { "image/jpeg": [".jpg", ".jpeg"] } },
        jpeg: { description: "JPEG Image", accept: { "image/jpeg": [".jpg", ".jpeg"] } },
        webp: { description: "WebP Image", accept: { "image/webp": [".webp"] } },
        rc5: { description: "RC5 Encrypted File", accept: { "application/octet-stream": [".rc5"] } },
        enc: { description: "RSA Encrypted File", accept: { "application/octet-stream": [".enc"] } },
        zip: { description: "ZIP Archive", accept: { "application/zip": [".zip"] } },
        pem: { description: "PEM Key", accept: { "application/x-pem-file": [".pem"] } },
        pdf: { description: "PDF File", accept: { "file/pdf": [".pdf"] } },

    };

    const baseOptions = { suggestedName: filename };

    if (typeMap[extension]) {
        baseOptions.types = [typeMap[extension]];
    }

    return baseOptions;
};

export const triggerSaveAs = async (response) => {
    const contentDisposition = response.headers["content-disposition"];
    let filename = "download.bin";

    if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename\*?=['"]?(?:UTF-\d['"]*)?([^;\r\n"']*)['"]?;?/);
        if (filenameMatch && filenameMatch[1]) {
            filename = decodeURIComponent(filenameMatch[1]);
        }
    }

    const blob = response.data;

    if ("showSaveFilePicker" in window) {
        try {
            const options = getFilePickerOptions(filename);

            const fileHandle = await window.showSaveFilePicker(options);
            const writable = await fileHandle.createWritable();
            await writable.write(blob);
            await writable.close();
            return;
        } catch (err) {
            if (err.name === "AbortError") {
                return;
            }
            console.error("Помилка File System Access API, пробуємо старий метод:", err);
        }
    }

    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
};
