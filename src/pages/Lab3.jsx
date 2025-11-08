import React, { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { encryptText, decryptText, encryptFile, decryptFile } from "../api/cryptoRC5";
import lab3Styles from "../componets/lab3.module.css";
import globalStyles from "../componets/global.module.css";

// Копіюємо утиліту saveFile з Lab2, вона знадобиться для збереження тексту
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
        types: [{ description: "Text Files", accept: { "text/plain": [".txt"] } }],
    };
    try {
        const fileHandle = await window.showSaveFilePicker(options);
        const writable = await fileHandle.createWritable();
        await writable.write(content);
        await writable.close();
    } catch (err) {
        if (err.name !== "AbortError") console.error("Error saving file:", err);
    }
};

export default function Lab3() {
    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        setValue,
        getValues,
    } = useForm();

    const [action, setAction] = useState("encrypt"); // 'encrypt' або 'decrypt'
    const [mode, setMode] = useState("text"); // 'text' або 'file'
    const [selectedFile, setSelectedFile] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [textResult, setTextResult] = useState(""); // Для копіювання/збереження тексту

    const fileInputRef = useRef(null);

    const onSubmit = async (data) => {
        setIsLoading(true);
        setErrorMessage("");
        setTextResult(""); // Скидаємо текстовий результат

        try {
            if (mode === "text") {
                // --- РОБОТА З ТЕКСТОМ ---
                if (action === "encrypt") {
                    const res = await encryptText(data.password, data.textData);
                    setValue("textData", res.encrypted_data_b64); // Оновлюємо textarea результатом
                    setTextResult(res.encrypted_data_b64); // Зберігаємо для кнопок
                } else {
                    // Decrypt
                    const res = await decryptText(data.password, data.textData);
                    setValue("textData", res.text); // Оновлюємо textarea результатом
                    setTextResult(res.text);
                }
            } else {
                // --- РОБОТА З ФАЙЛОМ ---
                if (!selectedFile) {
                    setErrorMessage("Виберіть файл");
                    setIsLoading(false);
                    return;
                }
                if (action === "encrypt") {
                    await encryptFile(data.password, selectedFile);
                } else {
                    // Decrypt
                    await decryptFile(data.password, selectedFile);
                }
            }
        } catch (err) {
            setErrorMessage(err.message || "Помилка при виконанні запиту");
        } finally {
            setIsLoading(false);
        }
    };

    const handleClear = () => {
        reset({ password: "", textData: "" }); // Скидаємо поля форми
        setTextResult(null);
        setErrorMessage("");
        setSelectedFile(null);
        setIsLoading(false);
        setTextResult("");
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

    // --- Нові обробники для кнопок "Копіювати" та "Зберегти" ---
    const handleCopyToClipboard = () => {
        const textToCopy = getValues("textData"); // Беремо актуальне значення з textarea
        if (!textToCopy) return;

        // Використовуємо document.execCommand для сумісності в iFrame
        const ta = document.createElement("textarea");
        ta.value = textToCopy;
        ta.style.position = "fixed";
        ta.style.left = "-9999px";
        document.body.appendChild(ta);
        ta.select();
        try {
            document.execCommand("copy");
        } catch (err) {
            console.error("Не вдалося скопіювати", err);
        }
        document.body.removeChild(ta);
    };

    const handleSaveTextFile = () => {
        const textToSave = getValues("textData");
        if (!textToSave) return;
        const defaultName = action === "encrypt" ? "encrypted.txt" : "decrypted.txt";
        saveFile(textToSave, defaultName);
    };

    // --- Змінюємо підказки залежно від режимів ---
    const getTextAreaPlaceholder = () => {
        if (action === "encrypt") return "Введіть відкритий текст тут...";
        return "Вставте зашифрований (Base64) текст тут...";
    };

    const getFileDropzoneText = () => {
        if (selectedFile) {
            return `Вибрано: ${selectedFile.name} (${(selectedFile.size / 1024 / 1024).toFixed(2)} MB)`;
        }
        if (action === "encrypt") return "Натисніть або перетягніть файл для шифрування";
        return "Натисніть або перетягніть .rc5 файл для дешифрування";
    };

    return (
        <div className={`${lab3Styles.wrap} ${globalStyles.pageBackground}`}>
            <div className={lab3Styles.container}>
                <div className={lab3Styles.headerRow}>
                    <div>
                        <h1 className={lab3Styles.title}>Лабораторна №3: Шифрування RC5</h1>
                        <p className={lab3Styles.subtitle}>Шифрування/дешифрування тексту та файлів за паролем.</p>
                    </div>
                    <Link to="/" className={globalStyles.link}>
                        ← Назад
                    </Link>
                </div>

                <div className={lab3Styles.card}>
                    {/* Перемикач Дія: Шифрування / Дешифрування */}
                    <div className={lab3Styles.modeSelector}>
                        <button
                            className={action === "encrypt" ? lab3Styles.activeMode : ""}
                            onClick={() => setAction("encrypt")}
                        >
                            Шифрування
                        </button>
                        <button
                            className={action === "decrypt" ? lab3Styles.activeMode : ""}
                            onClick={() => setAction("decrypt")}
                        >
                            Дешифрування
                        </button>
                    </div>

                    {/* Перемикач Режим: Текст / Файл */}
                    <div className={lab3Styles.modeSelector}>
                        <button
                            className={mode === "text" ? lab3Styles.activeMode : ""}
                            onClick={() => setMode("text")}
                        >
                            Текст
                        </button>
                        <button
                            className={mode === "file" ? lab3Styles.activeMode : ""}
                            onClick={() => setMode("file")}
                        >
                            Файл
                        </button>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className={lab3Styles.form}>
                        {/* Поле для пароля (завжди видиме) */}
                        <label className={lab3Styles.label}>Парольна фраза (ключ)</label>
                        <input
                            type="text"
                            {...register("password", { required: "Пароль є обов'язковим" })}
                            placeholder="Введіть ваш секретний пароль"
                            className={lab3Styles.input}
                        />
                        {errors.password && <p className={lab3Styles.error}>{errors.password.message}</p>}

                        {/* --- Динамічна область: Текст або Файл --- */}
                        {mode === "text" ? (
                            <>
                                <label className={lab3Styles.label}>
                                    {action === "encrypt" ? "Відкритий текст" : "Зашифрований текст (Base64)"}
                                </label>
                                <textarea
                                    {...register("textData")}
                                    placeholder={getTextAreaPlaceholder()}
                                    className={lab3Styles.textarea}
                                />
                                {/* Нові кнопки для тексту */}
                                <div className={lab3Styles.textActions}>
                                    <button
                                        type="button"
                                        onClick={handleCopyToClipboard}
                                        className={globalStyles.ghostBtn}
                                    >
                                        Копіювати
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleSaveTextFile}
                                        className={globalStyles.ghostBtn}
                                    >
                                        Зберегти в .txt
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                <label className={lab3Styles.label}>Файл</label>
                                <div className={lab3Styles.fileInputContainer} onClick={triggerFileSelect}>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleFileChange}
                                        className={lab3Styles.hiddenFileInput}
                                    />
                                    <p className={selectedFile ? lab3Styles.fileName : ""}>{getFileDropzoneText()}</p>
                                </div>
                            </>
                        )}

                        <div className={lab3Styles.actions}>
                            <button type="submit" className={globalStyles.primaryBtn} disabled={isLoading}>
                                {isLoading ? "Обробка..." : "Запустити"}
                            </button>
                            <button type="button" onClick={handleClear} className={globalStyles.ghostBtn}>
                                Очистити
                            </button>
                        </div>

                        {/* --- Область Повідомлень --- */}
                        {errorMessage && <p className={lab3Styles.error}>{errorMessage}</p>}
                        {isLoading && mode === "file" && (
                            <p className={lab3Styles.hint}>
                                Обробка файлу... Це може зайняти час. Завантаження почнеться автоматично.
                            </p>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
}
