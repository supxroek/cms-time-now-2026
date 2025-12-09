import Joi from "joi";

// Helper function to validate data against a schema
export const validate = (schema, data) => {
  const { error, value } = schema.validate(data, { abortEarly: false });

  if (error) {
    const errors = {};
    for (const detail of error.details) {
      errors[detail.path[0]] = detail.message;
    }
    return { isValid: false, errors, value };
  }

  return { isValid: true, errors: null, value };
};

// Login Validation Schema
export const loginSchema = Joi.object({
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required()
    .messages({
      "string.email": "รูปแบบอีเมลไม่ถูกต้อง",
      "string.empty": "กรุณากรอกอีเมล",
      "any.required": "กรุณากรอกอีเมล",
    }),
  password: Joi.string().required().messages({
    "string.empty": "กรุณากรอกรหัสผ่าน",
    "any.required": "กรุณากรอกรหัสผ่าน",
  }),
});

// Example: Check In/Out Note Validation (Optional)
export const attendanceNoteSchema = Joi.object({
  note: Joi.string().max(200).allow("").messages({
    "string.max": "หมายเหตุต้องไม่เกิน 200 ตัวอักษร",
  }),
});
