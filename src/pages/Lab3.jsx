import React, { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import {
    encryptText,
    decryptText,
    encryptFile,
    decryptFile,
    encryptTextToFile,
    decryptFileToText,
} from "../api/cryptoRC5";
import lab3Styles from "../componets/lab3.module.css";
import globalStyles from "../componets/global.module.css";

export default function Lab3() {
    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        setValue,
        getValues,
    } = useForm({
        defaultValues: {
            password: "",
            inputText: "",
            outputText: "",
        },
    });

    const [action, setAction] = useState("encrypt");
    const [mode, setMode] = useState("text");
    const [selectedFile, setSelectedFile] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const fileInputRef = useRef(null);

    const onPrimarySubmit = async (data) => {
        setIsLoading(true);
        setErrorMessage("");

        try {
            if (mode === "text") {
                if (action === "encrypt") {
                    const res = await encryptText(data.password, data.inputText);
                    setValue("outputText", res.encrypted_data_b64);
                } else {
                    const res = await decryptText(data.password, data.inputText);
                    setValue("outputText", res.text);
                }
            } else {
                if (!selectedFile) {
                    setErrorMessage("Виберіть файл");
                    setIsLoading(false);
                    return;
                }
                if (action === "encrypt") {
                    await encryptFile(data.password, selectedFile);
                } else {
                    await decryptFile(data.password, selectedFile);
                }
            }
        } catch (err) {
            setErrorMessage(err.message || "Помилка при виконанні запиту");
        } finally {
            setIsLoading(false);
        }
    };

    const handleEncryptTextToFile = async () => {
        setIsLoading(true);
        setErrorMessage("");
        const { password, inputText } = getValues();

        if (!password) {
            setErrorMessage("Пароль є обов'язковим");
            setIsLoading(false);
            return;
        }
        if (!inputText) {
            setErrorMessage("Введіть текст для шифрування");
            setIsLoading(false);
            return;
        }

        try {
            await encryptTextToFile(password, inputText);
        } catch (err) {
            setErrorMessage(err.message || "Помилка при шифруванні у файл");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDecryptFileToText = async () => {
        setIsLoading(true);
        setErrorMessage("");
        const { password } = getValues();

        if (!selectedFile) {
            setErrorMessage("Виберіть файл");
            setIsLoading(false);
            return;
        }
        if (!password) {
            setErrorMessage("Пароль є обов'язковим");
            setIsLoading(false);
            return;
        }

        try {
            const res = await decryptFileToText(password, selectedFile);
            setMode("text");
            setValue("outputText", res.text);
            setValue("inputText", "");
        } catch (err) {
            setErrorMessage(err.message || "Помилка при дешифруванні у текст");
        } finally {
            setIsLoading(false);
        }
    };

    const handleClear = () => {
        reset();
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

    const getInputPlaceholder = () => {
        if (action === "encrypt") return "Введіть відкритий текст тут...";
        return "Вставте зашифрований (Base64) текст тут...";
    };

    const getOutputPlaceholder = () => {
        if (action === "encrypt") return "Результат шифрування (Base64)...";
        return "Результат дешифрування...";
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

                    <form onSubmit={handleSubmit(onPrimarySubmit)} className={lab3Styles.form}>
                        <label className={lab3Styles.label}>Парольна фраза (ключ)</label>
                        <input
                            type="text"
                            {...register("password", { required: "Пароль є обов'язковим" })}
                            placeholder="Введіть ваш секретний пароль"
                            className={lab3Styles.input}
                        />
                        {errors.password && <p className={lab3Styles.error}>{errors.password.message}</p>}

                        {mode === "text" ? (
                            <>
                                <div className={lab3Styles.textGrid}>
                                    <div className={lab3Styles.textColumn}>
                                        <label className={lab3Styles.label}>
                                            {action === "encrypt" ? "Відкритий текст" : "Шифротекст (Base64)"}
                                        </label>
                                        <textarea
                                            {...register("inputText")}
                                            placeholder={getInputPlaceholder()}
                                            className={lab3Styles.textarea}
                                        />
                                    </div>
                                    <div className={lab3Styles.textColumn}>
                                        <label className={lab3Styles.label}>
                                            {action === "encrypt" ? "Шифротекст (Base64)" : "Відкритий текст"}
                                        </label>
                                        <textarea
                                            {...register("outputText")}
                                            placeholder={getOutputPlaceholder()}
                                            className={lab3Styles.textarea}
                                            readOnly
                                        />
                                    </div>
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
                                {isLoading
                                    ? "Обробка..."
                                    : mode === "text" && action === "encrypt"
                                    ? "Зашифрувати в текст"
                                    : mode === "text" && action === "decrypt"
                                    ? "Дешифрувати в текст"
                                    : mode === "file" && action === "encrypt"
                                    ? "Зашифрувати файл"
                                    : "Дешифрувати файл"}
                            </button>

                            {mode === "text" && action === "encrypt" && (
                                <button
                                    type="button"
                                    onClick={handleEncryptTextToFile}
                                    className={globalStyles.primaryBtn}
                                    disabled={isLoading}
                                >
                                    Зашифрувати у файл
                                </button>
                            )}

                            {mode === "file" && action === "decrypt" && (
                                <button
                                    type="button"
                                    onClick={handleDecryptFileToText}
                                    className={globalStyles.primaryBtn}
                                    disabled={isLoading}
                                >
                                    Дешифрувати в текст
                                </button>
                            )}

                            <button type="button" onClick={handleClear} className={globalStyles.ghostBtn}>
                                Очистити
                            </button>
                        </div>

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
