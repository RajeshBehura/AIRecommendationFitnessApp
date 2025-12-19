package com.fitness.gateway.user;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class RegisterRequest {

    private String firstName;
    private String lastName;
    private String keycloakId;
    @NotBlank(message= "Email is required")
    @Email(message = "Invalid email format")
    private String email;
    @NotBlank(message = "password is required")
    @Size(min = 6,message = "password must have at least 6 characters")
    private String password;
}
