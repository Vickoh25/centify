package backend.dto;

import jakarta.validation.constraints.NotBlank;

public record VerifyTwoFactorRequest(
        @NotBlank(message = "User ID is required")
        Long userId,
        @NotBlank(message = "2FA code is required")
        String code
) {}
