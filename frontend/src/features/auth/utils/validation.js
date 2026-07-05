export const validateField = (field, value, form) => {
    switch(field) {
      case "name":
        return value.trim() === "" ? "El nombre es obligatorio" : "";
      case "email":
        return !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? "El correo electrónico no es válido" : "";
      case "password":
        return value.length < 6 ? "La contraseña debe tener al menos 6 caracteres" : "";
      case "confirmPassword":
        return value !== form.password ? "Las contraseñas no coinciden" : "";
      default:
        return "";
    }
}