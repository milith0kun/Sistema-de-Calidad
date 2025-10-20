package com.example.sistemadecalidad.data.exceptions

/**
 * Excepción específica para manejar casos de registro duplicado
 * Se lanza cuando se intenta crear un registro que ya existe para el mismo día
 */
class RegistroDuplicadoException(
    message: String = "Ya existe un registro para el día de hoy"
) : Exception(message)