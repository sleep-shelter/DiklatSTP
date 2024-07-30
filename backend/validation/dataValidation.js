import validator from "validator";
import { isExist, sanitization } from "./sanitization.js";

const dataValid = async (valid, dt) => {
    let pesan = [];
    let data;

    try {
        data = await sanitization(dt);
    } catch (error) {
        console.error(`Sanitization error: ${error.message}`);
        return { message: ["Sanitization failed"], data: {} };
    }

    for (const [key, value] of Object.entries(data)) {
        if (isExist(valid[key])) {
            const validate = valid[key].split(",");
            let msg = [];

            for (const v of validate) {
                try {
                    switch (v) {
                        case "required":
                            if (isExist(data[key]) && validator.isEmpty(data[key])) {
                                msg.push(`${key} is required`);
                            }
                            break;
                        case "isEmail":
                            if (isExist(data[key]) && !validator.isEmail(data[key])) {
                                msg.push(`${key} is invalid email`);
                            }
                            break;
                        case "isStrongPassword":
                            if (isExist(data[key]) && !validator.isStrongPassword(data[key])) {
                                msg.push(`${key} must be at least 8 characters, 1 uppercase, 1 lowercase, 1 number, and 1 symbol`);
                            }
                            break;
                        default:
                            break;
                    }
                } catch (error) {
                    console.error(`Validation error for key ${key} with value ${value}: ${error.message}`);
                    msg.push(`Validation failed for ${key}`);
                }
            }
            pesan.push(...msg);
        }
    }

    return { message: pesan, data };
};

export { dataValid };
