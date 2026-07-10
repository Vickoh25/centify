package backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record VerifyEmailByEmailRequest(
        @Email(message = "Enter a valid email address")
        @NotBlank(message = "Email is required")
        String email,

        @NotBlank(message = "OTP code is required")
        @Pattern(regexp = "^\\d{6}$", message = "OTP code must be 6 digits")
        String code
) {
}
