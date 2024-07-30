import validator from "validator";

const sanitization = async (data) => {
    let obj = {};
    return await new Promise((resolve, reject) => {
        Object.entries(data).forEach((element) => {
            const [key, value] = element;
            try {
                if (key === "password") {
                    obj[key] = validator.trim(String(value));
                } else {
                    obj[key] = validator.escape(validator.trim(String(value)));
                }
            } catch (error) {
                console.error(`Error sanitizing key ${key} with value ${value}: ${error.message}`);
                reject(error);
            }
        });
        resolve(obj);
    });
};

const isExist = (variable) => {
    return typeof variable !== "undefined" && variable !== null;
};

export { sanitization, isExist };
