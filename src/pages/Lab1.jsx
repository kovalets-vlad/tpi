import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { random, getPeriod, testGenerator } from "../api/Pseudo-RandomNumberGeneration";
import lab1Styles from "../componets/lab1.module.css";
import globalStyles from "../componets/global.module.css";

const MULTIPLIER = process.env.REACT_APP_MULTIPLIER || 3125;
const INCREASE = process.env.REACT_APP_INCREASE || 3;
const COMPARISON_MODULE = process.env.REACT_APP_COMPARISON_MODULE || 8191;

const createHeader = () => {
    return `MULTIPLIER=${MULTIPLIER}\nINCREASE=${INCREASE}\nCOMPARISON_MODULE=${COMPARISON_MODULE}\n\n`;
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
    const [showAll, setShowAll] = useState(false);

    const onSubmit = async (data) => {
        setErrorMessage("");
        setResult(null);
        setPeriod(null);
        setTestResult(null);
        setShowAll(false);

        try {
            const requestData = {
                count: Number(data.count),
                file: isFileDownload,
            };

            const res = await random(requestData);
            console.log("Результат:", res);

            if (isFileDownload) {
                const defaultFileName = "random_numbers.txt";
                const fileName = prompt("Введіть ім'я файлу:", defaultFileName);

                if (fileName) {
                    const fileContentWithHeader = createHeader() + res;
                    const url = window.URL.createObjectURL(new Blob([fileContentWithHeader]));
                    const link = document.createElement("a");
                    link.href = url;
                    link.download = fileName.endsWith(".txt") ? fileName : `${fileName}.txt`;
                    document.body.appendChild(link);
                    link.click();
                    link.remove();
                    window.URL.revokeObjectURL(url);
                }
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

    const handleDownload = () => {
        if (!result) return;
        const defaultFileName = "lcg_result.txt";
        const fileName = prompt("Введіть ім'я файлу:", defaultFileName);

        if (!fileName) return;

        const header = createHeader();
        const fileContent = header + result.join("\n");

        const blob = new Blob([fileContent], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = fileName.endsWith(".txt") ? fileName : `${fileName}.txt`;
        a.click();
        URL.revokeObjectURL(url);
    };
    const handleClear = () => {
        reset();
        setResult(null);
        setPeriod(null);
        setTestResult(null);
        setErrorMessage("");
        setIsFileDownload(false);
        setShowAll(false);
    };

    const visibleData = showAll ? result : result?.slice(0, 100);

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
                                <ul className={lab1Styles.resultList}>
                                    {visibleData.map((number, index) => (
                                        <li key={index} className={lab1Styles.resultItem}>
                                            {index + 1}: {Math.floor(number)}
                                        </li>
                                    ))}
                                </ul>

                                {result.length > 100 && (
                                    <div className={lab1Styles.buttons}>
                                        {!showAll && (
                                            <button onClick={() => setShowAll(true)} className={globalStyles.ghostBtn}>
                                                Показати всі ({result.length})
                                            </button>
                                        )}
                                        <button onClick={handleDownload} className={globalStyles.primaryBtn}>
                                            Завантажити TXT
                                        </button>
                                    </div>
                                )}
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
