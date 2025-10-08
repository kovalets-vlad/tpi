import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";

export default function Lab2() {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm();

    const onSubmit = (data) => {
        alert("Форма успішно відправлена: " + JSON.stringify(data));
    };

    return (
        <div className="p-8 max-w-md">
            <h1 className="text-xl font-bold mb-4">Лабораторна №1: ГПВЧ</h1>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                    <label className="block mb-1">Введіть число:</label>
                    <input
                        type="number"
                        {...register("number", { required: "Це поле обов'язкове" })}
                        className="w-full p-2 border rounded"
                    />
                    {errors.number && <p className="text-red-600 text-sm">{errors.number.message}</p>}
                </div>

                <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                    Виконати
                </button>
            </form>

            <Link to="/" className="mt-6 block text-blue-600 underline hover:text-blue-800">
                ← Назад до списку
            </Link>
        </div>
    );
}
