package backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record ProfileUpdateRequest(
        @NotBlank(message = "First name is required")
        @Size(max = 80, message = "First name must be 80 characters or less")
        String firstName,

        @NotBlank(message = "Last name is required")
        @Size(max = 80, message = "Last name must be 80 characters or less")
        String lastName,

        @Email(message = "Enter a valid email address")
        @NotBlank(message = "Email is required")
        String email,

        @Pattern(regexp = "^[A-Za-z]{3}$", message = "Currency must be a 3-letter code")
        String currency,

        String currentPassword,

        @Size(min = 8, max = 72, message = "New password must be between 8 and 72 characters")
        String newPassword
) {
}
