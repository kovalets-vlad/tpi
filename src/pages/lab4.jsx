import React, { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { generateKeys, encryptFileRSA, decryptFileRSA } from "../api/rsa";
import styles from "../componets/lab4.module.css";
import globalStyles from "../componets/global.module.css";

export default function Lab4_RSA() {
    const {
        handleSubmit,
        formState: { errors },
    } = useForm();

    const [mode, setMode] = useState("encrypt");
    const [dataFile, setDataFile] = useState(null);
    const [keyFile, setKeyFile] = useState(null);

    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const dataInputRef = useRef(null);
    const keyInputRef = useRef(null);

    // --- Генерація ключів ---
    const handleGenerateKeys = async () => {
        setIsLoading(true);
        setErrorMessage("");
        try {
            await generateKeys();
        } catch (err) {
            setErrorMessage(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    // --- Шифрування / Дешифрування ---
    const onSubmit = async () => {
        setIsLoading(true);
        setErrorMessage("");

        if (!dataFile) {
            setErrorMessage("Виберіть файл для обробки");
            setIsLoading(false);
            return;
        }
        if (!keyFile) {
            setErrorMessage(
                mode === "encrypt" ? "Виберіть публічний ключ (public.pem)" : "Виберіть приватний ключ (private.pem)"
            );
            setIsLoading(false);
            return;
        }

        try {
            if (mode === "encrypt") {
                await encryptFileRSA(dataFile, keyFile);
            } else {
                await decryptFileRSA(dataFile, keyFile);
            }
        } catch (err) {
            setErrorMessage(err.message || "Сталася помилка");
        } finally {
            setIsLoading(false);
        }
    };

    // --- Хендлери файлів ---
    const handleDataFileChange = (e) => setDataFile(e.target.files[0]);
    const handleKeyFileChange = (e) => setKeyFile(e.target.files[0]);

    const clearForm = () => {
        setDataFile(null);
        setKeyFile(null);
        setErrorMessage("");
        if (dataInputRef.current) dataInputRef.current.value = "";
        if (keyInputRef.current) keyInputRef.current.value = "";
    };

    return (
        <div className={`${styles.wrap} ${globalStyles.pageBackground}`}>
            <div className={styles.container}>
                <div className={styles.headerRow}>
                    <div>
                        <h1 className={styles.title}>Лабораторна №4: RSA + AES</h1>
                        <p className={styles.subtitle}>Гібридне шифрування файлів</p>
                    </div>
                    <Link to="/" className={globalStyles.link}>
                        ← Назад
                    </Link>
                </div>

                {/* БЛОК ГЕНЕРАЦІЇ КЛЮЧІВ */}
                <div className={styles.card}>
                    <h2 className={styles.cardTitle}>Ключі</h2>
                    <p className={styles.desc}>Згенеруйте пару ключів (public.pem та private.pem) у ZIP-архіві.</p>
                    <button onClick={handleGenerateKeys} className={globalStyles.primaryBtn} disabled={isLoading}>
                        {isLoading ? "Генерація..." : "Згенерувати нові ключі"}
                    </button>
                </div>

                {/* ОСНОВНИЙ БЛОК */}
                <div className={styles.card}>
                    {/* Перемикач */}
                    <div className={styles.modeSelector}>
                        <button
                            className={mode === "encrypt" ? styles.activeMode : ""}
                            onClick={() => {
                                setMode("encrypt");
                                clearForm();
                            }}
                        >
                            Шифрування
                        </button>
                        <button
                            className={mode === "decrypt" ? styles.activeMode : ""}
                            onClick={() => {
                                setMode("decrypt");
                                clearForm();
                            }}
                        >
                            Дешифрування
                        </button>
                    </div>

                    <div className={styles.form}>
                        {/* 1. Вибір файлу даних */}
                        <label className={styles.label}>
                            {mode === "encrypt" ? "Файл для шифрування" : "Зашифрований файл (.enc)"}
                        </label>
                        <div className={styles.fileInputContainer} onClick={() => dataInputRef.current?.click()}>
                            <input
                                type="file"
                                ref={dataInputRef}
                                onChange={handleDataFileChange}
                                className={styles.hiddenFileInput}
                            />
                            <p className={dataFile ? styles.fileName : ""}>
                                {dataFile ? `Вибрано: ${dataFile.name}` : "Натисніть, щоб вибрати файл"}
                            </p>
                        </div>

                        {/* 2. Вибір ключа */}
                        <label className={styles.label}>
                            {mode === "encrypt" ? "Публічний ключ (public.pem)" : "Приватний ключ (private.pem)"}
                        </label>
                        <div
                            className={`${styles.fileInputContainer} ${styles.keyContainer}`}
                            onClick={() => keyInputRef.current?.click()}
                        >
                            <input
                                type="file"
                                ref={keyInputRef}
                                onChange={handleKeyFileChange}
                                className={styles.hiddenFileInput}
                                accept=".pem"
                            />
                            <p className={keyFile ? styles.fileName : ""}>
                                {keyFile
                                    ? `Ключ: ${keyFile.name}`
                                    : mode === "encrypt"
                                    ? "Виберіть public.pem"
                                    : "Виберіть private.pem"}
                            </p>
                        </div>

                        {/* Кнопки */}
                        <div className={styles.actions}>
                            <button
                                onClick={handleSubmit(onSubmit)}
                                className={globalStyles.primaryBtn}
                                disabled={isLoading}
                            >
                                {isLoading ? "Обробка..." : mode === "encrypt" ? "Зашифрувати" : "Дешифрувати"}
                            </button>
                            <button onClick={clearForm} className={globalStyles.ghostBtn}>
                                Очистити
                            </button>
                        </div>

                        {errorMessage && <p className={styles.error}>{errorMessage}</p>}
                    </div>
                </div>
            </div>
        </div>
    );
}
