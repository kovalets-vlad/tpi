import React, { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { hash, hashFile } from "../api/HashFunction";
import lab2Styles from "../componets/lab2.module.css";
import globalStyles from "../componets/global.module.css";

// НОВЕ: Функція збереження файлу, така ж, як у Lab1
// Її краще розмістити поза компонентом, оскільки вона не залежить від стану
const saveFile = async (content, suggestedFileName) => {
    if (!("showSaveFilePicker" in window)) {
        // Запасний варіант для браузерів без підтримки
        const blob = new Blob([content], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = suggestedFileName;
        a.click();
        URL.revokeObjectURL(url);
        return;
    }

    // Сучасний API з діалоговим вікном
    const options = {
        suggestedName: suggestedFileName,
        types: [
            {
                description: "Text Files",
                accept: { "text/plain": [".txt"] },
            },
        ],
    };

    try {
        const fileHandle = await window.showSaveFilePicker(options);
        const writable = await fileHandle.createWritable();
        await writable.write(content);
        await writable.close();
    } catch (err) {
        if (err.name !== "AbortError") {
            console.error("Error saving file:", err);
        }
    }
};

export default function Lab2() {
    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm();

    const [result, setResult] = useState(null);
    const [errorMessage, setErrorMessage] = useState("");
    const [mode, setMode] = useState("text"); // 'text' або 'file'
    const [selectedFile, setSelectedFile] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const fileInputRef = useRef(null);

    const onSubmit = async (data) => {
        setIsLoading(true);
        setErrorMessage("");
        setResult(null);

        // ЗМІНЕНО: Видалено 'requestData', оскільки 'hash' тепер приймає рядок
        try {
            let res;
            if (mode === "text") {
                if (!data.textData) {
                    setErrorMessage("Введіть текст для хешування");
                    setIsLoading(false);
                    return;
                }
                res = await hash(data.textData);
            } else {
                if (!selectedFile) {
                    setErrorMessage("Виберіть файл для хешування");
                    setIsLoading(false);
                    return;
                }
                res = await hashFile(selectedFile);
            }
            setResult(res);
        } catch (err) {
            setErrorMessage(err.message || "Помилка при виконанні запиту");
        } finally {
            setIsLoading(false);
        }
    };

    const handleClear = () => {
        reset();
        setResult(null);
        setErrorMessage("");
        setSelectedFile(null);
        setIsLoading(false);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            setErrorMessage("");
        }
    };

    const triggerFileSelect = () => {
        fileInputRef.current?.click();
    };

    // НОВЕ: Обробник для кнопки завантаження
    const handleDownload = async () => {
        if (!result) return;

        // Визначаємо ім'я файлу
        let suggestedFileName = "md5_result.txt";
        if (mode === "file" && selectedFile) {
            const originalName = selectedFile.name;
            const baseName =
                originalName.lastIndexOf(".") > -1
                    ? originalName.substring(0, originalName.lastIndexOf("."))
                    : originalName;
            suggestedFileName = `${baseName}_md5.txt`;
        }

        // Форматуємо вміст файлу
        const fileContent = `MD5 Хеш: ${result.hex}\nРозмір (байти): ${result.length.toLocaleString("uk-UA")}\n`;

        await saveFile(fileContent, suggestedFileName);
    };

    return (
        <div className={`${lab2Styles.wrap} ${globalStyles.pageBackground}`}>
            <div className={lab2Styles.container}>
                <div className={lab2Styles.headerRow}>
                    <div>
                        <h1 className={lab2Styles.title}>Лабораторна №2: Хеш-функція MD5</h1>
                        <p className={lab2Styles.subtitle}>Введіть текст або завантажте файл для розрахунку хешу.</p>
                    </div>
                    <Link to="/" className={globalStyles.link}>
                        ← Назад
                    </Link>
                </div>

                <div className={lab2Styles.card}>
                    <div className={lab2Styles.modeSelector}>
                        <button
                            className={mode === "text" ? lab2Styles.activeMode : ""}
                            onClick={() => setMode("text")}
                        >
                            Хешувати Текст
                        </button>
                        <button
                            className={mode === "file" ? lab2Styles.activeMode : ""}
                            onClick={() => setMode("file")}
                        >
                            Хешувати Файл
                        </button>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className={lab2Styles.form}>
                        {mode === "text" ? (
                            <>
                                <label className={lab2Styles.label}>Введіть текст</label>
                                <textarea
                                    {...register("textData", {
                                        required: mode === "text" ? "Введіть текст" : false,
                                    })}
                                    placeholder="Введіть довільний текст..."
                                    className={lab2Styles.textarea}
                                />
                                {errors.textData && <p className={lab2Styles.error}>{errors.textData.message}</p>}
                            </>
                        ) : (
                            <>
                                <label className={lab2Styles.label}>Виберіть файл</label>
                                <div className={lab2Styles.fileInputContainer} onClick={triggerFileSelect}>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleFileChange}
                                        className={lab2Styles.hiddenFileInput}
                                    />
                                    {selectedFile ? (
                                        <p className={lab2Styles.fileName}>
                                            Вибрано: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)}{" "}
                                            MB)
                                        </p>
                                    ) : (
                                        <p>Натисніть або перетягніть файл сюди</p>
                                    )}
                                </div>
                            </>
                        )}

                        <div className={lab2Styles.actions}>
                            <button type="submit" className={globalStyles.primaryBtn} disabled={isLoading}>
                                {isLoading ? "Обробка..." : "Запустити"}
                            </button>
                            <button type="button" onClick={handleClear} className={globalStyles.ghostBtn}>
                                Очистити
                            </button>
                        </div>
                    </form>
                </div>

                <div className={lab2Styles.resultWrap}>
                    <h3 className={lab2Styles.resultTitle}>Результат</h3>
                    <div className={lab2Styles.resultBox}>
                        {errorMessage && <p className={lab2Styles.error}>{errorMessage}</p>}

                        {isLoading && (
                            <p className={lab2Styles.hint}>
                                Розрахунок хешу... Це може зайняти час для великих файлів.
                            </p>
                        )}

                        {result ? (
                            <>
                                <div className={lab2Styles.resultData}>
                                    <p>
                                        <strong>MD5 Хеш:</strong>
                                        <span>{result.hex}</span>
                                    </p>
                                    <p>
                                        <strong>Розмір (байти):</strong>
                                        <span>{result.length.toLocaleString("uk-UA")}</span>
                                    </p>
                                </div>

                                <div className={lab2Styles.resultActions}>
                                    <button onClick={handleDownload} className={globalStyles.primaryBtn}>
                                        Завантажити TXT
                                    </button>
                                </div>
                            </>
                        ) : (
                            !errorMessage &&
                            !isLoading && <p className={lab2Styles.hint}>Результат хешування з'явиться тут.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
