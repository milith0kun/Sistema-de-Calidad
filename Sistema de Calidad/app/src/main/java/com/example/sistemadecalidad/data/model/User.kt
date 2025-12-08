package com.example.sistemadecalidad.data.model

import com.google.gson.annotations.SerializedName
import com.google.gson.JsonDeserializationContext
import com.google.gson.JsonDeserializer
import com.google.gson.JsonElement
import com.google.gson.JsonParseException
import java.lang.reflect.Type

/**
 * Deserializador personalizado para el campo 'activo'
 * Convierte tanto números (0/1) como booleanos (true/false) a Boolean
 */
class BooleanDeserializer : JsonDeserializer<Boolean> {
    override fun deserialize(
        json: JsonElement?,
        typeOfT: Type?,
        context: JsonDeserializationContext?
    ): Boolean {
        return when {
            json == null || json.isJsonNull -> false
            json.isJsonPrimitive -> {
                val primitive = json.asJsonPrimitive
                when {
                    primitive.isBoolean -> primitive.asBoolean
                    primitive.isNumber -> primitive.asInt != 0
                    primitive.isString -> {
                        val str = primitive.asString.lowercase()
                        str == "true" || str == "1" || str == "yes" || str == "sí"
                    }
                    else -> false
                }
            }
            else -> false
        }
    }
}

/**
 * Modelo de datos para el usuario
 * Basado en la estructura de la tabla usuarios del backend
 */
data class User(
    @SerializedName("id")
    val id: Int,
    
    @SerializedName("nombre")
    val nombre: String,
    
    @SerializedName("apellido")
    val apellido: String? = null,
    
    @SerializedName("email")
    val email: String,
    
    @SerializedName("rol")
    val rol: String, // "ADMIN", "SUPERVISOR", "COCINERO", "EMPLEADO"
    
    @SerializedName("cargo")
    val cargo: String? = null,
    
    @SerializedName("area")
    val area: String? = null, // "COCINA", "SALON", "ADMINISTRACION", "ALMACEN"
    
    @SerializedName("activo")
    val activo: Boolean = true,
    
    @SerializedName("fecha_creacion")
    val fechaCreacion: String? = null
) {
    val nombreCompleto: String
        get() = if (apellido != null) "$nombre $apellido" else nombre
}

/**
 * Modelo para la respuesta de login
 */
data class LoginResponse(
    @SerializedName("success")
    val success: Boolean,
    
    @SerializedName("token")
    val token: String?,
    
    @SerializedName("user")
    val user: User?,
    
    @SerializedName("message")
    val message: String?,
    
    @SerializedName("error")
    val error: String?
)

/**
 * Modelo para la petición de login
 */
data class LoginRequest(
    @SerializedName("email")
    val email: String,
    
    @SerializedName("password")
    val password: String
)

/**
 * Modelo para la petición de registro
 */
data class RegisterRequest(
    @SerializedName("nombre")
    val nombre: String,
    
    @SerializedName("apellido")
    val apellido: String,
    
    @SerializedName("email")
    val email: String,
    
    @SerializedName("password")
    val password: String,
    
    @SerializedName("cargo")
    val cargo: String,
    
    @SerializedName("area")
    val area: String,
    
    @SerializedName("rol")
    val rol: String = "Empleado" // Por defecto, nuevos usuarios son Empleado
)

/**
 * Modelo para la respuesta de registro
 */
data class RegisterResponse(
    @SerializedName("success")
    val success: Boolean,
    
    @SerializedName("token")
    val token: String?,
    
    @SerializedName("message")
    val message: String?,
    
    @SerializedName("error")
    val error: String?
)

/**
 * Modelo para la petición de recuperación de contraseña
 */
data class ForgotPasswordRequest(
    @SerializedName("email")
    val email: String
)

/**
 * Modelo para la respuesta de recuperación de contraseña
 */
data class ForgotPasswordResponse(
    @SerializedName("success")
    val success: Boolean,
    
    @SerializedName("message")
    val message: String?,
    
    @SerializedName("error")
    val error: String?
)