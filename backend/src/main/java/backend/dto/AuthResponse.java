package backend.dto;

import backend.model.User;

public record AuthResponse(User user, String token, String message) {
}
