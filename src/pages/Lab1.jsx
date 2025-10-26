import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { random, getPeriod, testGenerator } from "../api/Pseudo-RandomNumberGeneration";
import lab1Styles from "../componets/lab1.module.css";
import globalStyles from "../componets/global.module.css";

const MULTIPLIER = process.env.REACT_APP_MULTIPLIER || 3125;
const INCREASE = process.env.REACT_APP_INCREASE || 3;
const COMPARISON_MODULE = process.env.REACT_APP_COMPARISON_MODULE || 8191;
const SHOW_MORE_CHUNK_SIZE = 10000;
const INITIAL_VISIBLE_COUNT = 1000;

const createHeader = () => {
    return `MULTIPLIER=${MULTIPLIER}\nINCREASE=${INCREASE}\nCOMPARISON_MODULE=${COMPARISON_MODULE}\n\n`;
};

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

export default function Lab1() {
    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm();

    const [result, setResult] = useState(null);
    const [errorMessage, setErrorMessage] = useState("");
    const [isFileDownload, setIsFileDownload] = useState(false);
    const [period, setPeriod] = useState(null);
    const [testResult, setTestResult] = useState(null);
    const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_COUNT);

    const onSubmit = async (data) => {
        setErrorMessage("");
        setResult(null);
        setPeriod(null);
        setTestResult(null);
        setVisibleCount(INITIAL_VISIBLE_COUNT);

        try {
            const requestData = {
                count: Number(data.count),
                file: isFileDownload,
            };

            const res = await random(requestData);
            console.log("Результат:", res);

            if (isFileDownload && res) {
                const defaultFileName = "lcg_result.txt";
                const header = createHeader();
                const sequence = res.sequence || [];
                const fileContent = header + sequence.join("\n");
                await saveFile(fileContent, defaultFileName);
            } else {
                setResult(res.sequence);
            }
        } catch (err) {
            setErrorMessage(err.message || "Помилка при виконанні запиту");
        }
    };

    const handleGetPeriod = async () => {
        setErrorMessage("");
        setPeriod(null);
        try {
            const periodResult = await getPeriod();
            setPeriod(periodResult);
        } catch (err) {
            setErrorMessage(err.message || "Помилка при отриманні періоду");
        }
    };

    const handleTestGenerator = async () => {
        setErrorMessage("");
        setTestResult(null);
        try {
            const testData = await testGenerator();
            setTestResult(testData);
        } catch (err) {
            setErrorMessage(err.message || "Помилка при тестуванні генератора");
        }
    };

    const handleDownload = async () => {
        if (!result) return;
        const defaultFileName = "lcg_result.txt";
        const header = createHeader();
        const fileContent = header + result.join("\n");
        await saveFile(fileContent, defaultFileName);
    };

    const handleClear = () => {
        reset();
        setResult(null);
        setPeriod(null);
        setTestResult(null);
        setErrorMessage("");
        setIsFileDownload(false);
        setVisibleCount(INITIAL_VISIBLE_COUNT);
    };

    const handleShowMore = () => {
        setVisibleCount((prevCount) => Math.min(prevCount + SHOW_MORE_CHUNK_SIZE, result.length));
    };

    const visibleData = result?.slice(0, visibleCount);

    return (
        <div className={`${lab1Styles.wrap} ${globalStyles.pageBackground}`}>
            <div className={lab1Styles.container}>
                <div className={lab1Styles.headerRow}>
                    <div>
                        <h1 className={lab1Styles.title}>Лабораторна №1: ГПВЧ</h1>
                        <p className={lab1Styles.subtitle}>
                            Введіть параметри — поля мають валідацію та інформативні повідомлення.
                        </p>
                    </div>
                    <Link to="/" className={globalStyles.link}>
                        ← Назад
                    </Link>
                </div>

                <div className={lab1Styles.card}>
                    <form onSubmit={handleSubmit(onSubmit)} className={lab1Styles.form}>
                        <label className={lab1Styles.label}>Кількість чисел</label>
                        <input
                            type="text"
                            {...register("count", {
                                required: "Введіть кількість чисел",
                                pattern: {
                                    value: /^\d+$/,
                                    message: "Введіть лише цифри",
                                },
                                min: {
                                    value: 1,
                                    message: "Введіть додатне число",
                                },
                            })}
                            placeholder="Введіть кількість чисел"
                            className={lab1Styles.input}
                        />
                        {errors.count && <p className={lab1Styles.error}>{errors.count.message}</p>}

                        <label className={lab1Styles.checkboxLabel}>
                            <input
                                type="checkbox"
                                checked={isFileDownload}
                                onChange={(e) => setIsFileDownload(e.target.checked)}
                            />
                            Завантажити результат як файл
                        </label>

                        <div className={lab1Styles.actions}>
                            <button type="submit" className={globalStyles.primaryBtn}>
                                Запустити
                            </button>
                            <button type="button" onClick={handleClear} className={globalStyles.ghostBtn}>
                                Очистити
                            </button>
                            <button type="button" onClick={handleGetPeriod} className={globalStyles.primaryBtn}>
                                Отримати період
                            </button>
                            <button type="button" onClick={handleTestGenerator} className={globalStyles.primaryBtn}>
                                Тест генератора
                            </button>
                        </div>
                    </form>
                </div>

                <div className={lab1Styles.resultWrap}>
                    <h3 className={lab1Styles.resultTitle}>Результат</h3>
                    <div className={lab1Styles.resultBox}>
                        {errorMessage && <p className={lab1Styles.error}>{errorMessage}</p>}

                        {result && !isFileDownload ? (
                            <div>
                                <p className={lab1Styles.hint}>
                                    Показано: {visibleData.length} / {result.length}
                                </p>
                                <ul className={lab1Styles.resultList}>
                                    {visibleData.map((number, index) => (
                                        <li key={index} className={lab1Styles.resultItem}>
                                            {index + 1}: {Math.floor(number)}
                                        </li>
                                    ))}
                                </ul>

                                <div className={lab1Styles.buttons}>
                                    {visibleCount < result.length && (
                                        <button onClick={handleShowMore} className={globalStyles.ghostBtn}>
                                            Показати ще {SHOW_MORE_CHUNK_SIZE}
                                        </button>
                                    )}
                                    <button onClick={handleDownload} className={globalStyles.primaryBtn}>
                                        Завантажити TXT (всі {result.length})
                                    </button>
                                </div>
                            </div>
                        ) : (
                            !errorMessage && <p className={lab1Styles.hint}>Результат з'явиться тут після виконання.</p>
                        )}

                        {period !== null && (
                            <div>
                                <h4>Період LCG:</h4>
                                <p>{period}</p>
                            </div>
                        )}

                        {testResult && (
                            <div>
                                <h4>Тест генератора (Оцінка π):</h4>
                                <p>
                                    LCG: π ≈ {testResult.LCG.pi_estimate.toFixed(6)}, P = {testResult.LCG.P.toFixed(6)}
                                </p>
                                <p>
                                    Random: π ≈ {testResult.random.pi_estimate.toFixed(6)}, P ={" "}
                                    {testResult.random.P.toFixed(6)}
                                </p>
                                <p>Справжнє π: {testResult.true_pi.toFixed(6)}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
