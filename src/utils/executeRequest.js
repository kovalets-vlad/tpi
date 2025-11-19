export class ApiError extends Error {
    constructor(status, message) {
        super(message);
        this.status = status;
        this.name = "ApiError";
    }
}

export const handleError = async (error) => {
    if (error.response) {
        const { status, data } = error.response;
        let message = data?.message || data?.detail;

        if (data instanceof Blob && data.type === "application/json") {
            try {
                const text = await data.text();
                const json = JSON.parse(text);
                message = json.detail || json.message;
            } catch (e) {}
        }
        const errorMessages = {
            400: "Некоректні дані.",
            401: "Не авторизовано.",
            403: "Доступ заборонено.",
            404: "Ресурс не знайдено.",
            500: "Внутрішня помилка сервера.",
        };

        const finalMessage = message || errorMessages[status] || `Unhandled response status: ${status}`;

        throw new ApiError(status, finalMessage);
    } else if (error.request) {
        throw new ApiError(null, "Немає відповіді від сервера. Перевірте з'єднання.");
    } else {
        throw new ApiError(null, error.message || "Сталася невідома помилка.");
    }
};

export const executeRequest = async (request, successStatus = 200, successMessage = "Success") => {
    try {
        const response = await request();
        if (response?.status === successStatus) {
            return response.data || successMessage;
        }
        throw new Error(`Unexpected response status: ${response.status}`);
    } catch (error) {
        await handleError(error);
    }
};
