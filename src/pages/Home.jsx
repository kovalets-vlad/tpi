import React, { useMemo } from "react";
import { Link } from "react-router-dom";

import homeStyles from "../componets/home.module.css";
import globalStyles from "../componets/global.module.css";

export default function Home() {
    const labs = useMemo(
        () => [
            { id: 1, title: "Лабораторна №1: ГПВЧ", path: "/lab1", desc: "Практична: генерація псевдоспадкових чисел" },
            { id: 2, title: "Лабораторна №2: MD5", path: "/lab2", desc: "Хешування та перевірка цілісності" },
            { id: 3, title: "Лабораторна №3: RC5", path: "/lab3", desc: "Шифрування симетричним ключем" },
            { id: 4, title: "Лабораторна №4: RSA", path: "/lab4", desc: "Гібридне шифрування файлів" },
            { id: 5, title: "Лабораторна №5:", path: "/lab3", desc: "" },
        ],
        []
    );

    return (
        <div className={`${homeStyles.wrap} ${globalStyles.pageBackground}`}>
            <div className={homeStyles.container}>
                <header className={homeStyles.header}>
                    <div className={homeStyles.brand}>
                        <div>
                            <h1 className={homeStyles.title}>Лабораторні роботи</h1>
                            <p className={homeStyles.subtitle}>
                                Оберіть лабораторну — інтуїтивний інтерфейс для кожного 😊
                            </p>
                        </div>
                    </div>

                    <h1 className={homeStyles.title}>Головна</h1>
                </header>

                <main className={homeStyles.grid}>
                    {labs.map((lab) => (
                        <Link key={lab.id} to={lab.path} className={homeStyles.card}>
                            <div className={homeStyles.cardLeft}>
                                <div className={homeStyles.badge}>{lab.id}</div>
                            </div>
                            <div className={homeStyles.cardBody}>
                                <h2 className={homeStyles.cardTitle}>{lab.title}</h2>
                                <p className={homeStyles.cardDesc}>{lab.desc}</p>
                            </div>
                            <div className={homeStyles.cardArrow} aria-hidden>
                                ›
                            </div>
                        </Link>
                    ))}
                </main>

                <footer className={homeStyles.footer}>Порада: натисни на карточку, щоб перейти до лабораторної.</footer>
            </div>
        </div>
    );
}
