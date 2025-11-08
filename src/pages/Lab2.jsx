import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { hash, hashFile } from "../api/hashFunction";
import lab2Styles from "../componets/lab2.module.css";
import globalStyles from "../componets/global.module.css";

const saveFile = async (content, suggestedFileName) => {
    if (!("showSaveFilePicker" in window)) {
        const blob = new Blob([content], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = suggestedFileName;
        a.click();
        URL.revokeObjectURL(url);
        return;
    }
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
    const [mode, setMode] = useState("text");
    const [selectedFile, setSelectedFile] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const [hashToCompare, setHashToCompare] = useState("");
    const [comparisonResult, setComparisonResult] = useState(null);
    const [verificationMode, setVerificationMode] = useState("paste");
    const [verificationFile, setVerificationFile] = useState(null);

    const fileInputRef = useRef(null);
    const verificationFileRef = useRef(null);

    useEffect(() => {
        if (!hashToCompare || !result || !result.hex) {
            setComparisonResult(null);
            return;
        }
        const calculated = result.hex.toLowerCase().trim();
        const provided = hashToCompare.toLowerCase().trim();

        if (calculated === provided) {
            setComparisonResult("match");
        } else {
            setComparisonResult("mismatch");
        }
    }, [result, hashToCompare]);

    const onSubmit = async (data) => {
        setIsLoading(true);
        setErrorMessage("");
        setResult(null);

        try {
            let res;
            if (mode === "text") {
                if (data.textData == null) {
                    setErrorMessage("Помилка: не вдалося отримати дані з поля вводу.");
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
        setHashToCompare("");
        setComparisonResult(null);
        setVerificationMode("paste");
        setVerificationFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
        if (verificationFileRef.current) {
            verificationFileRef.current.value = "";
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

    const handleDownload = async () => {
        if (!result) return;
        let suggestedFileName = "md5_result.txt";
        if (mode === "file" && selectedFile) {
            const originalName = selectedFile.name;
            const baseName =
                originalName.lastIndexOf(".") > -1
                    ? originalName.substring(0, originalName.lastIndexOf("."))
                    : originalName;
            suggestedFileName = `${baseName}_md5.txt`;
        }
        const fileContent = `MD5 Хеш: ${result.hex}\nРозмір (байти): ${result.length.toLocaleString("uk-UA")}\n`;
        await saveFile(fileContent, suggestedFileName);
    };

    const handleHashToCompareChange = (e) => {
        setHashToCompare(e.target.value);
    };

    const triggerVerificationFileSelect = () => {
        verificationFileRef.current?.click();
    };

    const handleVerificationFileRead = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setVerificationFile(file);
        setHashToCompare("");
        setComparisonResult(null);
        setErrorMessage("");
        const reader = new FileReader();
        reader.onload = (event) => {
            const text = event.target.result.trim();
            const hexRegex = /[a-f0-9]{32}/i;
            const match = text.match(hexRegex);
            if (match && match[0]) {
                setHashToCompare(match[0].toLowerCase());
            } else {
                setErrorMessage("Не вдалося знайти 32-символьний MD5 хеш у файлі.");
            }
        };
        reader.onerror = () => {
            setErrorMessage("Не вдалося прочитати файл");
        };
        reader.readAsText(file);
    };

    const renderComparisonMessage = () => {
        if (comparisonResult === "match") {
            return <p className={lab2Styles.match}>✅ Хеші співпадають!</p>;
        }
        if (comparisonResult === "mismatch") {
            return <p className={lab2Styles.mismatch}>❌ Хеші не співпадають.</p>;
        }
        if (errorMessage) return null;
        if (result && !hashToCompare) {
            return <p className={lab2Styles.hint}>Тепер вставте хеш або завантажте файл для порівняння.</p>;
        }
        if (!result && hashToCompare) {
            return <p className={lab2Styles.hint}>Тепер згенеруйте хеш (вище) для порівняння.</p>;
        }
        if (verificationMode === "file" && !verificationFile) {
            return <p className={lab2Styles.hint}>Виберіть .txt файл, що містить MD5 хеш.</p>;
        }
        if (verificationMode === "paste" && !hashToCompare) {
            return <p className={lab2Styles.hint}>Вставте хеш для перевірки.</p>;
        }
        return null;
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
                                    {...register("textData", {})}
                                    placeholder="Введіть довільний текст (можна залишити пустим)"
                                    className={lab2Styles.textarea}
                                />
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

                <div className={lab2Styles.verificationWrap}>
                    <h3 className={lab2Styles.verificationTitle}>Перевірка хешу</h3>
                    <div className={lab2Styles.modeSelector}>
                        <button
                            className={verificationMode === "paste" ? lab2Styles.activeMode : ""}
                            onClick={() => {
                                setVerificationMode("paste");
                                setErrorMessage("");
                            }}
                        >
                            Вставити Хеш
                        </button>
                        <button
                            className={verificationMode === "file" ? lab2Styles.activeMode : ""}
                            onClick={() => {
                                setVerificationMode("file");
                                setErrorMessage("");
                            }}
                        >
                            Завантажити з Файлу
                        </button>
                    </div>
                    <div className={lab2Styles.verificationBox}>
                        {verificationMode === "paste" ? (
                            <>
                                <label className={lab2Styles.label}>Хеш для перевірки</label>
                                <input
                                    type="text"
                                    value={hashToCompare}
                                    onChange={handleHashToCompareChange}
                                    placeholder="Вставте MD5 хеш..."
                                    className={lab2Styles.verificationInput}
                                />
                            </>
                        ) : (
                            <>
                                <label className={lab2Styles.label}>Файл з хешем</label>
                                <div className={lab2Styles.fileInputContainer} onClick={triggerVerificationFileSelect}>
                                    <input
                                        type="file"
                                        ref={verificationFileRef}
                                        onChange={handleVerificationFileRead}
                                        className={lab2Styles.hiddenFileInput}
                                        accept=".txt"
                                    />
                                    {verificationFile ? (
                                        <p className={lab2Styles.fileName}>
                                            Вибрано: {verificationFile.name} (
                                            {(verificationFile.size / 1024).toFixed(2)} KB)
                                        </p>
                                    ) : (
                                        <p>Натисніть, щоб вибрати .txt файл</p>
                                    )}
                                </div>
                                {verificationFile && hashToCompare && !errorMessage && (
                                    <p className={lab2Styles.hint}>Знайдено хеш у файлі: {hashToCompare}</p>
                                )}
                            </>
                        )}
                        <div className={lab2Styles.comparisonResult}>{renderComparisonMessage()}</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
