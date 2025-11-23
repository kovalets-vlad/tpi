import React, { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { generateKeys, signText, signFile, verifyFile, verifyText } from "../api/cryptoDSA";
import labStyles from "../componets/lab3.module.css";
import globalStyles from "../componets/global.module.css";

export default function LabDSS() {
    const { register, handleSubmit, reset, setValue, watch } = useForm();

    // --- State ---
    const [mainTab, setMainTab] = useState("sign");
    const [signMode, setSignMode] = useState("text");
    const [verifyMode, setVerifyMode] = useState("text");

    const [dataFile, setDataFile] = useState(null);
    const [keyFile, setKeyFile] = useState(null);

    const [isLoading, setIsLoading] = useState(false);
    const [resultMessage, setResultMessage] = useState("");
    const [isError, setIsError] = useState(false);

    // --- Refs ---
    const dataFileInputRef = useRef(null);
    const keyFileInputRef = useRef(null);
    const signatureFileInputRef = useRef(null);

    const outputSignature = watch("outputSignature");

    // --- ФУНКЦІЯ СКАЧУВАННЯ ПІДПИСУ ---

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

    const handleDownload = async () => {
        let suggestedFileName = "signature.txt";

        if (signMode === "file" && dataFile && keyFile) {
            const originalName = dataFile.name;

            const baseName =
                originalName.lastIndexOf(".") > -1
                    ? originalName.substring(0, originalName.lastIndexOf("."))
                    : originalName;

            suggestedFileName = `${baseName}_md5.txt`;
        }

        await saveFile(outputSignature, suggestedFileName);
    };

    // --- ФУНКЦІЯ ЧИТАННЯ ФАЙЛУ ПІДПИСУ ---
    const handleSignatureFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const content = event.target.result;
            // Вставляємо прочитаний текст у поле форми
            setValue("signatureHex", content.trim());
        };
        reader.readAsText(file);
    };

    const onSubmit = async (data) => {
        setIsLoading(true);
        setResultMessage("");
        setIsError(false);

        try {
            let res = null;

            if (mainTab === "generate") {
                res = await generateKeys(data.keyPrefix);
                if (res && res.success) setResultMessage("Ключі успішно згенеровані та завантажені.");
            } else if (mainTab === "sign") {
                if (!keyFile) throw new Error("Завантажте ПРИВАТНИЙ ключ (.pem)");

                if (signMode === "text") {
                    res = await signText(data.inputText, keyFile);
                } else {
                    if (!dataFile) throw new Error("Виберіть файл для підпису");
                    res = await signFile(dataFile, keyFile);
                }

                if (res) {
                    setValue("outputSignature", res.signature_hex);
                    setResultMessage("Підпис створено.");
                }
            } else if (mainTab === "verify") {
                if (!keyFile) throw new Error("Завантажте ПУБЛІЧНИЙ ключ (.pem)");

                // Перевірка: ТЕКСТ або ФАЙЛ
                if (verifyMode === "text") {
                    // data.inputText береться з того ж поля, що і при підписі (або можна зробити окреме)
                    if (!data.inputText) throw new Error("Введіть текст для перевірки");
                    res = await verifyText(data.inputText, data.signatureHex, keyFile);
                } else {
                    if (!dataFile) throw new Error("Виберіть оригінальний файл");
                    res = await verifyFile(dataFile, data.signatureHex, keyFile);
                }

                if (res) {
                    setResultMessage(res.message);
                    setIsError(res.status !== "success");
                }
            }
        } catch (err) {
            setIsError(true);
            setResultMessage(err.message || "Помилка виконання");
        } finally {
            setIsLoading(false);
        }
    };

    // --- Helpers ---
    const handleDataFileChange = (e) => {
        const file = e.target.files[0];
        if (file) setDataFile(file);
    };
    const handleKeyFileChange = (e) => {
        const file = e.target.files[0];
        if (file) setKeyFile(file);
    };
    const handleClear = () => {
        reset();
        setResultMessage("");
        setDataFile(null);
        setKeyFile(null);
        setIsError(false);
        // Очищення інпутів файлів
        if (dataFileInputRef.current) dataFileInputRef.current.value = "";
        if (keyFileInputRef.current) keyFileInputRef.current.value = "";
        if (signatureFileInputRef.current) signatureFileInputRef.current.value = "";
    };

    return (
        <div className={`${labStyles.wrap} ${globalStyles.pageBackground}`}>
            <div className={labStyles.container}>
                <div className={labStyles.headerRow}>
                    <div>
                        <h1 className={labStyles.title}>DSS: Цифровий підпис</h1>
                        <p className={labStyles.subtitle}>Створення та перевірка ЕЦП (DSA)</p>
                    </div>
                    <Link to="/" className={globalStyles.link}>
                        ← Назад
                    </Link>
                </div>

                <div className={labStyles.card}>
                    {/* НАВІГАЦІЯ ГОЛОВНА */}
                    <div className={labStyles.modeSelector}>
                        <button
                            className={mainTab === "generate" ? labStyles.activeMode : ""}
                            onClick={() => {
                                setMainTab("generate");
                                handleClear();
                            }}
                        >
                            Генерація
                        </button>
                        <button
                            className={mainTab === "sign" ? labStyles.activeMode : ""}
                            onClick={() => {
                                setMainTab("sign");
                                handleClear();
                            }}
                        >
                            Підписати
                        </button>
                        <button
                            className={mainTab === "verify" ? labStyles.activeMode : ""}
                            onClick={() => {
                                setMainTab("verify");
                                handleClear();
                            }}
                        >
                            Перевірити
                        </button>
                    </div>

                    {/* ПІД-НАВІГАЦІЯ (TEXT / FILE) - Спільна для Sign та Verify */}
                    {(mainTab === "sign" || mainTab === "verify") && (
                        <div className={labStyles.modeSelector} style={{ marginTop: "10px", marginBottom: "20px" }}>
                            <button
                                className={
                                    (mainTab === "sign" ? signMode : verifyMode) === "text" ? labStyles.activeMode : ""
                                }
                                onClick={() => {
                                    mainTab === "sign" ? setSignMode("text") : setVerifyMode("text");
                                    setDataFile(null);
                                    setValue("inputText", "");
                                }}
                            >
                                Текст
                            </button>
                            <button
                                className={
                                    (mainTab === "sign" ? signMode : verifyMode) === "file" ? labStyles.activeMode : ""
                                }
                                onClick={() => {
                                    mainTab === "sign" ? setSignMode("file") : setVerifyMode("file");
                                    setValue("inputText", "");
                                }}
                            >
                                Файл
                            </button>
                        </div>
                    )}

                    <form onSubmit={handleSubmit(onSubmit)} className={labStyles.form}>
                        {/* --- GENERATE --- */}
                        {mainTab === "generate" && (
                            <>
                                <label className={labStyles.label}>Префікс ключів</label>
                                <input
                                    type="text"
                                    {...register("keyPrefix", { required: "Введіть префікс" })}
                                    placeholder="user_key"
                                    className={labStyles.input}
                                />
                            </>
                        )}

                        {/* --- SIGN & VERIFY COMMON (KEY UPLOAD) --- */}
                        {(mainTab === "sign" || mainTab === "verify") && (
                            <>
                                <label className={labStyles.label}>
                                    {mainTab === "sign" ? "1. ПРИВАТНИЙ ключ (.pem)" : "1. ПУБЛІЧНИЙ ключ (.pem)"}
                                </label>
                                <div
                                    className={labStyles.fileInputContainer}
                                    onClick={() => keyFileInputRef.current?.click()}
                                    style={{ border: isError && !keyFile ? "1px solid red" : undefined }}
                                >
                                    <input
                                        type="file"
                                        ref={keyFileInputRef}
                                        onChange={handleKeyFileChange}
                                        className={labStyles.hiddenFileInput}
                                        accept=".pem"
                                    />
                                    <p>{keyFile ? `Обрано: ${keyFile.name}` : "Натисніть для вибору ключа..."}</p>
                                </div>
                            </>
                        )}

                        {/* --- SIGN INPUTS --- */}
                        {mainTab === "sign" && (
                            <>
                                {signMode === "text" ? (
                                    <>
                                        <label className={labStyles.label} style={{ marginTop: 15 }}>
                                            2. Текст для підпису
                                        </label>
                                        <textarea
                                            {...register("inputText", { required: "Введіть текст" })}
                                            placeholder="Повідомлення..."
                                            className={labStyles.textarea}
                                        />
                                    </>
                                ) : (
                                    <>
                                        <label className={labStyles.label} style={{ marginTop: 15 }}>
                                            2. Файл для підпису
                                        </label>
                                        <div
                                            className={labStyles.fileInputContainer}
                                            onClick={() => dataFileInputRef.current?.click()}
                                        >
                                            <input
                                                type="file"
                                                ref={dataFileInputRef}
                                                onChange={handleDataFileChange}
                                                className={labStyles.hiddenFileInput}
                                            />
                                            <p>{dataFile ? dataFile.name : "Вибрати файл даних..."}</p>
                                        </div>
                                    </>
                                )}
                                <label className={labStyles.label} style={{ marginTop: 15 }}>
                                    Результат (HEX)
                                </label>
                                <textarea
                                    {...register("outputSignature")}
                                    className={labStyles.textarea}
                                    readOnly
                                    placeholder="Тут з'явиться підпис..."
                                />
                                {outputSignature && (
                                    <button type="button" onClick={handleDownload} className={globalStyles.primaryBtn}>
                                        📥 Скачати підпис (.txt)
                                    </button>
                                )}
                            </>
                        )}

                        {/* --- VERIFY INPUTS --- */}
                        {mainTab === "verify" && (
                            <>
                                {/* Крок 2: Дані (Текст або Файл) */}
                                {verifyMode === "text" ? (
                                    <>
                                        <label className={labStyles.label} style={{ marginTop: 15 }}>
                                            2. Оригінальний текст
                                        </label>
                                        <textarea
                                            {...register("inputText", { required: "Введіть текст" })}
                                            placeholder="Той самий текст, що підписували..."
                                            className={labStyles.textarea}
                                        />
                                    </>
                                ) : (
                                    <>
                                        <label className={labStyles.label} style={{ marginTop: 15 }}>
                                            2. Оригінальний файл
                                        </label>
                                        <div
                                            className={labStyles.fileInputContainer}
                                            onClick={() => dataFileInputRef.current?.click()}
                                        >
                                            <input
                                                type="file"
                                                ref={dataFileInputRef}
                                                onChange={handleDataFileChange}
                                                className={labStyles.hiddenFileInput}
                                            />
                                            <p>{dataFile ? dataFile.name : "Вибрати файл даних..."}</p>
                                        </div>
                                    </>
                                )}

                                {/* Крок 3: Підпис (Вставити або Завантажити) */}
                                <div
                                    style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        marginTop: 15,
                                    }}
                                >
                                    <label className={labStyles.label} style={{ marginBottom: 0 }}>
                                        3. Підпис (HEX)
                                    </label>

                                    {/* Кнопка завантаження файлу підпису */}
                                    <div style={{ position: "relative", overflow: "hidden", display: "inline-block" }}>
                                        <button
                                            type="button"
                                            className={globalStyles.ghostBtn}
                                            style={{ fontSize: "0.8rem", padding: "5px 10px" }}
                                            onClick={() => signatureFileInputRef.current?.click()}
                                        >
                                            📂 Завантажити з файлу
                                        </button>
                                        <input
                                            type="file"
                                            ref={signatureFileInputRef}
                                            onChange={handleSignatureFileUpload}
                                            accept=".txt,.sig"
                                            style={{ display: "none" }}
                                        />
                                    </div>
                                </div>

                                <textarea
                                    {...register("signatureHex", { required: "Вставте підпис" })}
                                    placeholder="Вставте HEX рядок або завантажте файл..."
                                    className={labStyles.textarea}
                                />
                            </>
                        )}

                        <div className={labStyles.actions}>
                            <button type="submit" className={globalStyles.primaryBtn} disabled={isLoading}>
                                {isLoading
                                    ? "Обробка..."
                                    : mainTab === "generate"
                                    ? "Створити та скачати"
                                    : mainTab === "sign"
                                    ? "Підписати"
                                    : "Перевірити"}
                            </button>
                            <button type="button" onClick={handleClear} className={globalStyles.ghostBtn}>
                                Очистити
                            </button>
                        </div>

                        {resultMessage && (
                            <div
                                className={isError ? labStyles.error : labStyles.success}
                                style={{ marginTop: "15px", whiteSpace: "pre-wrap" }}
                            >
                                {resultMessage}
                            </div>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
}
